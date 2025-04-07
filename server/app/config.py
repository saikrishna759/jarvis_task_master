import os
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = "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"
BING_API_KEY = os.getenv("BING_API_KEY")
TWILIO_ACCOUNT_SID = "ACf15fd0614d25f911b10a128c4b1f01ba"
TWILIO_AUTH_TOKEN = "f76bb7fba6720bd070e94d9b832b8dca"
TWILIO_WHATSAPP_FROM = "whatsapp:+14155238886"
GMAIL_CREDENTIALS_PATH = os.getenv("GMAIL_TOKEN_PATH")
GMAIL_TOKEN_PATH = r"C:\Users\saisa\OneDrive\Desktop\personal projects\Jarvis_Task_Master\server\app\services\token_gmail.json"
SPOTIFY_CLIENT_ID = "e6e49454b9a64bedb064e3bbeb82c5b1"
SPOTIFY_CLIENT_SECRET = "290ebe457fc74daa8f85acfd65425b21"
SPOTIFY_REDIRECT_URI = "http://localhost:8888/callback"
CALENDAR_TOKEN_PATH = r"C:\Users\saisa\OneDrive\Desktop\personal projects\Jarvis_Task_Master\server\app\services\token.json"