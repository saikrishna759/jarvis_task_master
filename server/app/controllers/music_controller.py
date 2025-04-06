from app.services import music_service

async def play_music(payload: dict):
    result = await music_service.play_music(payload)
    return result
