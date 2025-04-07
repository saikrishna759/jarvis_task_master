# from app.services import openai_service

# async def interpret_command(command: str):
#     response = await openai_service.generate_interpretation(command)
#     return response


from app.services.openai_service import generate_interpretation

async def interpret_command(command: str, context: dict = None):
    return await generate_interpretation(command, context)
