// client/src/utils/api.js
export async function interpretVoiceCommand(
  command,
  previousTask = null,
  previousArguments = null,
  context = {}
) {
  // For example, use a fixed session ID. Replace with dynamic session management as needed.
  const session_id = "my_unique_session_id";
  const fullContext = {
    session_id,
    // Ensure conversation_history is an array of strings
    conversation_history: context.conversation_history || [],
  };

  const response = await fetch("http://localhost:8000/api/gpt4/interpret", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      command,
      context: fullContext,
    }),
  });
  return response.json();
}


