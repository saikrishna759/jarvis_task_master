from app.services import searchreservation_service

async def execute(payload: dict):
    result = await searchreservation_service.execute(payload)
    return result
