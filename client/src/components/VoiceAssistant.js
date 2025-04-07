import React, { useEffect, useState } from "react";
import useSpeech from "../hooks/useSpeech";
import { interpretVoiceCommand } from "../utils/api";

const API_BASE = "http://localhost:8000";

function VoiceAssistant() {
  const { transcript, listening, setListening } = useSpeech();
  const [interpretation, setInterpretation] = useState(null);
  const [taskResult, setTaskResult] = useState(null);
  const [lastCommand, setLastCommand] = useState("");
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [spokenWords, setSpokenWords] = useState([]);
  const [spokenIndex, setSpokenIndex] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [awaitingInput, setAwaitingInput] = useState(false);


  const taskEndpoints = {
    read_emails: `${API_BASE}/api/email/read`,
    send_followup_email: `${API_BASE}/api/email/followup`,
    play_music: `${API_BASE}/api/music/play`,
    create_calendar_event: `${API_BASE}/api/calendar/create`,
    search_reservation: `${API_BASE}/api/searchreservation/execute`,
    websearch: `${API_BASE}/api/websearch/search`,
    send_whatsapp: `${API_BASE}/api/whatsapp/send`,
    get_today_schedule: `${API_BASE}/api/calendar/today`,
    get_events_for_date: `${API_BASE}/api/calendar/events`,
    initiate_expense_tracking: `${API_BASE}/api/plaid/link-token`,
    get_user_expenses: `${API_BASE}/api/plaid/transactions`,
  };


  const performTask = async (task, args) => {
    console.log("🔍 Running performTask for:", task);

    const endpoint = taskEndpoints[task];
    if (!endpoint) return { error: "Unknown task: " + task };

    if (task === "initiate_expense_tracking") {
      console.log("🧠 Triggered initiate_expense_tracking");

      const linkRes = await fetch(`${API_BASE}/api/plaid/link-token`); // <-- GET only
      const linkData = await linkRes.json();
      console.log("🔗 Plaid Link Token:", linkData);

      if (!window.Plaid) {
        console.error("❌ Plaid is not available on window.");
        return;
      }

      if (linkData.link_token) {
        setTaskResult({ task, link_token: linkData.link_token });

        const handler = window.Plaid.create({
          token: linkData.link_token,
          onSuccess: async (public_token, metadata) => {
            console.log("✅ Plaid success!", public_token, metadata);

            const response = await fetch(
              `${API_BASE}/api/plaid/exchange-token`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  public_token,
                  user_id: 1234,
                }),
              }
            );

            const data = await response.json();

            if (data.access_token) {
              localStorage.setItem("plaid_access_token", data.access_token); // ✅ SAVE IT HERE
              alert("✅ Bank account linked successfully!");
            }
          },
          onExit: (err, metadata) => {
            console.warn("🚪 Exited Plaid:", err, metadata);
          },
        });

        handler.open();
      }

      return; // 🛑 STOP HERE — do NOT run the generic fetch below
    } else if (task === "get_user_expenses") {
      console.log("🧠 Triggered get_user_expenses");
      try {
        const access_token = localStorage.getItem("plaid_access_token");
        if (!access_token) {
          setTaskResult({
            task,
            error:
              "No access token found. Please connect your bank account first.",
          });
          return;
        }

        const res = await fetch(`${API_BASE}/api/plaid/transactions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token }),
        });

        const result = await res.json();
        console.log("📊 Transactions result:", result);

        if (Array.isArray(result.transactions)) {
          setTaskResult({ task, transactions: result.transactions });
        } else {
          setTaskResult({ task, error: result.detail || "Unknown error" });
        }

        return result;
      } catch (error) {
        return { error: error.toString() };
      }
    }

    try {
      const method = task === "get_today_schedule" ? "GET" : "POST";
      const fetchOptions = {
        method,
        headers: { "Content-Type": "application/json" },
      };

      if (method === "POST") {
        fetchOptions.body = JSON.stringify(args);
      }

      const response = await fetch(endpoint, fetchOptions);

      const text = await response.text();
      const result = JSON.parse(text);
      if (task === "send_whatsapp" && result.result?.status === "sent") {
        // speakText(`WhatsApp message sent successfully.`);
        setTaskResult({ task, sid: result.result.sid });
      } else if (
        task === "create_calendar_event" &&
        result.status === "success"
      ) {
        setTaskResult({
          task,
          event: result.event,
          status: result.status,
        });
        // speakText(
        //   `Event "${result.event.summary}" has been added at ${new Date(
        //     result.event.start.dateTime
        //   ).toLocaleTimeString()}.`
        // );
      } else if (
        (task === "get_today_schedule" || task === "get_events_for_date") &&
        result.status === "success"
      ) {
        setCalendarEvents(result.events || []);
        setTaskResult({ task });
        readEventsAloud(result.events || []);
      } else if (
        task === "send_followup_email" &&
        result.status === "success"
      ) {
        setTaskResult({ task, message: result.message });
        // speakText(`Follow-up email drafted.`);
      } else if (task === "read_emails" && result.status === "success") {
        console.log("✅ Email Read Data:", result.data); // Add this
        setTaskResult({ task, data: result.data });
      } else {
        setCalendarEvents([]);
        setTaskResult({ ...result, task });
      }
      console.log("GPT Task Result →", result);

      return result;
    } catch (error) {
      return { error: error.toString() };
    }
  };

  const toggleListening = async () => {
    if (listening) {
      setListening(false);
      if (
        transcript &&
        transcript.trim() !== "" &&
        transcript !== lastCommand
      ) {
        setLastCommand(transcript);
        const gptResult = await interpretVoiceCommand(transcript);
        setInterpretation(gptResult);

        if (
          gptResult.task &&
          gptResult.task !== "none" &&
          gptResult.task !== "error"
        ) {
          await performTask(gptResult.task, gptResult.arguments);
        } else if (gptResult.task === "none" && gptResult.arguments?.response) {
          // Show text input field to get user input
          setAwaitingInput(true);
        }
      }
    } else {
      setInterpretation(null);
      setTaskResult(null);
      setCalendarEvents([]);
      setUserInput(""); // Reset input field if restarting
      setAwaitingInput(false); // Hide input when restarting
      setListening(true);
    }
  };


  const readEventsAloud = (events) => {
    if (!("speechSynthesis" in window)) return;

    const synth = window.speechSynthesis;
    let message =
      events.length === 0
        ? "You have no events scheduled for today."
        : `You have ${events.length} events. `;

    const wordList = [];
    events.forEach((event, i) => {
      const title = event.summary || "Untitled Event";
      const time =
        event.start?.dateTime || event.start?.date || "unspecified time";
      const timeStr = event.start?.dateTime
        ? new Date(time).toLocaleTimeString()
        : "All-day";

      const sentence = `Event ${i + 1}: ${title} at ${timeStr}.`;
      wordList.push(...sentence.split(/\s+/));
      message += sentence + " ";
    });

    setSpokenWords(wordList);
    setSpokenIndex(0);

    const utterance = new SpeechSynthesisUtterance(message);

    const speakText = (text) => {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    };

    utterance.onboundary = (event) => {
      if (event.name === "word" || event.charIndex !== undefined) {
        const spoken = utterance.text.slice(0, event.charIndex).trim();
        const words = spoken.split(/\s+/);
        setSpokenIndex(words.length);
      }
    };

    utterance.onend = () => {
      setSpokenIndex(null);
      setSpokenWords([]);
    };

    synth.cancel();
    synth.speak(utterance);
  };

  return (
    <div className="jarvis-panel">
      <h2>Voice Assistant</h2>
      <p>
        <strong>Transcript:</strong> {transcript}
      </p>
      <button onClick={toggleListening}>
        {listening ? "Stop Listening" : "Start Listening"}
      </button>
      {interpretation && (
        <div
          style={{
            marginTop: "1.5rem",
            background: "rgba(0, 229, 255, 0.1)",
            border: "1px solid #00e5ff",
            borderRadius: "12px",
            padding: "1rem",
            color: "#00e5ff",
            boxShadow: "0 0 15px #00e5ff",
            maxWidth: "90%",
            overflowX: "auto",
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          <h3
            style={{
              marginBottom: "0.5rem",
              color: "#00e5ff",
              textShadow: "0 0 5px #00e5ff",
            }}
          >
            🔍 Interpretation:
          </h3>
          <pre style={{ margin: 0 }}>
            {JSON.stringify(interpretation, null, 2)}
          </pre>

          {interpretation.task === "none" &&
            interpretation.arguments?.response &&
            !taskResult && (
              <div style={{ marginTop: "1rem" }}>
                <p style={{ fontStyle: "italic", color: "#ff7b72" }}>
                  🧠 AI Request: {interpretation.arguments.response}
                </p>
              </div>
            )}
        </div>
      )}

      {awaitingInput && (
        <div style={{ marginTop: "1rem", maxWidth: "600px", width: "100%" }}>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Enter follow-up context..."
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "8px",
              border: "1px solid #00e5ff",
              background: "#001a1a",
              color: "#00e5ff",
              fontFamily: "monospace",
              fontSize: "1rem",
              boxShadow: "0 0 10px #00e5ff",
              outline: "none",
            }}
          />
          <button
            onClick={async () => {
              setAwaitingInput(false);
              setInterpretation(null);
              const args = {
                to: "22veda08@gmail.com", // ideally populate dynamically later
                original_email: "Follow-up regarding last conversation",
                prompt: userInput,
              };
              const result = await performTask("send_followup_email", args);
              setTaskResult(result);
            }}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1.5rem",
              background: "#00e5ff",
              color: "#000",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              fontFamily: "Orbitron, sans-serif",
              boxShadow: "0 0 10px #00e5ff",
            }}
          >
            SUBMIT
          </button>
        </div>
      )}

      {/* Music Player */}
      {taskResult?.stream_url && (
        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <h3>🎵 Now Playing: {taskResult.title}</h3>
          {taskResult.thumbnail_url && (
            <img
              src={taskResult.thumbnail_url}
              alt="Song Thumbnail"
              style={{
                width: "250px",
                borderRadius: "10px",
                boxShadow: "0 0 15px #00e5ff",
                marginBottom: "1rem",
              }}
            />
          )}
          <audio
            controls
            autoPlay
            style={{ width: "100%", maxWidth: "500px", marginTop: "1rem" }}
          >
            <source src={taskResult.stream_url} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
      {/* Calendar Events create */}
      {taskResult?.task === "create_calendar_event" &&
        taskResult.status === "success" && (
          <div
            style={{
              marginTop: "2rem",
              padding: "1rem",
              background: "rgba(0,229,255,0.1)",
              border: "1px solid #00e5ff",
              borderRadius: "10px",
              color: "#00e5ff",
              boxShadow: "0 0 12px #00e5ff",
            }}
          >
            ✅ <strong>Event Created:</strong> {taskResult.event.summary} at{" "}
            {new Date(taskResult.event.start.dateTime).toLocaleString()}
          </div>
        )}
      {/* Calendar Events Display */}
      {(taskResult?.task === "get_today_schedule" ||
        taskResult?.task === "get_events_for_date") &&
        calendarEvents.length > 0 && (
          <div style={{ marginTop: "2rem", textAlign: "left" }}>
            <h3 style={{ color: "#00e5ff", textShadow: "0 0 10px #00e5ff" }}>
              📅 Events for the Day
            </h3>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "1rem",
                justifyContent: "center",
                marginTop: "1rem",
              }}
            >
              {calendarEvents.map((event, idx) => {
                const isMeeting = (event.attendees?.length || 0) > 0;
                const time = event.start?.dateTime || event.start?.date;
                const startTime = event.start?.dateTime
                  ? new Date(time).toLocaleTimeString()
                  : "All-day";
                const tileColor = isMeeting ? "#00334e" : "#0b1d2b";
                const borderColor = isMeeting ? "#00ffc3" : "#00b7ff";

                return (
                  <div
                    key={idx}
                    style={{
                      background: tileColor,
                      border: `1.5px solid ${borderColor}`,
                      boxShadow: `0 0 15px ${borderColor}`,
                      borderRadius: "12px",
                      padding: "1rem",
                      width: "300px",
                      color: "#e0f7fa",
                      fontFamily: "Orbitron, sans-serif",
                      transition: "transform 0.3s ease",
                    }}
                  >
                    <h4
                      style={{
                        marginBottom: "0.5rem",
                        color: "#ffffff",
                        textShadow: `0 0 5px ${borderColor}`,
                      }}
                    >
                      {event.summary || "Untitled Event"}
                    </h4>
                    <p>
                      <strong>Time:</strong> {startTime}
                    </p>
                    {event.location && (
                      <p>
                        <strong>Location:</strong> {event.location}
                      </p>
                    )}
                    {isMeeting && (
                      <p style={{ color: "#00ffc3" }}>👥 Meeting</p>
                    )}
                  </div>
                );
              })}
            </div>
            {/* whatsapp text */}
            {taskResult?.task === "send_whatsapp" && (
              <div
                style={{
                  marginTop: "2rem",
                  padding: "1rem",
                  background: "rgba(0,229,255,0.1)",
                  border: "1px solid #00e5ff",
                  borderRadius: "10px",
                  color: "#00e5ff",
                  boxShadow: "0 0 12px #00e5ff",
                }}
              >
                ✅ <strong>Message Sent</strong>
                <br />
                Message SID: {taskResult.sid}
              </div>
            )}
            {/* Highlighted text area */}
            {spokenWords.length > 0 && (
              <div
                style={{
                  marginTop: "2rem",
                  textAlign: "center",
                  padding: "1rem",
                  border: "1px solid #00e5ff",
                  borderRadius: "8px",
                  boxShadow: "0 0 10px #00e5ff",
                  background: "rgba(0, 229, 255, 0.05)",
                  maxWidth: "100%",
                  overflowX: "auto",
                  whiteSpace: "nowrap",
                }}
              >
                {spokenWords.map((word, i) => (
                  <span
                    key={i}
                    style={{
                      display: "inline-block",
                      color: i === spokenIndex ? "#ffffff" : "#00e5ff",
                      fontWeight: i === spokenIndex ? "bold" : "normal",
                      textShadow:
                        i === spokenIndex ? "0 0 10px #ffffff" : "none",
                      marginRight: "0.5rem",
                      fontSize: "1.1rem",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {word}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      {/* Read email */}
      {taskResult?.task === "read_emails" && taskResult.data?.length > 0 && (
        <div
          style={{
            marginTop: "2rem",
            padding: "1rem",
            background: "rgba(0,229,255,0.1)",
            border: "1px solid #00e5ff",
            borderRadius: "10px",
            color: "#00e5ff",
            boxShadow: "0 0 12px #00e5ff",
            maxWidth: "700px",
            fontFamily: "monospace",
          }}
        >
          <h3>📥 Top Emails</h3>
          {taskResult.data.map((email, index) => (
            <div key={index} style={{ marginBottom: "1rem" }}>
              <strong>From:</strong> {email.from}
              <br />
              <strong>Subject:</strong> {email.subject}
              <br />
              <strong>Date:</strong> {email.date}
            </div>
          ))}
        </div>
      )}
      {/* Follow-up Email Display */}
      {taskResult?.task === "send_followup_email" && (
        <div
          style={{
            marginTop: "2rem",
            padding: "1rem",
            background: "rgba(0,229,255,0.1)",
            border: "1px solid #00e5ff",
            borderRadius: "10px",
            color: "#00e5ff",
            boxShadow: "0 0 12px #00e5ff",
            maxWidth: "700px",
            whiteSpace: "pre-wrap",
          }}
        >
          <strong>✉️ Follow-up Email Drafted:</strong>
          <p style={{ marginTop: "1rem", fontFamily: "monospace" }}>
            {taskResult.message}
          </p>
        </div>
      )}
      {taskResult?.task === "get_user_expenses" &&
        taskResult.transactions?.length > 0 && (
          <div
            style={{
              marginTop: "2rem",
              padding: "1rem",
              background: "rgba(0,229,255,0.1)",
              border: "1px solid #00e5ff",
              borderRadius: "10px",
              color: "#00e5ff",
              boxShadow: "0 0 12px #00e5ff",
              maxWidth: "700px",
              fontFamily: "monospace",
            }}
          >
            <h3>💳 Latest Expenses</h3>
            {taskResult.transactions.map((tx, index) => (
              <div key={index} style={{ marginBottom: "1rem" }}>
                <strong>{tx.name}</strong> - ${tx.amount} on {tx.date}
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

export default VoiceAssistant;
