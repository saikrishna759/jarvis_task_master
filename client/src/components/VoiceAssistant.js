// import React, { useState, useRef } from "react";
// import useSpeech from "../hooks/useSpeech";
// import { interpretVoiceCommand } from "../utils/api";

// const API_BASE = "http://localhost:8000";

// function VoiceAssistant() {
//   const { transcript, listening, setListening } = useSpeech();
//   const [interpretation, setInterpretation] = useState(null);
//   const [taskResult, setTaskResult] = useState(null);
//   const [lastCommand, setLastCommand] = useState("");
//   const [calendarEvents, setCalendarEvents] = useState([]);
//   const [spokenWords, setSpokenWords] = useState([]);
//   const [spokenIndex, setSpokenIndex] = useState(null);
//   const [userInput, setUserInput] = useState("");
//   const [awaitingInput, setAwaitingInput] = useState(false);
//   // Store conversation history (for context, not rendered)
//   const conversationHistoryRef = useRef([]);
//   const [conversationHistory, setConversationHistory] = useState([]);
//   const [lastTask, setLastTask] = useState(null);
//   const [lastArguments, setLastArguments] = useState(null);
//   const [mediaMode, setMediaMode] = useState("none"); // "audio" | "video" | "none"
//   // For click-based email preview modal
//   const [selectedEmail, setSelectedEmail] = useState(null);

//   const taskEndpoints = {
//     read_emails: `${API_BASE}/api/email/read`,
//     send_followup_email: `${API_BASE}/api/email/followup`,
//     play_music: `${API_BASE}/api/music/play`,
//     play_video: `${API_BASE}/api/video/play`,
//     create_calendar_event: `${API_BASE}/api/calendar/create`,
//     search_reservation: `${API_BASE}/api/searchreservation/execute`,
//     websearch: `${API_BASE}/api/websearch/search`,
//     send_whatsapp: `${API_BASE}/api/whatsapp/send`,
//     get_today_schedule: `${API_BASE}/api/calendar/today`,
//     get_events_for_date: `${API_BASE}/api/calendar/events`,
//   };

//   const performTask = async (task, args) => {
//     const endpoint = taskEndpoints[task];
//     if (!endpoint) return { error: "Unknown task: " + task };

//     try {
//       const method = task === "get_today_schedule" ? "GET" : "POST";
//       const fetchOptions = {
//         method,
//         headers: { "Content-Type": "application/json" },
//       };

//       if (method === "POST") {
//         fetchOptions.body = JSON.stringify(args);
//       }

//       const response = await fetch(endpoint, fetchOptions);
//       const text = await response.text();
//       const result = JSON.parse(text);

//       let serviceResponseSummary = "";
//       if (task === "send_whatsapp" && result.result?.status === "sent") {
//         setTaskResult({ task, sid: result.result.sid });
//         serviceResponseSummary = "WhatsApp message sent.";
//       } else if (task === "create_calendar_event" && result.status === "success") {
//         setTaskResult({
//           task,
//           event: result.event,
//           status: result.status,
//         });
//         serviceResponseSummary = `Event "${result.event.summary}" created.`;
//       } else if (
//         (task === "get_today_schedule" || task === "get_events_for_date") &&
//         result.status === "success"
//       ) {
//         setCalendarEvents(result.events || []);
//         setTaskResult({ task });
//         readEventsAloud(result.events || []);
//         if (Array.isArray(result.events) && result.events.length > 0) {
//           serviceResponseSummary = "Calendar Events: " + result.events.map(e => e.summary).join(", ");
//         } else {
//           serviceResponseSummary = "No calendar events.";
//         }
//       } else if (task === "send_followup_email" && result.status === "success") {
//         setTaskResult({ task, message: result.message });
//         serviceResponseSummary = "Follow-up email drafted.";
//       } else if (task === "read_emails" && result.status === "success") {
//         setTaskResult({ task, data: result.data });
//         if (Array.isArray(result.data)) {
//           serviceResponseSummary = "Emails: " + result.data.map(email => email.subject).join(", ");
//         } else {
//           serviceResponseSummary = "Email: " + JSON.stringify(result.data);
//         }
//       } else if (task === "play_music" && result.stream_url) {
//         setMediaMode("audio");
//         setTaskResult(result);
//         serviceResponseSummary = `Playing music: ${result.title}`;
//       } else if (task === "play_video" && result.video_url) {
//         setMediaMode("video");
//         setTaskResult(result);
//         serviceResponseSummary = `Playing video: ${result.title}`;
//       } else {
//         setCalendarEvents([]);
//         setTaskResult({ ...result, task });
//         serviceResponseSummary = "Service response received.";
//       }
//       console.log("GPT Task Result →", result);

