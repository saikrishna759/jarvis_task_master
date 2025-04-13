from fastapi import APIRouter
from app.controllers import email_controller

router = APIRouter()

@router.post("/read")
async def read_emails(payload: dict):
    return await email_controller.read_emails(payload)
