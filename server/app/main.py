from fastapi import FastAPI
from app.routes import gpt4, email, calendar, music, websearch, whatsapp, searchreservation

app = FastAPI(title="Jarvis Task Manager API")

app.include_router(gpt4.router, prefix="/api/gpt4")
app.include_router(email.router, prefix="/api/email")
app.include_router(calendar.router, prefix="/api/calendar")
app.include_router(music.router, prefix="/api/music")
app.include_router(websearch.router, prefix="/api/websearch")
app.include_router(whatsapp.router, prefix="/api/whatsapp")
app.include_router(searchreservation.router, prefix="/api/searchreservation")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
