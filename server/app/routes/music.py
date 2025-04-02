from fastapi import APIRouter
from app.controllers import music_controller

router = APIRouter()

@router.post("/play")
async def play_music(payload: dict):
    return await music_controller.play_music(payload)
