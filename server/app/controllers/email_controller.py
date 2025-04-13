from app.services import email_service

async def read_emails(payload: dict):
    result = await email_service.read_emails(payload)
    return result
