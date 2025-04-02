from fastapi import APIRouter, HTTPException
from app.controllers import websearch_controller

router = APIRouter()

@router.post("/search")
async def search_web(payload: dict):
    query = payload.get("text", "")
    if not query:
        raise HTTPException(status_code=400, detail="No search query provided")
    result = await websearch_controller.search(query)
    return {"result": result}
