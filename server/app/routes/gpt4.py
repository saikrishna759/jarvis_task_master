# from fastapi import APIRouter, HTTPException
# from app.controllers import gpt4_controller

# router = APIRouter()

# @router.post("/interpret")
# async def interpret_command(payload: dict):
#     command = payload.get("command", "")
#     if not command:
#         raise HTTPException(status_code=400, detail="No command provided")
#     result = await gpt4_controller.interpret_command(command)
#     return result

from fastapi import APIRouter, HTTPException
from app.controllers import gpt4_controller

router = APIRouter()

@router.post("/interpret")
async def interpret_command(payload: dict):
    command = payload.get("command", "")
    context = payload.get("context", {})
    if not command:
        raise HTTPException(status_code=400, detail="No command provided")
    
    result = await gpt4_controller.interpret_command(command, context)
    return result
