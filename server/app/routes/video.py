from fastapi import APIRouter, HTTPException
from app.controllers import video_controller

router = APIRouter()

@router.post("/play")
async def play_video(payload: dict):
    result = await video_controller.play_video(payload)
    if not result:
        raise HTTPException(status_code=400, detail="Unable to process video playback")
    return result