//       // Append service response summary to conversation history.
//       const assistantMessage = {
//         role: "assistant",
//         text: `Performed task "${task}" with result: ${JSON.stringify(result)}. ${serviceResponseSummary}`,
//       };
//       conversationHistoryRef.current.push(assistantMessage);
//       setConversationHistory([...conversationHistoryRef.current]);

//       // Save context for future turns.
//       setLastTask(task);
//       setLastArguments(args);
//       return result;
//     } catch (error) {
//       return { error: error.toString() };
//     }
//   };

//   const toggleListening = async () => {
//     if (listening) {
//       setListening(false);
//       if (transcript && transcript.trim() !== "" && transcript !== lastCommand) {
//         setLastCommand(transcript);
//         // Build a local history that includes the new user command.
//         const newMessage = { role: "user", text: transcript };
//         const newHistory = [...conversationHistoryRef.current, newMessage];
//         conversationHistoryRef.current = newHistory;
//         setConversationHistory(newHistory);

//         // Build context using the ref's current value.
//         const contextHistory = conversationHistoryRef.current.map((msg) => msg.text);

//         const gptResult = await interpretVoiceCommand(
//           transcript,
//           lastTask,
//           lastArguments,
//           { conversation_history: contextHistory, session_id: "my_unique_session_id" }
//         );
//         setInterpretation(gptResult);
//         // Append GPT response to conversation history.
//         const assistantResponse = { role: "assistant", text: JSON.stringify(gptResult, null, 2) };
//         conversationHistoryRef.current.push(assistantResponse);
//         setConversationHistory([...conversationHistoryRef.current]);

//         // If GPT returns a chat response, treat it as a chat function.
//         if (
//           (gptResult.task === "none" || gptResult.task === "chat") &&
//           gptResult.arguments?.response
//         ) {
//           setTaskResult({ task: "chat", arguments: { response: gptResult.arguments.response } });
//         } else if (gptResult.task && gptResult.task !== "none" && gptResult.task !== "error") {
//           await performTask(gptResult.task, gptResult.arguments);
//         }
//       }
//     } else {
//       setInterpretation(null);
//       setTaskResult(null);
//       setCalendarEvents([]);
//       setUserInput("");
//       setAwaitingInput(false);
//       setListening(true);
//     }
//   };

//   const readEventsAloud = (events) => {
//     if (!("speechSynthesis" in window)) return;
//     const synth = window.speechSynthesis;
//     let message =
//       events.length === 0
//         ? "You have no events scheduled for today."
//         : `You have ${events.length} events. `;
//     const wordList = [];
//     events.forEach((event, i) => {
//       const title = event.summary || "Untitled Event";
//       const time =
//         event.start?.dateTime || event.start?.date || "unspecified time";
//       const timeStr = event.start?.dateTime
//         ? new Date(time).toLocaleTimeString()
//         : "All-day";
//       const sentence = `Event ${i + 1}: ${title} at ${timeStr}.`;
//       wordList.push(...sentence.split(/\s+/));
//       message += sentence + " ";
//     });
//     setSpokenWords(wordList);
//     setSpokenIndex(0);
//     const utterance = new SpeechSynthesisUtterance(message);
//     utterance.onboundary = (event) => {
//       if (event.name === "word" || event.charIndex !== undefined) {
//         const spoken = utterance.text.slice(0, event.charIndex).trim();
//         const words = spoken.split(/\s+/);
//         setSpokenIndex(words.length);
//       }
//     };
//     utterance.onend = () => {
//       setSpokenIndex(null);
//       setSpokenWords([]);
//     };
//     synth.cancel();
//     synth.speak(utterance);
//   };

//   const speakText = (text) => {
//     const utterance = new SpeechSynthesisUtterance(text);
//     window.speechSynthesis.speak(utterance);
//   };

//   return (
//     <div className="jarvis-panel">
//       <h2>Voice Assistant</h2>
//       <p>
//         <strong>Transcript:</strong> {transcript}
//       </p>
//       <button onClick={toggleListening}>
//         {listening ? "Stop Listening" : "Start Listening"}
//       </button>

