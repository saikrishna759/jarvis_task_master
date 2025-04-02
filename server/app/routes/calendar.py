from fastapi import APIRouter
from app.controllers import calendar_controller

router = APIRouter()

@router.post("/create")
async def create_event(payload: dict):
    return await calendar_controller.create_event(payload)
