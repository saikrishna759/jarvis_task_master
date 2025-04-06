from app.services import calendar_service

async def create_event(payload: dict):
    return await calendar_service.create_event(payload)

async def get_today_events():
    return await calendar_service.get_today_events()
