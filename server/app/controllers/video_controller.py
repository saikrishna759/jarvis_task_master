# server/app/controllers/video_controller.py
from app.services import video_service

async def play_video(payload: dict):
    result = await video_service.get_video_url(payload)
    return result