//       {interpretation && (
//         <div
//           style={{
//             marginTop: "1.5rem",
//             background: "rgba(0, 229, 255, 0.1)",
//             border: "1px solid #00e5ff",
//             borderRadius: "12px",
//             padding: "1rem",
//             color: "#00e5ff",
//             boxShadow: "0 0 15px #00e5ff",
//             maxWidth: "90%",
//             overflowX: "auto",
//             fontFamily: "monospace",
//             whiteSpace: "pre-wrap",
//             wordBreak: "break-word",
//           }}
//         >
//           <h3
//             style={{
//               marginBottom: "0.5rem",
//               color: "#00e5ff",
//               textShadow: "0 0 5px #00e5ff",
//             }}
//           >
//             🔍 Interpretation:
//           </h3>
//           <div
//             style={{
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "flex-start",
//               fontFamily: "monospace",
//               fontSize: "0.95rem",
//               lineHeight: "1.5",
//               color: "#00e5ff",
//               whiteSpace: "pre-wrap",
//             }}
//           >
//             {JSON.stringify(interpretation, null, 2)
//               .split("\n")
//               .map((line, idx) => (
//                 <div key={idx} style={{ textAlign: "left", width: "100%" }}>
//                   {line}
//                 </div>
//               ))}
//           </div>
//         </div>
//       )}

//       {awaitingInput && (
//         <div style={{ marginTop: "1rem", maxWidth: "600px", width: "100%" }}>
//           <input
//             type="text"
//             value={userInput}
//             onChange={(e) => setUserInput(e.target.value)}
//             placeholder="Enter your response here..."
//             style={{
//               width: "100%",
//               padding: "0.75rem",
//               borderRadius: "8px",
//               border: "1px solid #00e5ff",
//               background: "#001a1a",
//               color: "#00e5ff",
//               fontFamily: "monospace",
//               fontSize: "1rem",
//               boxShadow: "0 0 10px #00e5ff",
//               outline: "none",
//             }}
//           />
//           <button
//             onClick={async () => {
//               setAwaitingInput(false);
//               setInterpretation(null);
//               const args = {
//                 to: "22veda08@gmail.com", // Should be dynamic in a real app
//                 original_email: "Follow-up regarding last conversation",
//                 prompt: userInput,
//               };
//               const result = await performTask("send_followup_email", args);
//               setTaskResult(result);
//             }}
//             style={{
//               marginTop: "1rem",
//               padding: "0.5rem 1.5rem",
//               background: "#00e5ff",
//               color: "#000",
//               border: "none",
//               borderRadius: "8px",
//               cursor: "pointer",
//               fontWeight: "bold",
//               fontFamily: "Orbitron, sans-serif",
//               boxShadow: "0 0 10px #00e5ff",
//             }}
//           >
//             SUBMIT
//           </button>
//         </div>
//       )}

//       {/* Media Player: Audio or Video */}
//       {mediaMode === "audio" && taskResult?.stream_url && (
//         <div style={{ marginTop: "2rem", textAlign: "center" }}>
//           <h3>🎵 Now Playing: {taskResult.title}</h3>
//           {taskResult.thumbnail_url && (
//             <img
//               src={taskResult.thumbnail_url}
//               alt="Song Thumbnail"
//               style={{
//                 width: "250px",
//                 borderRadius: "10px",
//                 boxShadow: "0 0 15px #00e5ff",
//                 marginBottom: "1rem",
//               }}
//             />
//           )}
//           <audio
//             controls
//             autoPlay
//             style={{ width: "100%", maxWidth: "500px", marginTop: "1rem" }}
//           >
//             <source src={taskResult.stream_url} type="audio/mpeg" />
//             Your browser does not support the audio element.
//           </audio>
//         </div>
//       )}

//       {mediaMode === "video" && taskResult?.video_url && (
//         <div style={{ marginTop: "2rem", textAlign: "center" }}>
//           <h3>🎬 Now Playing: {taskResult.title}</h3>
//           <iframe
//             width="560"
//             height="315"
//             src={taskResult.video_url}
//             title="YouTube video player"
//             frameBorder="0"
//             allow="autoplay; encrypted-media"
//             allowFullScreen
//             style={{
//               boxShadow: "0 0 20px #00e5ff",
//               borderRadius: "10px",
//               marginTop: "1rem",
//             }}
//           ></iframe>
//         </div>
//       )}


