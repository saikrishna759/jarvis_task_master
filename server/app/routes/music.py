# from fastapi import APIRouter
# from app.controllers import music_controller

# router = APIRouter()

# @router.post("/play")
# async def play_music(payload: dict):
#     return await music_controller.play_music(payload)

from fastapi import APIRouter, Request, Response
from fastapi.responses import StreamingResponse
import aiohttp
import asyncio

router = APIRouter()

@router.post("/play")
async def play_music(payload: dict):
    from app.services.music_service import play_music
    return await play_music(payload)

@router.get("/stream")
async def stream_music(request: Request, url: str):
    headers = {}

    # Pass Range header (for audio playback)
    if "range" in request.headers:
        headers["Range"] = request.headers["range"]

    # Spoof critical headers that GoogleVideo expects
    headers.update({
        "User-Agent": request.headers.get("user-agent", "Mozilla/5.0"),
        "Referer": "https://www.youtube.com/",
        "Origin": "https://www.youtube.com"
    })

    async with aiohttp.ClientSession() as session:
        async with session.get(url, headers=headers) as res:
            if res.status != 200 and res.status != 206:
                return {"error": f"Failed to fetch video: status {res.status}"}

            return StreamingResponse(
                res.content.iter_chunked(1024 * 64),
                status_code=res.status,
                headers={
                    "Content-Length": res.headers.get("Content-Length", "0"),
                    "Content-Type": res.headers.get("Content-Type", "audio/webm"),
                    "Accept-Ranges": "bytes",
                    "Content-Range": res.headers.get("Content-Range", "")
                }
            )