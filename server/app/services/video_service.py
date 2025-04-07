import asyncio
from ytmusicapi import YTMusic
from googleapiclient.discovery import build


# Initialize YTMusic (no auth needed for public search)
ytmusic = YTMusic()

async def get_video_url(payload):
    title = payload.get("title", "").strip()


    api_key = "AIzaSyC6USMIvOs0ZTIXLEkKZoPlj5QpN5scxsU"

    youtube = build('youtube', 'v3', developerKey=api_key)

    request = youtube.search().list(
        q=title,
        part='snippet',
        type='video',
        maxResults=3
    )

    response = request.execute()
    if not response:
        return {
                "status": "error",
                "message": "Could not find a valid videoId in search result."
            }

    item = response['items'][0]
    title = item['snippet']['title']
    video_id = item['id']['videoId']
    url = f"https://www.youtube.com/embed/{video_id}?autoplay=1"
    
    return {
        "status": "success",
        "video_url": url,
        "title": title
    }


# async def get_video_url(payload: dict):
#     title = payload.get("title", "").strip()
#     if not title:
#         # Return an error or fallback to a default embed
#         return {
#             "status": "error",
#             "message": "No title provided for video search."
#         }

#     # Search for "videos" matching the query
#     print(title)
#     results = ytmusic.search(title, filter="videos", limit=1)
#     if not results:
#         return {
#             "status": "error",
#             "message": f"No video results found for '{title}'."
#         }

#     # Grab the first search result
#     video = results[0]
#     video_id = video.get("videoId")
#     if not video_id:
#         return {
#             "status": "error",
#             "message": "Could not find a valid videoId in search result."
#         }

#     # Construct a YouTube embed URL with autoplay
#     embed_url = f"https://www.youtube.com/embed/{video_id}?autoplay=1"
#     title = video.get("title", title)

#     return {
#         "status": "success",
#         "video_url": embed_url,
#         "title": title
#     }
