from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from email.mime.text import MIMEText
import os, base64
from app.config import GMAIL_TOKEN_PATH, GMAIL_CREDENTIALS_PATH
from app.services.openai_service import generate_followup_email 
from app.conversation_store import append_to_session  # Import our conversation store helper


# Use the "modify" scope to read and write emails.
SCOPES = ["https://www.googleapis.com/auth/gmail.modify"]

def get_gmail_service():
    creds = None
    if os.path.exists(GMAIL_TOKEN_PATH):
        creds = Credentials.from_authorized_user_file(GMAIL_TOKEN_PATH, SCOPES)
    else:
        flow = InstalledAppFlow.from_client_secrets_file(GMAIL_CREDENTIALS_PATH, SCOPES)
        creds = flow.run_local_server(port=0)
        with open(GMAIL_TOKEN_PATH, "w") as token:
            token.write(creds.to_json())
    return build("gmail", "v1", credentials=creds)

def create_message(sender, to, subject, body_text):
    message = MIMEText(body_text)
    message["to"] = to
    message["from"] = sender
    message["subject"] = subject
    raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
    return {"raw": raw}

def get_decoded_body(data):
    """
    Decodes a base64url encoded string.
    """
    if data:
        # Replace URL-safe characters
        data = data.replace('-', '+').replace('_', '/')
        try:
            decoded_bytes = base64.urlsafe_b64decode(data)
            return decoded_bytes.decode('utf-8', errors='ignore')
        except Exception as e:
            return ""
    return ""

def get_full_body(payload):
    """
    Extracts the full plain-text body from an email message payload.
    If the message is multipart, attempts to find the text/plain part.
    """
    if 'parts' in payload:
        for part in payload['parts']:
            if part.get("mimeType") == "text/plain":
                return get_decoded_body(part.get("body", {}).get("data", ""))
        # Fallback: if no text/plain is found, return first part's body.
        return get_decoded_body(payload['parts'][0].get("body", {}).get("data", ""))
    else:
        return get_decoded_body(payload.get("body", {}).get("data", ""))

async def read_emails(payload: dict):
    try:
        service = get_gmail_service()
        results = service.users().messages().list(userId="me", labelIds=["INBOX"], maxResults=10).execute()
        messages = results.get("messages", [])

        emails = []
        for msg in messages:
            msg_data = service.users().messages().get(userId="me", id=msg["id"], format="full").execute()
            headers = msg_data["payload"]["headers"]
            subject = next((h["value"] for h in headers if h["name"] == "Subject"), "(No Subject)")
            sender = next((h["value"] for h in headers if h["name"] == "From"), "")
            date = next((h["value"] for h in headers if h["name"] == "Date"), "")
            # Instead of snippet, extract the full plain-text body.
            full_body = get_full_body(msg_data["payload"])
            emails.append({
                "subject": subject,
                "from": sender,
                "date": date,
                "snippet": full_body
            })

        session_id = payload.get("session_id", "default")
        summary = "Emails: " + ", ".join([email["snippet"][:50] for email in emails])
        append_to_session(session_id, {"role": "assistant", "text": summary})

        return {"status": "success", "data": emails}
    except Exception as e:
        return {"status": "error", "data": str(e)}

async def send_followup_email(payload: dict):
    try:
        original_email = payload.get("original_email", "")
        prompt = payload.get("prompt", "")
        recipient = payload.get("to")

        # Generate follow-up email content using your OpenAI service.
        followup_text = await generate_followup_email(original_email, prompt)

        service = get_gmail_service()
        message = create_message("me", recipient, "Follow-Up Regarding Our Previous Discussion", followup_text)

        # Send the email
        send_message = service.users().messages().send(userId="me", body=message).execute()

        return {
            "status": "success",
            "message": followup_text,
            "id": send_message.get("id")
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
