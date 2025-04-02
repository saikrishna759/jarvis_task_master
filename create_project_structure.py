import os

files = {
    # FRONTEND FILES
    "client/package.json": r'''{
  "name": "client",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "react-scripts": "5.0.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test"
  }
}''',

    "client/public/index.html": r'''<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Jarvis Task Manager</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
''',

    # (Place your background image "jarvis-bg.jpg" in client/public/images/)
    # No file creation for the image is done by this script.

    "client/src/index.js": r'''import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/main.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
''',

    "client/src/App.js": r'''import React from 'react';
import VoiceAssistant from './components/VoiceAssistant';
import EmailReader from './components/EmailReader';
import MusicPlayer from './components/MusicPlayer';
import CalendarEvent from './components/CalendarEvent';
import SearchReservation from './components/SearchReservation';
import WebSearch from './components/WebSearch';

function App() {
  return (
    <div className="app-container">
      <h1>Jarvis Task Manager</h1>
      <VoiceAssistant />
      <EmailReader />
      <MusicPlayer />
      <CalendarEvent />
      <SearchReservation />
      <WebSearch />
    </div>
  );
}

export default App;
''',

    "client/src/styles/main.css": r'''@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500&display=swap');

html, body {
  margin: 0;
  padding: 0;
  /* Layer a semi-transparent gradient over your background image */
  background: 
    linear-gradient(rgba(1, 10, 19, 0.6), rgba(1, 10, 19, 0.6)),
    url('/images/jarvis-bg.jpg') no-repeat center center fixed;
  background-size: cover;
  background-blend-mode: multiply;
  color: #00e5ff;
  font-family: 'Orbitron', sans-serif;
  overflow-x: hidden;
}

.app-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem;
}

h1 {
  font-size: 3rem;
  margin-bottom: 1.5rem;
  text-shadow: 0 0 12px #0ff;
}

h2 {
  font-size: 1.5rem;
  text-shadow: 0 0 5px #0ff;
  margin-bottom: 0.5rem;
}

.jarvis-panel {
  background: rgba(0, 229, 255, 0.08);
  border: 1px solid #00e5ff;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  width: 80%;
  max-width: 600px;
  box-shadow: 0 0 20px #00e5ff;
  transition: transform 0.3s;
}

.jarvis-panel:hover {
  transform: scale(1.02);
}

button {
  background: transparent;
  color: #00e5ff;
  border: 2px solid #00e5ff;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  font-family: 'Orbitron', sans-serif;
  text-transform: uppercase;
  margin-top: 0.5rem;
  transition: box-shadow 0.3s, transform 0.3s;
}

button:hover {
  box-shadow: 0 0 10px #00e5ff;
  transform: scale(1.05);
}

input {
  background: transparent;
  border: 1px solid #00e5ff;
  color: #00e5ff;
  padding: 0.5rem;
  font-family: 'Orbitron', sans-serif;
  border-radius: 5px;
  outline: none;
}

ul {
  list-style: none;
  padding: 0;
}
''',

    "client/src/hooks/useSpeech.js": r'''import { useState, useEffect } from 'react';

export default function useSpeech() {
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported in this browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        interimTranscript += event.results[i][0].transcript;
      }
      setTranscript(interimTranscript);
    };
    
    if (listening) {
      recognition.start();
    } else {
      recognition.stop();
    }
    
    return () => recognition.stop();
  }, [listening]);

  return { transcript, listening, setListening };
}
''',

    "client/src/utils/api.js": r'''export async function interpretVoiceCommand(command) {
  const response = await fetch('/api/gpt4/interpret', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command })
  });
  return response.json();
}

export async function performWebSearch(query) {
  const response = await fetch('/api/websearch/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: query })
  });
  return response.json();
}

export async function sendWhatsappMessage(to, message) {
  const response = await fetch('/api/whatsapp/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, message })
  });
  return response.json();
}
''',

    "client/src/components/VoiceAssistant.js": r'''import React, { useEffect, useState } from 'react';
import useSpeech from '../hooks/useSpeech';
import { interpretVoiceCommand, performWebSearch, sendWhatsappMessage } from '../utils/api';

function VoiceAssistant() {
  const { transcript, listening, setListening } = useSpeech();
  const [lastCommand, setLastCommand] = useState("");

  // Task functions
  const readEmails = () => {
    console.log("Executing: Read Emails");
    // TODO: Call your email API integration.
  };

  const playMusic = () => {
    console.log("Executing: Play Music");
    // TODO: Call your music player integration.
  };

  const createCalendarEvent = () => {
    console.log("Executing: Create Calendar Event");
    // TODO: Call your calendar API integration.
  };

  const searchReservation = () => {
    console.log("Executing: Search/Reservation");
    // TODO: Call your reservation integration.
  };

  const executeWebSearch = (query) => {
    console.log(`Executing: Web Search for "${query}"`);
    performWebSearch(query)
      .then(res => console.log('WebSearch results:', res.result))
      .catch(err => console.error(err));
  };

  const executeWhatsApp = (number, message) => {
    console.log(`Executing: Send WhatsApp message to ${number} with message: "${message}"`);
    sendWhatsappMessage(number, message)
      .then(res => console.log('WhatsApp response:', res))
      .catch(err => console.error(err));
  };

  // Process voice command using GPT-4
  const handleVoiceCommand = async (command) => {
    try {
      const result = await interpretVoiceCommand(command);
      console.log("GPT-4 Interpretation:", result);
      // Expected result: { task: "task_name", arguments: { ... } }
      switch (result.task) {
        case 'read_emails':
          readEmails();
          break;
        case 'play_music':
          playMusic();
          break;
        case 'create_calendar_event':
          createCalendarEvent();
          break;
        case 'search_reservation':
          searchReservation();
          break;
        case 'websearch':
          if (result.arguments && result.arguments.query) {
            executeWebSearch(result.arguments.query);
          } else {
            console.error("Missing query for websearch");
          }
          break;
        case 'send_whatsapp':
          if (result.arguments && result.arguments.number && result.arguments.message) {
            executeWhatsApp(result.arguments.number, result.arguments.message);
          } else {
            console.error("Missing arguments for WhatsApp");
          }
          break;
        default:
          console.log("Unrecognized task:", result.task);
      }
    } catch (error) {
      console.error("Error interpreting voice command:", error);
    }
  };

  useEffect(() => {
    if (transcript && transcript.trim() !== "" && transcript !== lastCommand) {
      setLastCommand(transcript);
      handleVoiceCommand(transcript);
    }
  }, [transcript]);

  return (
    <div className="jarvis-panel">
      <h2>Voice Assistant</h2>
      <p>Listening for commands...</p>
      <p><strong>Transcript:</strong> {transcript}</p>
      <button onClick={() => setListening(!listening)}>
        {listening ? 'Stop Listening' : 'Start Listening'}
      </button>
    </div>
  );
}

export default VoiceAssistant;
''',

    "client/src/components/EmailReader.js": r'''import React from 'react';

function EmailReader() {
  return (
    <div className="jarvis-panel">
      <h2>Email Reader</h2>
      <p>Emails will appear here.</p>
    </div>
  );
}

export default EmailReader;
''',

    "client/src/components/MusicPlayer.js": r'''import React from 'react';

function MusicPlayer() {
  return (
    <div className="jarvis-panel">
      <h2>Music Player</h2>
      <p>Now playing: [Track Name]</p>
    </div>
  );
}

export default MusicPlayer;
''',

    "client/src/components/CalendarEvent.js": r'''import React from 'react';

function CalendarEvent() {
  return (
    <div className="jarvis-panel">
      <h2>Calendar Event</h2>
      <p>Calendar events will be displayed here.</p>
    </div>
  );
}

export default CalendarEvent;
''',

    "client/src/components/SearchReservation.js": r'''import React from 'react';

function SearchReservation() {
  return (
    <div className="jarvis-panel">
      <h2>Search/Reservation</h2>
      <p>Reservation status or search results will appear here.</p>
    </div>
  );
}

export default SearchReservation;
''',

    "client/src/components/WebSearch.js": r'''import React, { useState } from 'react';
import { performWebSearch } from '../utils/api';

function WebSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    try {
      const res = await performWebSearch(query);
      setResults(res.result);
    } catch (error) {
      console.error("Web search error:", error);
    }
  };

  return (
    <div className="jarvis-panel">
      <h2>Web Search</h2>
      <input
        type="text"
        placeholder="Enter search query..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
      <ul>
        {results.map((item, idx) => <li key={idx}>{item}</li>)}
      </ul>
    </div>
  );
}

export default WebSearch;
''',

    # BACKEND FILES
    "server/app/__init__.py": "",
    "server/app/main.py": r'''from fastapi import FastAPI
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
''',

    "server/app/config.py": r'''import os
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
BING_API_KEY = os.getenv("BING_API_KEY")
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_WHATSAPP_FROM = os.getenv("TWILIO_WHATSAPP_FROM")
''',

    "server/app/routes/__init__.py": "",
    "server/app/routes/gpt4.py": r'''from fastapi import APIRouter, HTTPException
from app.controllers import gpt4_controller

router = APIRouter()

@router.post("/interpret")
async def interpret_command(payload: dict):
    command = payload.get("command", "")
    if not command:
        raise HTTPException(status_code=400, detail="No command provided")
    result = await gpt4_controller.interpret_command(command)
    return result
''',

    "server/app/routes/email.py": r'''from fastapi import APIRouter
from app.controllers import email_controller

router = APIRouter()

@router.post("/read")
async def read_emails(payload: dict):
    return await email_controller.read_emails(payload)
''',

    "server/app/routes/calendar.py": r'''from fastapi import APIRouter
from app.controllers import calendar_controller

router = APIRouter()

@router.post("/create")
async def create_event(payload: dict):
    return await calendar_controller.create_event(payload)
''',

    "server/app/routes/music.py": r'''from fastapi import APIRouter
from app.controllers import music_controller

router = APIRouter()

@router.post("/play")
async def play_music(payload: dict):
    return await music_controller.play_music(payload)
''',

    "server/app/routes/websearch.py": r'''from fastapi import APIRouter, HTTPException
from app.controllers import websearch_controller

router = APIRouter()

@router.post("/search")
async def search_web(payload: dict):
    query = payload.get("text", "")
    if not query:
        raise HTTPException(status_code=400, detail="No search query provided")
    result = await websearch_controller.search(query)
    return {"result": result}
''',

    "server/app/routes/whatsapp.py": r'''from fastapi import APIRouter, HTTPException
from app.controllers import whatsapp_controller

router = APIRouter()

@router.post("/send")
async def send_whatsapp(payload: dict):
    number = payload.get("to")
    message = payload.get("message")
    if not (number and message):
        raise HTTPException(status_code=400, detail="Number or message missing")
    result = await whatsapp_controller.send_message(number, message)
    return {"result": result}
''',

    "server/app/routes/searchreservation.py": r'''from fastapi import APIRouter, HTTPException
from app.controllers import searchreservation_controller

router = APIRouter()

@router.post("/execute")
async def execute_reservation(payload: dict):
    result = await searchreservation_controller.execute(payload)
    return {"result": result}
''',

    "server/app/controllers/__init__.py": "",
    "server/app/controllers/gpt4_controller.py": r'''from app.services import openai_service

async def interpret_command(command: str):
    response = await openai_service.generate_interpretation(command)
    return response
''',

    "server/app/controllers/email_controller.py": r'''from app.services import email_service

async def read_emails(payload: dict):
    result = await email_service.read_emails(payload)
    return result
''',

    "server/app/controllers/calendar_controller.py": r'''from app.services import calendar_service

async def create_event(payload: dict):
    result = await calendar_service.create_event(payload)
    return result
''',

    "server/app/controllers/music_controller.py": r'''from app.services import music_service

async def play_music(payload: dict):
    result = await music_service.play_music(payload)
    return result
''',

    "server/app/controllers/websearch_controller.py": r'''from app.services import websearch_service

async def search(query: str):
    result = await websearch_service.search(query)
    return result
''',

    "server/app/controllers/whatsapp_controller.py": r'''from app.services import whatsapp_service

async def send_message(number: str, message: str):
    result = await whatsapp_service.send_whatsapp(number, message)
    return result
''',

    "server/app/controllers/searchreservation_controller.py": r'''from app.services import searchreservation_service

async def execute(payload: dict):
    result = await searchreservation_service.execute(payload)
    return result
''',

    "server/app/services/__init__.py": "",
    "server/app/services/openai_service.py": r'''import asyncio
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
''',

    "server/app/services/email_service.py": r'''async def read_emails(payload: dict):
    return {"status": "success", "data": "Emails have been read."}
''',

    "server/app/services/calendar_service.py": r'''async def create_event(payload: dict):
    return {"status": "success", "data": "Calendar event created."}
''',

    "server/app/services/music_service.py": r'''async def play_music(payload: dict):
    return {"status": "success", "data": "Music started playing."}
''',

    "server/app/services/websearch_service.py": r'''import httpx
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
''',

    "server/app/services/whatsapp_service.py": r'''from twilio.rest import Client
from app.config import TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM

async def send_whatsapp(number: str, message: str):
    client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    msg = client.messages.create(
        body=message,
        from_=TWILIO_WHATSAPP_FROM,
        to=f"whatsapp:{number}"
    )
    return {"sid": msg.sid, "status": msg.status}
''',

    "server/app/services/searchreservation_service.py": r'''async def execute(payload: dict):
    return {"status": "success", "data": "Reservation completed."}
''',

    "server/requirements.txt": r'''fastapi
uvicorn
httpx
python-dotenv
twilio
openai
''',

    "server/Dockerfile": r'''FROM python:3.9-slim
WORKDIR /app
COPY . /app
RUN pip install --upgrade pip && pip install -r requirements.txt
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
'''
}

def create_file(filepath, content):
    directory = os.path.dirname(filepath)
    if directory and not os.path.exists(directory):
        os.makedirs(directory, exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Created: {filepath}")

def main():
    for path, content in files.items():
        create_file(path, content)

if __name__ == "__main__":
    main()
