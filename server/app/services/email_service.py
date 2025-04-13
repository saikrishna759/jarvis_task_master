import imaplib
import email
from email.header import decode_header

from app.config import GMAIL_USER, GMAIL_PASS

def decode_mime_words(s):
    decoded = decode_header(s)
    return " ".join(
        str(t[0], t[1] if t[1] is not None else "utf-8") if isinstance(t[0], bytes) else t[0]
        for t in decoded
    )

async def read_emails(payload: dict):
    try:
        mail = imaplib.IMAP4_SSL("imap.gmail.com")
        mail.login(GMAIL_USER, GMAIL_PASS)
        mail.select("inbox")
        status, data = mail.search(None, '(UNSEEN)')
        email_ids = data[0].split()
        emails = []
        for e_id in email_ids:
            status, msg_data = mail.fetch(e_id, "(RFC822)")
            for response_part in msg_data:
                if isinstance(response_part, tuple):
                    msg = email.message_from_bytes(response_part[1])
                    subject = decode_mime_words(msg.get("Subject", ""))
                    from_ = decode_mime_words(msg.get("From", ""))
                    date = msg.get("Date", "")
                    emails.append({
                        "subject": subject,
                        "from": from_,
                        "date": date
                    })
        mail.logout()
        return {"status": "success", "data": emails}
    except Exception as e:
        return {"status": "error", "data": str(e)}
