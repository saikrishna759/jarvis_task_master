# from google.oauth2.credentials import Credentials
# from googleapiclient.discovery import build
# from app.config import CALENDAR_TOKEN_PATH

# SCOPES = ['https://www.googleapis.com/auth/calendar']

# async def create_event(payload: dict):
#     try:
#         creds = Credentials.from_authorized_user_file(CALENDAR_TOKEN_PATH, SCOPES)
#         service = build("calendar", "v3", credentials=creds)
#         event = {
#             "summary": payload.get("title"),
#             "start": {
#                 "dateTime": f"{payload.get('date')}T{payload.get('time')}:00",
#                 "timeZone": "UTC"
#             },
#             "end": {
#                 "dateTime": f"{payload.get('date')}T{payload.get('time')}:00",
#                 "timeZone": "UTC"
#             }
#         }
#         event = service.events().insert(calendarId="primary", body=event).execute()
#         return {"status": "success", "data": event}
#     except Exception as e:
#         return {"status": "error", "data": str(e)}

from datetime import datetime, timedelta
import pytz
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from app.config import CALENDAR_TOKEN_PATH

SCOPES = ['https://www.googleapis.com/auth/calendar']


async def get_today_events():
    try:
        creds = Credentials.from_authorized_user_file(CALENDAR_TOKEN_PATH, SCOPES)
        service = build("calendar", "v3", credentials=creds)

        now = datetime.utcnow().isoformat() + "Z"
        print(now)
        end_of_day = (datetime.utcnow() + timedelta(days=1)).isoformat() + "Z"

        events_result = service.events().list(
            calendarId='primary',
            timeMin=now,
            timeMax=end_of_day,
            singleEvents=True,
            orderBy='startTime'
        ).execute()
        print(events_result)

        events = events_result.get('items', [])
        return {"status": "success", "events": events}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    
async def get_events_for_date(payload: dict):
    try:
        date_str = payload.get("date")  # Expecting 'YYYY-MM-DD'
        if not date_str:
            return {"status": "error", "message": "Missing 'date' in payload."}

        tz = pytz.timezone("America/Chicago")
        day_start = tz.localize(datetime.strptime(date_str, "%Y-%m-%d"))
        day_end = day_start + timedelta(days=1)

        creds = Credentials.from_authorized_user_file(CALENDAR_TOKEN_PATH, SCOPES)
        service = build("calendar", "v3", credentials=creds)

        events_result = service.events().list(
            calendarId='primary',
            timeMin=day_start.isoformat(),
            timeMax=day_end.isoformat(),
            singleEvents=True,
            orderBy='startTime'
        ).execute()

        events = events_result.get('items', [])
        return {"status": "success", "events": events}
    except Exception as e:
        return {"status": "error", "message": str(e)}


async def create_event(payload: dict):
    try:
        creds = Credentials.from_authorized_user_file(CALENDAR_TOKEN_PATH, SCOPES)
        service = build("calendar", "v3", credentials=creds)

        start_time = f"{payload['date']}T{payload['time']}:00"
        event = {
            "summary": payload["title"],
            "start": {
                "dateTime": start_time,
                "timeZone": "America/Chicago"
            },
            "end": {
                "dateTime": start_time,
                "timeZone": "America/Chicago"
            }
        }

        created_event = service.events().insert(calendarId="primary", body=event).execute()
        return { "status": "success", "event": created_event }

    except Exception as e:
        return { "status": "error", "message": str(e) }

