from twilio.rest import Client
from app.config import TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM

async def send_whatsapp(number: str, message: str):
    try:
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        msg = client.messages.create(
            body=message,
            from_=TWILIO_WHATSAPP_FROM,
            to=f"whatsapp:{number}"
        )
        return {"status": "success", "data": {"sid": msg.sid, "status": msg.status}}
    except Exception as e:
        return {"status": "error", "data": str(e)}