//       {/* Calendar Events Display */}
//       {(taskResult?.task === "get_today_schedule" || taskResult?.task === "get_events_for_date") && calendarEvents.length > 0 && (
//         <div style={{ marginTop: "2rem", textAlign: "left" }}>
//           <h3 style={{ color: "#00e5ff", textShadow: "0 0 10px #00e5ff" }}>📅 Events for the Day</h3>
//           <div style={{
//             display: "flex",
//             flexWrap: "wrap",
//             gap: "1rem",
//             justifyContent: "center",
//             marginTop: "1rem"
//           }}>
//             {calendarEvents.map((event, idx) => {
//               const isMeeting = (event.attendees?.length || 0) > 0;
//               const time = event.start?.dateTime || event.start?.date;
//               const startTime = event.start?.dateTime ? new Date(time).toLocaleTimeString() : "All-day";
//               const tileColor = isMeeting ? "#00334e" : "#0b1d2b";
//               const borderColor = isMeeting ? "#00ffc3" : "#00b7ff";

//               return (
//                 <div key={idx} style={{
//                   background: tileColor,
//                   border: `1.5px solid ${borderColor}`,
//                   boxShadow: `0 0 15px ${borderColor}`,
//                   borderRadius: "12px",
//                   padding: "1rem",
//                   width: "300px",
//                   color: "#e0f7fa",
//                   fontFamily: "Orbitron, sans-serif",
//                   transition: "transform 0.3s ease"
//                 }}>
//                   <h4 style={{ marginBottom: "0.5rem", color: "#ffffff", textShadow: `0 0 5px ${borderColor}` }}>
//                     {event.summary || "Untitled Event"}
//                   </h4>
//                   <p><strong>Time:</strong> {startTime}</p>
//                   {event.location && <p><strong>Location:</strong> {event.location}</p>}
//                   {isMeeting && <p style={{ color: "#00ffc3" }}>👥 Meeting</p>}
//                 </div>
//               );
//             })}
//           </div>
//           </div>
//       )}
//       {/* Chat/Q&A Display */}
//       {taskResult?.task === "chat" && taskResult.arguments?.response && (
//         <div
//           style={{
//             marginTop: "2rem",
//             padding: "1rem",
//             background: "rgba(0,229,255,0.3)",
//             border: "1px solid #00e5ff",
//             borderRadius: "10px",
//             color: "#ffffff",
//             boxShadow: "0 0 15px #00e5ff",
//             maxWidth: "800px",
//             fontFamily: "Orbitron, sans-serif",
//             textAlign: "center",
//           }}
//         >
//           <h3 style={{ marginBottom: "1rem", textShadow: "0 0 5px #00e5ff" }}>
//             Chat Response
//           </h3>
//           <p style={{ whiteSpace: "pre-wrap", fontSize: "1rem" }}>
//             {taskResult.arguments.response}
//           </p>
//         </div>
//       )}

      

//       {/* Top Emails Display with Scrollbar */}
//       {taskResult?.task === "read_emails" && taskResult.data && (
//         <div
//           style={{
//             marginTop: "2rem",
//             padding: "1rem",
//             background: "rgba(0,229,255,0.05)",
//             border: "1px solid #00e5ff",
//             borderRadius: "10px",
//             color: "#00e5ff",
//             boxShadow: "0 0 12px #00e5ff",
//             maxWidth: "800px",
//             fontFamily: "Orbitron, sans-serif",
//             transition: "transform 0.3s ease",
//             maxHeight: "400px",
//             overflowY: "auto",
//           }}
//         >
//           <h3
//             style={{
//               fontSize: "1.5rem",
//               textShadow: "0 0 5px #00e5ff",
//               marginBottom: "1rem",
//               textAlign: "center",
//             }}
//           >
//             📥 Top Emails
//           </h3>

