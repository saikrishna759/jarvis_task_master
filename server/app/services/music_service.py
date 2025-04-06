# # import spotipy
# # from spotipy.oauth2 import SpotifyOAuth
# # from app.config import SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URI

# # SCOPE = "user-modify-playback-state,user-read-playback-state"

# # async def play_music(payload: dict):
# #     try:
# #         sp = spotipy.Spotify(auth_manager=SpotifyOAuth(
# #             client_id=SPOTIFY_CLIENT_ID,
# #             client_secret=SPOTIFY_CLIENT_SECRET,
# #             redirect_uri=SPOTIFY_REDIRECT_URI,
# #             scope=SCOPE
# #         ))
# #         song = payload.get("song")
# #         if song:
# #             results = sp.search(q=song, type="track", limit=1)
# #             if results["tracks"]["items"]:
# #                 track_uri = results["tracks"]["items"][0]["uri"]
# #                 sp.start_playback(uris=[track_uri])
# #                 return {"status": "success", "data": f"Playing {song}"}
# #             else:
# #                 return {"status": "error", "data": "Song not found"}
# #         else:
# #             sp.start_playback()
# #             return {"status": "success", "data": "Resuming playback"}
# #     except Exception as e:
# #         return {"status": "error", "data": str(e)}

# import asyncio
# import subprocess
# from ytmusicapi import YTMusic
# import yt_dlp

# ytmusic = YTMusic()  # No auth needed for basic search

# async def play_music(payload: dict):
#     def _play_music():
#         song = payload.get("song", "")
#         if not song:
#             return {"status": "error", "data": "No song specified."}

#         # Search for the song on YouTube Music
#         results = ytmusic.search(song, filter="songs")
#         if not results:
#             return {"status": "error", "data": "No matching songs found."}

#         video_id = results[0].get("videoId")
#         if not video_id:
#             return {"status": "error", "data": "No videoId found in search result."}

#         url = f"https://music.youtube.com/watch?v={video_id}"

#         # Extract stream URL using yt_dlp
#         ydl_opts = {
#             'format': 'bestaudio',
#             'quiet': True,
#             'default_search': 'ytsearch',
#             'skip_download': True,
#         }

#         try:
#             with yt_dlp.YoutubeDL(ydl_opts) as ydl:
#                 info = ydl.extract_info(url, download=False)
#                 stream_url = info.get('url')
#                 if not stream_url:
#                     return {"status": "error", "data": "Failed to retrieve stream URL."}

#                 # Play in VLC
#                 subprocess.Popen(["vlc", "--intf", "dummy", "--play-and-exit", stream_url])
#                 return {"status": "success", "data": f"Playing '{song}' via VLC."}

#         except Exception as e:
#             return {"status": "error", "data": str(e)}

#     try:
#         result = await asyncio.to_thread(_play_music)
#         return result
#     except Exception as e:
#         return {"status": "error", "data": str(e)}

import asyncio
from ytmusicapi import YTMusic
import yt_dlp

ytmusic = YTMusic()

async def play_music(payload: dict):
    def _play_music():
        song = payload.get("song", "")
        if not song:
            return {"status": "error", "data": "No song specified."}

        results = ytmusic.search(song, filter="songs")
        if not results:
            return {"status": "error", "data": "No matching songs found."}

        video_id = results[0].get("videoId")
        if not video_id:
            return {"status": "error", "data": "No videoId found in search result."}

        url = f"https://music.youtube.com/watch?v={video_id}"

        ydl_opts = {
            'format': 'bestaudio',
            'quiet': True,
            'default_search': 'ytsearch',
            'skip_download': True
        }

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                stream_url = info.get('url')
                if not stream_url:
                    return {"status": "error", "data": "Failed to retrieve stream URL."}
                
                proxy_url = f"http://localhost:8000/api/music/stream?url={stream_url}"
                thumbnail = results[0].get("thumbnails", [{}])[-1].get("url", "")

                return {
                "status": "success",
                "stream_url": stream_url,
                "title": results[0].get("title", song),
                "thumbnail_url": thumbnail
                }

                # return {
                #     "status": "success",
                #     "stream_url": stream_url,
                #     "title": results[0].get("title", song)
                # }

        except Exception as e:
            return {"status": "error", "data": str(e)}

    try:
        result = await asyncio.to_thread(_play_music)
        return result
    except Exception as e:
        return {"status": "error", "data": str(e)}
