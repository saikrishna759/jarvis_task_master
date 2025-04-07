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
    "name": "play_video",
    "description": "Play the video of given title. If no title is provided, use the context of conversation history.",
    "parameters": {
        "type": "object",
        "properties": {
            "title": {
                "type": "string",
                "description": "Name of the title",
                "default": ""
            }
        },
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
    # {
    #     "name": "websearch",
    #     "description": "Perform a web search for a query.",
    #     "parameters": {
    #         "type": "object",
    #         "properties": {
    #             "query": {"type": "string", "description": "Search query."}
    #         },
    #         "required": ["query"],
    #         "additionalProperties": False
    #     }
    # },
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
    },
    {
    "name": "send_followup_email",
    "description": "Send a follow-up email to a person based on the context of the last conversation.",
    "parameters": {
        "type": "object",
        "properties": {
            "recipient_email": {
                "type": "string",
                "description": "The email address of the recruiter or interviewer."
            },
            "subject": {
                "type": "string",
                "description": "The subject line for the follow-up email."
            },
            "context": {
                "type": "string",
                "description": "Context from the last interaction, such as interview notes or conversation summary."
            },
            "tone": {
                "type": "string",
                "description": "Tone of the message (e.g. professional, friendly, appreciative).",
                "default": "professional"
            }
        },
        "required": ["recipient_email", "subject", "context"],
        "additionalProperties": False
    }
},
{
        "name": "chat",
        "description": "Provide a conversational, Q&A style response. This is used for general chit-chat or summarizing previous messages.",
        "parameters": {
            "type": "object",
            "properties": {
                "response": {
                    "type": "string",
                    "description": "The chat response."
                }
            },
            "required": ["response"],
            "additionalProperties": False
        }
    }

]

from ..conversation_store import *

async def generate_interpretation(command: str, context: dict = None):
    try:
        messages = []

        # Retrieve session_id from context; default to "default" if not provided.
        session_id = context.get("session_id", "default") if context else "default"
        # Retrieve conversation history from our store.
        history = get_session_history(session_id)
        # Optionally use only the last few messages.
        conversation_text = " | ".join([msg["text"] for msg in history[-10:]])
        
        system_message = (
            "You are an intelligent assistant with short-term memory. "
            "The conversation history is: " + conversation_text + ". "
            # "If the user gives an ambiguous command (e.g., 'play video of previous song'),  use the context (the last played song) to fill in missing details."
            "If the user's command is conversational (e.g., 'can you summarize before the 2nd email?'), "
            "respond in a friendly, conversational tone. If no service is applicable, use the 'chat' function."
            # "understand the current uttterance or user command properly and perform the task based on it"
        )
        messages.append({"role": "system", "content": system_message})
        messages.append({"role": "user", "content": command})
        
        # Debug: Print messages being sent.
        print("System messages sent to GPT:", messages)
        
        response = await openai.ChatCompletion.acreate(
            model=MODEL,
            messages=messages,
            functions=FUNCTIONS,
            function_call="auto"
        )
        message = response["choices"][0]["message"]
        print("GPT Response:", message)
        
        if "function_call" in message:
            func_call = message["function_call"]
            function_name = func_call.get("name")
            try:
                arguments = json.loads(func_call.get("arguments", "{}"))
            except Exception as e:
                arguments = {"error": f"Failed to parse arguments: {str(e)}", "raw": func_call.get("arguments")}
            
            # Append the new command and GPT response to our session history.
            append_to_session(session_id, {"role": "user", "text": command})
            append_to_session(session_id, {"role": "assistant", "text": json.dumps({"task": function_name, "arguments": arguments})})
            arguments['session_id']= session_id
            return {"task": function_name, "arguments": arguments}
        else:
            return {"task": "none", "arguments": {"response": message.get("content", "")}}
    except Exception as e:
        print("Error in generate_interpretation:", e)
        return {"task": "error", "arguments": {"error": str(e)}}

# async def generate_interpretation(command: str, context: dict = None):
#     try:
#         messages = []

#         # Construct system message with context instructions (if any)
#         system_msg = (
#             "You are an intelligent assistant with short-term memory. "
#             "If the user says something ambiguous (e.g., 'play video of previous song'), "
#             "use the context (e.g. last played song) to fill in missing details."
#         )
#         if context and context.get("conversation_history"):
#             system_msg += " Conversation history: " + " | ".join(context["conversation_history"])
#         messages.append({"role": "system", "content": system_msg})
#         messages.append({"role": "user", "content": command})

#         print(messages)

#         response = await openai.ChatCompletion.acreate(
#             model=MODEL,
#             messages=messages,
#             functions=FUNCTIONS,
#             function_call="auto"
#         )
#         message = response["choices"][0]["message"]
        
#         # Print the GPT response to the console for debugging
#         print("GPT Response:", message)
        
#         if "function_call" in message:
#             func_call = message["function_call"]
#             function_name = func_call.get("name")
#             try:
#                 arguments = json.loads(func_call.get("arguments", "{}"))
#             except Exception as e:
#                 arguments = {"error": f"Failed to parse arguments: {str(e)}", "raw": func_call.get("arguments")}
#             return {"task": function_name, "arguments": arguments}
#         else:
#             return {"task": "none", "arguments": {"response": message.get("content", "")}}
#     except Exception as e:
#         print("Error in generate_interpretation:", e)
#         return {"task": "error", "arguments": {"error": str(e)}}

# async def generate_interpretation(command: str):
#     try:
#         response = await openai.ChatCompletion.acreate(
#             model=MODEL,
#             messages=[{"role": "user", "content": command}],
#             functions=FUNCTIONS,  # Note: using "functions" with our flat definitions.
#             function_call="auto"
#         )
#         message = response["choices"][0]["message"]
#         if "function_call" in message:
#             func_call = message["function_call"]
#             function_name = func_call.get("name")
#             try:
#                 arguments = json.loads(func_call.get("arguments", "{}"))
#             except Exception as e:
#                 arguments = {"error": f"Failed to parse arguments: {str(e)}", "raw": func_call.get("arguments")}
#             return {"task": function_name, "arguments": arguments}
#         else:
#             return {"task": "none", "arguments": {"response": message.get("content", "")}}
#     except Exception as e:
#         print("Error in generate_interpretation:", e)
#         return {"task": "error", "arguments": {"error": str(e)}}
    

async def generate_followup_email(recipient_email: str, subject: str, context: str, tone: str = "professional"):
    try:
        response = await openai.ChatCompletion.acreate(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": f"You are an assistant helping draft follow-up emails in a {tone} tone."
                },
                {
                    "role": "user",
                    "content": f"Generate a follow-up email to {recipient_email} with subject '{subject}'. "
                               f"The context of the previous conversation is: {context}"
                }
            ],
            max_tokens=500,
            temperature=0.7
        )
        content = response['choices'][0]['message']['content']
        return {"status": "success", "message": content}
    except Exception as e:
        return {"status": "error", "message": str(e)}
