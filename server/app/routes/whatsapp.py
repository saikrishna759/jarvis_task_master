from fastapi import APIRouter, HTTPException
from app.controllers import whatsapp_controller

router = APIRouter()

@router.post("/send")
async def send_whatsapp(payload: dict):
    number = payload.get("to")
    message = payload.get("message")
    if not (number and message):
        raise HTTPException(status_code=400, detail="Number or message missing")
    result = await whatsapp_controller.send_message(number, message)
    return {"result": result}
