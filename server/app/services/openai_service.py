import asyncio
import openai
from app.config import OPENAI_API_KEY

openai.api_key = OPENAI_API_KEY

async def generate_interpretation(command: str):
    response = await asyncio.to_thread(
        openai.ChatCompletion.create,
        model="gpt-4",
        messages=[{"role": "user", "content": command}],
        max_tokens=150
    )
    interpretation = response['choices'][0]['message']['content'].strip()
    import json
    try:
        return json.loads(interpretation)
    except Exception as e:
        return {"task": "error", "arguments": {"error": str(e), "raw": interpretation}}
