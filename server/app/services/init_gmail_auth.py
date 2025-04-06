import os
import webbrowser
from google_auth_oauthlib.flow import InstalledAppFlow
from dotenv import load_dotenv

load_dotenv()

SCOPES = ["https://www.googleapis.com/auth/gmail.modify"]
CREDENTIALS_PATH = os.getenv("GMAIL_CREDENTIALS_PATH")
TOKEN_PATH = os.getenv("GMAIL_TOKEN_PATH")

def run_oauth():
    # Force it to use Firefox
    webbrowser.register('firefox', None, webbrowser.GenericBrowser('/usr/bin/firefox'))
    flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_PATH, SCOPES)
    creds = flow.run_local_server(port=8080, open_browser=True)
    with open(TOKEN_PATH, "w") as token:
        token.write(creds.to_json())
    print(f"Gmail OAuth token saved to {TOKEN_PATH}")

if __name__ == "__main__":
    run_oauth()
