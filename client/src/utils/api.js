export async function interpretVoiceCommand(command) {
  const response = await fetch("http://localhost:8000/api/gpt4/interpret", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command })
  });
  return response.json();
}
