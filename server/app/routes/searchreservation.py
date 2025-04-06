from fastapi import APIRouter, HTTPException
from app.controllers import searchreservation_controller

router = APIRouter()

@router.post("/execute")
async def execute_reservation(payload: dict):
    result = await searchreservation_controller.execute(payload)
    return {"result": result}
