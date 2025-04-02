from app.services import websearch_service

async def search(query: str):
    result = await websearch_service.search(query)
    return result
