from app.services import calendar_service

async def create_event(payload: dict):
    result = await calendar_service.create_event(payload)
    return result
