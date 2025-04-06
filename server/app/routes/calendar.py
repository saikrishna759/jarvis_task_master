from fastapi import APIRouter
from app.controllers import calendar_controller

router = APIRouter()

@router.post("/create")
async def create_event(payload: dict):
    return await calendar_controller.create_event(payload)

@router.get("/today")
async def get_today_schedule():
    return await calendar_controller.get_today_events()

@router.post("/events")
async def get_events_for_date(payload: dict):
    from app.services.calendar_service import get_events_for_date
    return await get_events_for_date(payload)