//           {/* Email Cards Container */}
//           <div
//             style={{
//               display: "flex",
//               flexWrap: "wrap",
//               gap: "1rem",
//               justifyContent: "center",
//             }}
//           >
//             {(Array.isArray(taskResult.data)
//               ? taskResult.data
//               : [taskResult.data]
//             ).map((email, index) => (
//               <div
//                 key={index}
//                 style={{
//                   background: "rgba(0,229,255,0.08)",
//                   border: "1px solid #00e5ff",
//                   borderRadius: "8px",
//                   padding: "1rem",
//                   width: "600px",
//                   boxShadow: "0 0 8px #00e5ff",
//                   transition: "transform 0.3s ease, box-shadow 0.3s ease",
//                   cursor: "pointer",
//                   marginBottom: "1rem",
//                 }}
//                 onClick={() => setSelectedEmail(email)}
//               >
//                 <div
//                   style={{
//                     fontWeight: "bold",
//                     fontSize: "1rem",
//                     marginBottom: "0.5rem",
//                     color: "#ffffff",
//                     textShadow: "0 0 5px #00e5ff",
//                   }}
//                 >
//                   {email.subject || "No Subject"}
//                 </div>
//                 <div style={{ marginBottom: "0.5rem", color: "#b2fef7" }}>
//                   <strong style={{ color: "#00ffc3" }}>From:</strong>{" "}
//                   {email.from || "Unknown Sender"}
//                 </div>
//                 <div style={{ fontSize: "0.85rem", color: "#b2fef7" }}>
//                   <strong>Date:</strong> {email.date || "N/A"}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Email Preview Modal (for click-based preview) */}
//       {selectedEmail && (
//         <div
//           style={{
//             position: "fixed",
//             top: 0,
//             left: 0,
//             width: "100vw",
//             height: "100vh",
//             background: "rgba(0, 0, 0, 0.8)", // Dim background overlay
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             zIndex: 1000,
//           }}
//           onClick={() => setSelectedEmail(null)}
//         >
//           <div
//             style={{
//               background: "rgba(0,229,255,0.2)",
//               border: "1px solid #00e5ff",
//               borderRadius: "10px",
//               boxShadow: "0 0 20px #00e5ff",
//               width: "80%",
//               maxWidth: "800px",
//               maxHeight: "80%",
//               overflowY: "auto",
//               padding: "1rem",
//               position: "relative",
//             }}
//             onClick={(e) => e.stopPropagation()}
//           >
//             <button
//               style={{
//                 position: "absolute",
//                 top: "10px",
//                 right: "10px",
//                 background: "#00e5ff",
//                 border: "none",
//                 borderRadius: "4px",
//                 padding: "0.5rem 1rem",
//                 cursor: "pointer",
//                 color: "#000",
//                 fontWeight: "bold",
//               }}
//               onClick={() => setSelectedEmail(null)}
//             >
//               Close
//             </button>
//             <h3
//               style={{
//                 textAlign: "center",
//                 color: "#ffffff",
//                 textShadow: "0 0 5px #00e5ff",
//                 marginBottom: "1rem",
//               }}
//             >
//               {selectedEmail.subject || "No Subject"}
//             </h3>
//             <p style={{ marginBottom: "0.5rem", color: "#b2fef7" }}>
//               <strong style={{ color: "#00ffc3" }}>From:</strong>{" "}
//               {selectedEmail.from || "Unknown Sender"}
//             </p>
//             <p style={{ marginBottom: "1rem", color: "#b2fef7" }}>
//               <strong style={{ color: "#00ffc3" }}>Date:</strong>{" "}
//               {selectedEmail.date || "N/A"}
//             </p>
//             <div
//               style={{
//                 padding: "1rem",
//                 background: "rgba(0,229,255,0.05)",
//                 borderRadius: "8px",
//                 color: "#ffffff",
//                 fontFamily: "monospace",
//                 whiteSpace: "pre-wrap",
//               }}
//             >
//               {selectedEmail.body || "No content available."}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default VoiceAssistant;



import React, { useState, useRef, useEffect } from "react";
import useSpeech from "../hooks/useSpeech";
import { interpretVoiceCommand } from "../utils/api";

const API_BASE = "http://localhost:8000";

