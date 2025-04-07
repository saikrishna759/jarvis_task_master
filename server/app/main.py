from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import gpt4, email, calendar, music, websearch, whatsapp, searchreservation,video

app = FastAPI(title="Jarvis Task Manager API")

# Enable CORS for your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Adjust as needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(gpt4.router, prefix="/api/gpt4")
app.include_router(email.router, prefix="/api/email")
app.include_router(calendar.router, prefix="/api/calendar")
app.include_router(music.router, prefix="/api/music")
app.include_router(video.router, prefix="/api/video")
app.include_router(websearch.router, prefix="/api/websearch")
app.include_router(whatsapp.router, prefix="/api/whatsapp")
app.include_router(searchreservation.router, prefix="/api/searchreservation")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
