import openai
import json
from app.config import OPENAI_API_KEY

openai.api_key = OPENAI_API_KEY
MODEL = "gpt-4o-mini"  # Adjust as needed

FUNCTIONS = [
    {
        "name": "read_emails",
        "description": "Read the latest unread emails.",
        "parameters": {
            "type": "object",
            "properties": {},
            "required": [],
            "additionalProperties": False
        }
    },
    {
        "name": "play_music",
        "description": "Play music. Provide a song name, or leave empty to resume playback.",
        "parameters": {
            "type": "object",
            "properties": {
                "song": {
                    "type": "string",
                    "description": "Name of the song to play (optional).",
                    "default": ""
                }
            },
            "required": ["song"],
            "additionalProperties": False
        }
    },
    {
    "name": "get_today_schedule",
    "description": "Get a list of events scheduled for today from the user's Google Calendar.",
    "parameters": {
        "type": "object",
        "properties": {},
        "required": [],
        "additionalProperties": False
    }
    },
    {
    "name": "get_events_for_date",
    "description": "Fetch all calendar events for a specific date.",
    "parameters": {
        "type": "object",
        "properties": {
            "date": {
                "type": "string",
                "description": "The date to get events for, in YYYY-MM-DD format."
            }
        },
        "required": ["date"],
        "additionalProperties": False

    }
},
    {
        "name": "create_calendar_event",
        "description": "Create a calendar event with title, date (YYYY-MM-DD), and time (HH:MM).",
        "parameters": {
            "type": "object",
            "properties": {
                "title": {"type": "string", "description": "Event title."},
                "date": {"type": "string", "description": "Date in YYYY-MM-DD format."},
                "time": {"type": "string", "description": "Time in HH:MM format."}
            },
            "required": ["title", "date", "time"],
            "additionalProperties": False
        }
    },
    {
        "name": "search_reservation",
        "description": "Search for a reservation at a restaurant.",
        "parameters": {
            "type": "object",
            "properties": {
                "restaurant": {"type": "string", "description": "Restaurant name."},
                "date": {"type": "string", "description": "Date in YYYY-MM-DD format."},
                "time": {"type": "string", "description": "Time in HH:MM format."},
                "people": {"type": "integer", "description": "Number of people."}
            },
            "required": ["restaurant", "date", "time", "people"],
            "additionalProperties": False
        }
    },
    {
        "name": "websearch",
        "description": "Perform a web search for a query.",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search query."}
            },
            "required": ["query"],
            "additionalProperties": False
        }
    },
    {
        "name": "send_whatsapp",
        "description": "Send a WhatsApp message to a phone number.",
        "parameters": {
            "type": "object",
            "properties": {
                "number": {"type": "string", "description": "Recipient phone number."},
                "message": {"type": "string", "description": "Message to send."}
            },
            "required": ["number", "message"],
            "additionalProperties": False
        }
    }
]

async def generate_interpretation(command: str):
    try:
        response = await openai.ChatCompletion.acreate(
            model=MODEL,
            messages=[{"role": "user", "content": command}],
            functions=FUNCTIONS,  # Note: using "functions" with our flat definitions.
            function_call="auto"
        )
        message = response["choices"][0]["message"]
        if "function_call" in message:
            func_call = message["function_call"]
            function_name = func_call.get("name")
            try:
                arguments = json.loads(func_call.get("arguments", "{}"))
            except Exception as e:
                arguments = {"error": f"Failed to parse arguments: {str(e)}", "raw": func_call.get("arguments")}
            return {"task": function_name, "arguments": arguments}
        else:
            return {"task": "none", "arguments": {"response": message.get("content", "")}}
    except Exception as e:
        print("Error in generate_interpretation:", e)
        return {"task": "error", "arguments": {"error": str(e)}}
