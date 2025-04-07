# conversation_store.py

# In-memory conversation store keyed by session IDs.
conversation_store = {}

def get_session_history(session_id: str):
    """Return the conversation history (list of messages) for the given session."""
    return conversation_store.get(session_id, [])

def append_to_session(session_id: str, message: dict):
    """Append a message (with role and text) to the conversation history for the given session."""
    if session_id not in conversation_store:
        conversation_store[session_id] = []
    conversation_store[session_id].append(message)
