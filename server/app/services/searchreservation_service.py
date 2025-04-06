import requests

async def execute(payload: dict):
    url = "https://api.example.com/reservations"  # Replace with your actual API endpoint.
    try:
        response = requests.post(url, json=payload)
        if response.ok:
            return {"status": "success", "data": response.json()}
        else:
            return {"status": "error", "data": response.text}
    except Exception as e:
        return {"status": "error", "data": str(e)}
