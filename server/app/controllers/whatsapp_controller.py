from app.services import whatsapp_service

async def send_message(number: str, message: str):
    result = await whatsapp_service.send_whatsapp(number, message)
    return result