function VoiceAssistant() {
  // Speech hook
  const { transcript, listening, setListening } = useSpeech();

  // Component state
  const [interpretation, setInterpretation] = useState(null);
  const [taskResult, setTaskResult] = useState(null);
  const [lastCommand, setLastCommand] = useState("");
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [spokenWords, setSpokenWords] = useState([]);
  const [spokenIndex, setSpokenIndex] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [awaitingInput, setAwaitingInput] = useState(false);
  // For click-based email preview modal
  const [selectedEmail, setSelectedEmail] = useState(null);
  // For chat responses (Q&A/chit-chat)
  const [chatResponse, setChatResponse] = useState(null);
  // Conversation history (for context, not rendered)
  const conversationHistoryRef = useRef([]);
  const [conversationHistory, setConversationHistory] = useState([]);
  // To store last task and arguments for context
  const [lastTask, setLastTask] = useState(null);
  const [lastArguments, setLastArguments] = useState(null);
  // Media mode: "audio", "video", or "none"
  const [mediaMode, setMediaMode] = useState("none");

  // Mapping tasks to endpoints
  const taskEndpoints = {
    read_emails: `${API_BASE}/api/email/read`,
    send_followup_email: `${API_BASE}/api/email/followup`,
    play_music: `${API_BASE}/api/music/play`,
    play_video: `${API_BASE}/api/video/play`,
    create_calendar_event: `${API_BASE}/api/calendar/create`,
    search_reservation: `${API_BASE}/api/searchreservation/execute`,
    websearch: `${API_BASE}/api/websearch/search`,
    send_whatsapp: `${API_BASE}/api/whatsapp/send`,
    get_today_schedule: `${API_BASE}/api/calendar/today`,
    get_events_for_date: `${API_BASE}/api/calendar/events`,
  };

  // --- Service Task Function ---
  const performTask = async (task, args) => {
    const endpoint = taskEndpoints[task];
    if (!endpoint) return { error: "Unknown task: " + task };

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
      let serviceResponseSummary = "";

      if (task === "send_whatsapp" && result.result?.status === "sent") {
        setTaskResult({ task, sid: result.result.sid });
        serviceResponseSummary = "WhatsApp message sent.";
      } else if (task === "create_calendar_event" && result.status === "success") {
        setTaskResult({ task, event: result.event, status: result.status });
        serviceResponseSummary = `Event "${result.event.summary}" created.`;
      } else if ((task === "get_today_schedule" || task === "get_events_for_date") && result.status === "success") {
        setCalendarEvents(result.events || []);
        setTaskResult({ task });
        if (Array.isArray(result.events) && result.events.length > 0) {
          serviceResponseSummary = "Calendar Events: " + result.events.map(e => e.summary).join(", ");
        } else {
          serviceResponseSummary = "No calendar events.";
        }
      } else if (task === "send_followup_email" && result.status === "success") {
        setTaskResult({ task, message: result.message });
        serviceResponseSummary = "Follow-up email drafted.";
      } else if (task === "read_emails" && result.status === "success") {
        setTaskResult({ task, data: result.data });
        if (Array.isArray(result.data)) {
          serviceResponseSummary = "Emails: " + result.data.map(email => email.subject).join(", ");
        } else {
          serviceResponseSummary = "Email: " + JSON.stringify(result.data);
        }
      } else if (task === "play_music" && result.stream_url) {
        setMediaMode("audio");
        setTaskResult(result);
        serviceResponseSummary = `Playing music: ${result.title}`;
      } else if (task === "play_video" && result.video_url) {
        setMediaMode("video");
        setTaskResult(result);
        serviceResponseSummary = `Playing video: ${result.title}`;
      } else {
        setCalendarEvents([]);
        setTaskResult({ ...result, task });
        serviceResponseSummary = "Service response received.";
      }
      console.log("GPT Task Result →", result);

      // Append service response summary to conversation history.
      const assistantMessage = {
        role: "assistant",
        text: `Performed task "${task}" with result: ${JSON.stringify(result)}. ${serviceResponseSummary}`,
      };
      conversationHistoryRef.current.push(assistantMessage);
      setConversationHistory([...conversationHistoryRef.current]);

      setLastTask(task);
      setLastArguments(args);
      return result;
    } catch (error) {
      return { error: error.toString() };
    }
  };

  // --- Listening Toggle Function ---
  const toggleListening = async () => {
    if (listening) {
      // When already listening, stop and process the transcript
      setListening(false);
      if (transcript && transcript.trim() !== "" && transcript !== lastCommand) {
        setLastCommand(transcript);
        // Append the new user command to conversation history.
        const newMessage = { role: "user", text: transcript };
        const newHistory = [...conversationHistoryRef.current, newMessage];
        conversationHistoryRef.current = newHistory;
        setConversationHistory(newHistory);

        // Build context using current conversation history.
        const contextHistory = conversationHistoryRef.current.map((msg) => msg.text);
        const gptResult = await interpretVoiceCommand(
          transcript,
          lastTask,
          lastArguments,
          { conversation_history: contextHistory, session_id: "my_unique_session_id" }
        );
        setInterpretation(gptResult);
        // Append GPT response to conversation history.
        const assistantResponse = {
          role: "assistant",
          text: JSON.stringify(gptResult, null, 2)
        };
        conversationHistoryRef.current.push(assistantResponse);
        setConversationHistory([...conversationHistoryRef.current]);

        // If GPT response is chat, display it; otherwise, perform the service task.
        if ((gptResult.task === "none" || gptResult.task === "chat") && gptResult.arguments?.response) {
          setTaskResult({ task: "chat", arguments: { response: gptResult.arguments.response } });
          conversationHistoryRef.current.push({
            role: "assistant",
            text: `Chat: ${gptResult.arguments.response}`
          });
          setConversationHistory([...conversationHistoryRef.current]);
        } else if (gptResult.task && gptResult.task !== "none" && gptResult.task !== "error") {
          await performTask(gptResult.task, gptResult.arguments);
        }
      }
    } else {
      // If not listening, reset state and start listening.
      setInterpretation(null);
      setTaskResult(null);
      setCalendarEvents([]);
      setUserInput("");
      setAwaitingInput(false);
      setListening(true);
    }
  };

  // --- Activation via Voice ("hey jarvis") ---
  useEffect(() => {
    // If not listening, check if activation phrase is present.
    if (!listening && transcript && transcript.toLowerCase().includes("hey jarvis")) {
      // Optionally, clear the activation phrase from the transcript.
      toggleListening();
    }
  }, [transcript, listening]);

  // --- Speech Synthesis for Events ---
  const readEventsAloud = (events) => {
    if (!("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    let message = events.length === 0
      ? "You have no events scheduled for today."
      : `You have ${events.length} events. `;
    const wordList = [];
    events.forEach((event, i) => {
      const title = event.summary || "Untitled Event";
      const time = event.start?.dateTime || event.start?.date || "unspecified time";
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

  // --- Text-to-Speech Helper ---
  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="jarvis-panel">
      <h2>Voice Assistant</h2>
      <p><strong>Transcript:</strong> {transcript}</p>
      {/* Optionally hide the button if you rely solely on "hey jarvis" activation */}
      <button onClick={toggleListening}>
        {listening ? "Stop Listening" : "Start Listening"}
      </button>

      {/* Interpretation Display */}
      {interpretation && (
        <div style={{
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
          wordBreak: "break-word"
        }}>
          <h3 style={{
            marginBottom: "0.5rem",
            color: "#00e5ff",
            textShadow: "0 0 5px #00e5ff"
          }}>
            🔍 Interpretation:
          </h3>
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            fontFamily: "monospace",
            fontSize: "0.95rem",
            lineHeight: "1.5",
            color: "#00e5ff",
            whiteSpace: "pre-wrap"
          }}>
            {JSON.stringify(interpretation, null, 2)
              .split("\n")
              .map((line, idx) => (
                <div key={idx} style={{ textAlign: "left", width: "100%" }}>
                  {line}
                </div>
              ))}
          </div>
        </div>
      )}

      {awaitingInput && (
        <div style={{ marginTop: "1rem", maxWidth: "600px", width: "100%" }}>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Enter your response here..."
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
              outline: "none"
            }}
          />
          <button onClick={async () => {
              setAwaitingInput(false);
              setInterpretation(null);
              const args = {
                to: "22veda08@gmail.com", // Should be dynamic
                original_email: "Follow-up regarding last conversation",
                prompt: userInput
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
              boxShadow: "0 0 10px #00e5ff"
            }}>
            SUBMIT
          </button>
        </div>
      )}

      {/* Media Player: Audio */}
      {mediaMode === "audio" && taskResult?.stream_url && (
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
                marginBottom: "1rem"
              }}
            />
          )}
          <audio controls autoPlay style={{ width: "100%", maxWidth: "500px", marginTop: "1rem" }}>
            <source src={taskResult.stream_url} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      {/* Media Player: Video */}
      {mediaMode === "video" && taskResult?.video_url && (
        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <h3>🎬 Now Playing: {taskResult.title}</h3>
          <iframe
            width="560"
            height="315"
            src={taskResult.video_url}
            title="YouTube video player"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            style={{
              boxShadow: "0 0 20px #00e5ff",
              borderRadius: "10px",
              marginTop: "1rem"
            }}
          ></iframe>
        </div>
      )}

      {/* Calendar Events Display */}
      {(taskResult?.task === "get_today_schedule" || taskResult?.task === "get_events_for_date") && calendarEvents.length > 0 && (
        <div style={{ marginTop: "2rem", textAlign: "left" }}>
          <h3 style={{ color: "#00e5ff", textShadow: "0 0 10px #00e5ff" }}>📅 Events for the Day</h3>
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            justifyContent: "center",
            marginTop: "1rem"
          }}>
            {calendarEvents.map((event, idx) => {
              const isMeeting = (event.attendees?.length || 0) > 0;
              const time = event.start?.dateTime || event.start?.date;
              const startTime = event.start?.dateTime ? new Date(time).toLocaleTimeString() : "All-day";
              const tileColor = isMeeting ? "#00334e" : "#0b1d2b";
              const borderColor = isMeeting ? "#00ffc3" : "#00b7ff";
              return (
                <div key={idx} style={{
                  background: tileColor,
                  border: `1.5px solid ${borderColor}`,
                  boxShadow: `0 0 15px ${borderColor}`,
                  borderRadius: "12px",
                  padding: "1rem",
                  width: "300px",
                  color: "#e0f7fa",
                  fontFamily: "Orbitron, sans-serif",
                  transition: "transform 0.3s ease"
                }}>
                  <h4 style={{
                    marginBottom: "0.5rem",
                    color: "#ffffff",
                    textShadow: `0 0 5px ${borderColor}`
                  }}>
                    {event.summary || "Untitled Event"}
                  </h4>
                  <p><strong>Time:</strong> {startTime}</p>
                  {event.location && <p><strong>Location:</strong> {event.location}</p>}
                  {isMeeting && <p style={{ color: "#00ffc3" }}>👥 Meeting</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Chat/Q&A Display */}
      {taskResult?.task === "chat" && taskResult.arguments?.response && (
        <div style={{
          marginTop: "2rem",
          padding: "1rem",
          background: "rgba(0,229,255,0.3)",
          border: "1px solid #00e5ff",
          borderRadius: "10px",
          color: "#ffffff",
          boxShadow: "0 0 15px #00e5ff",
          maxWidth: "800px",
          fontFamily: "Orbitron, sans-serif",
          textAlign: "center"
        }}>
          <h3 style={{ marginBottom: "1rem", textShadow: "0 0 5px #00e5ff" }}>
            Chat Response
          </h3>
          <p style={{ whiteSpace: "pre-wrap", fontSize: "1rem" }}>
            {taskResult.arguments.response}
          </p>
        </div>
      )}

      {/* Horizontal Spoken Words Highlight Bar */}
      {spokenWords.length > 0 && (
        <div style={{
          marginTop: "2rem",
          textAlign: "center",
          padding: "1rem",
          border: "1px solid #00e5ff",
          borderRadius: "8px",
          boxShadow: "0 0 10px #00e5ff",
          background: "rgba(0,229,255,0.05)",
          maxWidth: "100%",
          overflowX: "auto",
          whiteSpace: "nowrap"
        }}>
          {spokenWords.map((word, i) => (
            <span key={i} style={{
              display: "inline-block",
              color: i === spokenIndex ? "#ffffff" : "#00e5ff",
              fontWeight: i === spokenIndex ? "bold" : "normal",
              textShadow: i === spokenIndex ? "0 0 10px #ffffff" : "none",
              marginRight: "0.5rem",
              fontSize: "1.1rem",
              transition: "all 0.2s ease"
            }}>
              {word}
            </span>
          ))}
        </div>
      )}

      {/* Email Preview Modal (Click-Based) */}
      {selectedEmail && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0, 0, 0, 0.8)", // Dim background overlay
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
          onClick={() => setSelectedEmail(null)}
        >
          <div
            style={{
              background: "rgba(0,229,255,0.2)",
              border: "1px solid #00e5ff",
              borderRadius: "10px",
              boxShadow: "0 0 20px #00e5ff",
              width: "80%",
              maxWidth: "800px",
              maxHeight: "80%",
              overflowY: "auto",
              padding: "1rem",
              position: "relative"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "#00e5ff",
                border: "none",
                borderRadius: "4px",
                padding: "0.5rem 1rem",
                cursor: "pointer",
                color: "#000",
                fontWeight: "bold"
              }}
              onClick={() => setSelectedEmail(null)}
            >
              Close
            </button>
            <h3 style={{
              textAlign: "center",
              color: "#ffffff",
              textShadow: "0 0 5px #00e5ff",
              marginBottom: "1rem"
            }}>
              {selectedEmail.subject || "No Subject"}
            </h3>
            <p style={{ marginBottom: "0.5rem", color: "#b2fef7" }}>
              <strong style={{ color: "#00ffc3" }}>From:</strong> {selectedEmail.from || "Unknown Sender"}
            </p>
            <p style={{ marginBottom: "1rem", color: "#b2fef7" }}>
              <strong style={{ color: "#00ffc3" }}>Date:</strong> {selectedEmail.date || "N/A"}
            </p>
            <div style={{
              padding: "1rem",
              background: "rgba(0,229,255,0.05)",
              borderRadius: "8px",
              color: "#ffffff",
              fontFamily: "monospace",
              whiteSpace: "pre-wrap"
            }}>
              {selectedEmail.body || "No content available."}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VoiceAssistant;
