import httpx
from app.config import BING_API_KEY

async def search(query: str):
    search_url = "https://api.bing.microsoft.com/v7.0/search"
    headers = {"Ocp-Apim-Subscription-Key": BING_API_KEY}
    params = {"q": query, "textDecorations": True, "textFormat": "HTML"}
    async with httpx.AsyncClient() as client:
        response = await client.get(search_url, headers=headers, params=params)
        response.raise_for_status()
        data = response.json()
    results = []
    if "webPages" in data:
        for item in data["webPages"]["value"]:
            results.append(item.get("snippet", ""))
    return results
