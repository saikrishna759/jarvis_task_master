from app.services import openai_service

async def interpret_command(command: str):
    response = await openai_service.generate_interpretation(command)
    return response
