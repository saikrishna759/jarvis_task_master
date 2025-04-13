// // // import React, { useEffect, useState } from 'react';
// // // import useSpeech from '../hooks/useSpeech';
// // // import { interpretVoiceCommand } from '../utils/api';

// // // function VoiceAssistant() {
// // //   const { transcript, listening, setListening } = useSpeech();
// // //   const [interpretation, setInterpretation] = useState(null);
// // //   const [taskResult, setTaskResult] = useState(null);
// // //   const [lastCommand, setLastCommand] = useState("");

// // //   // Map tasks to their endpoints
// // //   const taskEndpoints = {
// // //     "read_emails": "/api/email/read",
// // //     "play_music": "/api/music/play",
// // //     "create_calendar_event": "/api/calendar/create",
// // //     "search_reservation": "/api/searchreservation/execute",
// // //     "websearch": "/api/websearch/search",
// // //     "send_whatsapp": "/api/whatsapp/send"
// // //   };

// // //   // Call the API for the specified task
// // //   const performTask = async (task, args) => {
// // //     const endpoint = taskEndpoints[task];
// // //     if (!endpoint) {
// // //       return { error: "Unknown task: " + task };
// // //     }
// // //     try {
// // //       const response = await fetch(endpoint, {
// // //         method: "POST",
// // //         headers: { "Content-Type": "application/json" },
// // //         body: JSON.stringify(args)
// // //       });
// // //       return await response.json();
// // //     } catch (error) {
// // //       return { error: error.toString() };
// // //     }
// // //   };


// // //   // Toggle listening. When stopping, send transcript to GPT‑4 and then perform task.
// // //   const toggleListening = async () => {
// // //     console.log("toggleListening called. listening:", listening);

// // //     if (listening) {
// // //       // Stop listening and process the final transcript.
// // //       setListening(false);
// // //       console.log("Stopping listening. Final transcript:", transcript);

      
// // //       if (transcript && transcript.trim() !== "") {
// // //         setLastCommand(transcript);
// // //         const gptResult = await interpretVoiceCommand(transcript);
// // //         console.log("GPT-4 Interpretation:", gptResult);
// // //         setInterpretation(gptResult);
// // //         if (gptResult.task && gptResult.task !== "none" && gptResult.task !== "error") {
// // //           const taskRes = await performTask(gptResult.task, gptResult.arguments);
// // //           console.log("Task Result:", taskRes);
// // //           setTaskResult(taskRes);
// // //         }
// // //       }
// // //     } else {
// // //       // Start listening
// // //       setInterpretation(null);
// // //       setTaskResult(null);
// // //       setListening(true);
// // //     }
// // //   };

// // //   return (
// // //     <div className="jarvis-panel">
// // //       <h2>Voice Assistant</h2>
// // //       <p><strong>Transcript:</strong> {transcript}</p>
// // //       <button onClick={toggleListening}>
// // //         {listening ? "Stop Listening" : "Start Listening"}
// // //       </button>
// // //       {interpretation && (
// // //         <div style={{ marginTop: "1rem", textAlign: "left" }}>
// // //           <h3>Interpretation:</h3>
// // //           <pre>{JSON.stringify(interpretation, null, 2)}</pre>
// // //         </div>
// // //       )}
// // //       {taskResult && (
// // //         <div style={{ marginTop: "1rem", textAlign: "left" }}>
// // //           <h3>Task Result:</h3>
// // //           <pre>{JSON.stringify(taskResult, null, 2)}</pre>
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // }

// // // export default VoiceAssistant;
// // import React, { useEffect, useState } from 'react';
// // import useSpeech from '../hooks/useSpeech';
// // import { interpretVoiceCommand } from '../utils/api';

// // const API_BASE = "http://localhost:8000";


// // function VoiceAssistant() {
// //   const { transcript, listening, setListening } = useSpeech();
// //   const [interpretation, setInterpretation] = useState(null);
// //   const [taskResult, setTaskResult] = useState(null);
// //   const [lastCommand, setLastCommand] = useState("");
// // ``
// //   const taskEndpoints = {
// //     "read_emails": `${API_BASE}/api/email/read`,
// //     "play_music": `${API_BASE}/api/music/play`,
// //     "create_calendar_event": `${API_BASE}/api/calendar/create`,
// //     "search_reservation": `${API_BASE}/api/searchreservation/execute`,
// //     "websearch": `${API_BASE}/api/websearch/search`,
// //     "send_whatsapp": `${API_BASE}/api/whatsapp/send`
// //   };

// //   const performTask = async (task, args) => {
// //     const endpoint = taskEndpoints[task];
// //     if (!endpoint) {
// //       return { error: "Unknown task: " + task };
// //     }
// //     try {
// //       const response = await fetch(endpoint, {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify(args)
// //       });
// //       return await response.json();
// //     } catch (error) {
// //       return { error: error.toString() };
// //     }
// //   };

// //   const toggleListening = async () => {
// //     if (listening) {
// //       setListening(false);
// //       if (transcript && transcript.trim() !== "") {
// //         setLastCommand(transcript);
// //         const gptResult = await interpretVoiceCommand(transcript);
// //         console.log("GPT-4 Interpretation:", gptResult);
// //         setInterpretation(gptResult);
// //         if (gptResult.task && gptResult.task !== "none" && gptResult.task !== "error") {
// //           const taskRes = await performTask(gptResult.task, gptResult.arguments);
// //           console.log("Task Result:", taskRes);
// //           setTaskResult(taskRes);
// //         }
// //       }
// //     } else {
// //       setInterpretation(null);
// //       setTaskResult(null);
// //       setListening(true);
// //     }
// //   };

// //   return (
// //     <div className="jarvis-panel">
// //       <h2>Voice Assistant</h2>
// //       <p><strong>Transcript:</strong> {transcript}</p>
// //       <button onClick={toggleListening}>
// //         {listening ? "Stop Listening" : "Start Listening"}
// //       </button>

// //       {interpretation && (
// //         <div style={{ marginTop: "1rem", textAlign: "left" }}>
// //           <h3>Interpretation:</h3>
// //           <pre>{JSON.stringify(interpretation, null, 2)}</pre>
// //         </div>
// //       )}

// //       {taskResult && (
// //         <div style={{ marginTop: "1rem", textAlign: "left" }}>
// //           <h3>Task Result:</h3>
// //           <pre>{JSON.stringify(taskResult, null, 2)}</pre>
// //         </div>
// //       )}

// // {taskResult && taskResult.stream_url && (
// //   <div style={{ marginTop: "1rem", textAlign: "left" }}>
// //     <h3>Now Playing: {taskResult.title}</h3>
    
// //     {taskResult.thumbnail_url && (
// //       <img
// //         src={taskResult.thumbnail_url}
// //         alt="Thumbnail"
// //         style={{
// //           width: "300px",
// //           height: "auto",
// //           borderRadius: "8px",
// //           marginBottom: "1rem",
// //           boxShadow: "0 0 12px #00e5ff"
// //         }}
// //       />
// //     )}

// //     <audio controls autoPlay style={{ width: "100%" }}>
// //       <source src={taskResult.stream_url} type="audio/mpeg" />
// //       Your browser does not support the audio element.
// //     </audio>
// //   </div>
// // )}

// // {/* 
// //       {taskResult && taskResult.stream_url && (
// //         <div style={{ marginTop: "1rem", textAlign: "left" }}>
// //           <h3>Now Playing: {taskResult.title}</h3>
// //           <audio controls autoPlay style={{ width: "100%" }}>
// //             <source src={taskResult.stream_url} type="audio/mpeg" />
// //             Your browser does not support the audio element.
// //           </audio>
// //         </div>
// //       )} */}


  
// //       {taskResult && taskResult.stream_url && (
// //         <div style={{ marginTop: "1rem", textAlign: "left" }}>
// //           <h3>Now Playing: {taskResult.title}</h3>
          
// //           {taskResult.thumbnail_url && (
// //             <img
// //               src={taskResult.thumbnail_url}
// //               alt="Thumbnail"
// //               style={{
// //                 width: "300px",
// //                 height: "auto",
// //                 borderRadius: "8px",
// //                 marginBottom: "1rem",
// //                 boxShadow: "0 0 12px #00e5ff"
// //               }}
// //             />
// //           )}

// //           <audio controls autoPlay style={{ width: "100%" }}>
// //             <source src={taskResult.stream_url} type="audio/mpeg" />
// //             Your browser does not support the audio element.
// //           </audio>
// //         </div>
// //       )}
// //           </div>
// //   );
// // }


// // export default VoiceAssistant;


// import React, { useEffect, useState } from 'react';
// import useSpeech from '../hooks/useSpeech';
// import { interpretVoiceCommand } from '../utils/api';

// const API_BASE = "http://localhost:8000";

// function VoiceAssistant() {
//   const { transcript, listening, setListening } = useSpeech();
//   const [interpretation, setInterpretation] = useState(null);
//   const [taskResult, setTaskResult] = useState(null);
//   const [lastCommand, setLastCommand] = useState("");

//   const taskEndpoints = {
//     "read_emails": `${API_BASE}/api/email/read`,
//     "play_music": `${API_BASE}/api/music/play`,
//     "create_calendar_event": `${API_BASE}/api/calendar/create`,
//     "search_reservation": `${API_BASE}/api/searchreservation/execute`,
//     "websearch": `${API_BASE}/api/websearch/search`,
//     "send_whatsapp": `${API_BASE}/api/whatsapp/send`,
//     "get_today_schedule": `${API_BASE}/api/calendar/today`,

//   };

//   const performTask = async (task, args) => {
//     const endpoint = taskEndpoints[task];
//     if (!endpoint) return { error: "Unknown task: " + task };

//     try {
//       const response = await fetch(endpoint, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(args)
//       });
//       const text = await response.text();
//       try {
//         return JSON.parse(text);
//       } catch (e) {
//         return { error: `Invalid JSON from task ${task}: ${e.message}`, raw: text };
//       }
//     } catch (error) {
//       return { error: error.toString() };
//     }
//   };

//   const toggleListening = async () => {
//     if (listening) {
//       setListening(false);

//       if (transcript && transcript.trim() !== "" && transcript !== lastCommand) {
//         setLastCommand(transcript);
//         const gptResult = await interpretVoiceCommand(transcript);
//         setInterpretation(gptResult);

//         if (gptResult.task && gptResult.task !== "none" && gptResult.task !== "error") {
//           const taskRes = await performTask(gptResult.task, gptResult.arguments);
//           setTaskResult(taskRes);
//         }
//       }
//     } else {
//       setInterpretation(null);
//       setTaskResult(null);
//       setListening(true);
//     }
//   };

//   return (
//     <div className="jarvis-panel">
//       <h2>Voice Assistant</h2>
//       <p><strong>Transcript:</strong> {transcript}</p>
//       <button onClick={toggleListening}>
//         {listening ? "Stop Listening" : "Start Listening"}
//       </button>

//       {interpretation && (
//         <div style={{ marginTop: "1rem", textAlign: "left" }}>
//           <h3>Interpretation:</h3>
//           <pre>{JSON.stringify(interpretation, null, 2)}</pre>
//         </div>
//       )}

//       {/* {taskResult && (
//         <div style={{ marginTop: "1rem", textAlign: "left" }}>
//           <h3>Task Result:</h3>
//           <pre>{JSON.stringify(taskResult, null, 2)}</pre>
//         </div>
//       )} */}

//       {taskResult?.stream_url && (
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
//                 margin: "1rem auto"
//               }}
//             />
//           )}

//           <audio controls autoPlay style={{ width: "100%", maxWidth: "500px", marginTop: "1rem" }}>
//             <source src={taskResult.stream_url} type="audio/mpeg" />
//             Your browser does not support the audio element.
//           </audio>
//         </div>
//       )}
//     </div>
//   );
// }

// export default VoiceAssistant;


// import React, { useEffect, useState } from 'react';
// import useSpeech from '../hooks/useSpeech';
// import { interpretVoiceCommand } from '../utils/api';

// const API_BASE = "http://localhost:8000";

// function VoiceAssistant() {
//   const { transcript, listening, setListening } = useSpeech();
//   const [interpretation, setInterpretation] = useState(null);
//   const [taskResult, setTaskResult] = useState(null);
//   const [lastCommand, setLastCommand] = useState("");
//   const [calendarEvents, setCalendarEvents] = useState([]);

//   const taskEndpoints = {
//     "read_emails": `${API_BASE}/api/email/read`,
//     "play_music": `${API_BASE}/api/music/play`,
//     "create_calendar_event": `${API_BASE}/api/calendar/create`,
//     "search_reservation": `${API_BASE}/api/searchreservation/execute`,
//     "websearch": `${API_BASE}/api/websearch/search`,
//     "send_whatsapp": `${API_BASE}/api/whatsapp/send`,
//     "get_today_schedule": `${API_BASE}/api/calendar/today`,
//     "get_events_for_date": `${API_BASE}/api/calendar/events`,

//   };

//   const performTask = async (task, args) => {
//     const endpoint = taskEndpoints[task];
//     if (!endpoint) return { error: "Unknown task: " + task };

//     try {
//       const response = await fetch(endpoint, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(args)
//       });

//       const text = await response.text();
//       try {
//         const result = JSON.parse(text);

//         // Handle calendar task
//         if (task === "get_events_for_date" && result.status === "success") {
//           setCalendarEvents(result.events || []);
//           setTaskResult({ task: "get_events_for_date" });
//           readEventsAloud(result.events || []);
//         }
//         else if (task === "get_today_schedule" && result.status === "success") {
//           setCalendarEvents(result.events || []);
//           setTaskResult({ task: "get_today_schedule" });
//           readEventsAloud(result.events || []);
//         } else {
//           setCalendarEvents([]);
//           setTaskResult(result);
//         }

//         return result;
//       } catch (e) {
//         return { error: `Invalid JSON from task ${task}: ${e.message}`, raw: text };
//       }
//     } catch (error) {
//       return { error: error.toString() };
//     }
//   };

//   const toggleListening = async () => {
//     if (listening) {
//       setListening(false);

//       if (transcript && transcript.trim() !== "" && transcript !== lastCommand) {
//         setLastCommand(transcript);
//         const gptResult = await interpretVoiceCommand(transcript);
//         setInterpretation(gptResult);

//         if (gptResult.task && gptResult.task !== "none" && gptResult.task !== "error") {
//           await performTask(gptResult.task, gptResult.arguments);
//         }
//       }
//     } else {
//       setInterpretation(null);
//       setTaskResult(null);
//       setCalendarEvents([]);
//       setListening(true);
//     }
//   };

//   const readEventsAloud = (events) => {
//     if (!("speechSynthesis" in window)) return;

//     const synth = window.speechSynthesis;
//     let message = events.length === 0
//       ? "You have no events scheduled for today."
//       : `You have ${events.length} events today. `;

//     events.forEach((event, i) => {
//       const time = event.start?.dateTime || event.start?.date || "an unspecified time";
//       const title = event.summary || "No title";
//       message += `Event ${i + 1}: ${title} at ${new Date(time).toLocaleTimeString()}. `;
//     });

//     const utterance = new SpeechSynthesisUtterance(message);
//     synth.speak(utterance);
//   };

//   return (
//     <div className="jarvis-panel">
//       <h2>Voice Assistant</h2>
//       <p><strong>Transcript:</strong> {transcript}</p>
//       <button onClick={toggleListening}>
//         {listening ? "Stop Listening" : "Start Listening"}
//       </button>

//       {interpretation && (
//         <div style={{ marginTop: "1rem", textAlign: "left" }}>
//           <h3>Interpretation:</h3>
//           <pre>{JSON.stringify(interpretation, null, 2)}</pre>
//         </div>
//       )}

//       {/* Music Player */}
//       {taskResult?.stream_url && (
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
//                 marginBottom: "1rem"
//               }}
//             />
//           )}

//           <audio controls autoPlay style={{ width: "100%", maxWidth: "500px", marginTop: "1rem" }}>
//             <source src={taskResult.stream_url} type="audio/mpeg" />
//             Your browser does not support the audio element.
//           </audio>
//         </div>
//       )}

//       {/* Calendar Events Display */}
//       {taskResult?.task === "get_today_schedule" && calendarEvents.length > 0 && (
//         <div style={{ marginTop: "2rem", textAlign: "left" }}>
//           <h3>📅 Today's Events:</h3>
//           <ul>
//             {calendarEvents.map((event, idx) => (
//               <li key={idx} style={{ marginBottom: "1rem" }}>
//                 <strong>{event.summary}</strong><br />
//                 {event.start?.dateTime
//                   ? new Date(event.start.dateTime).toLocaleString()
//                   : event.start?.date}
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// }

// export default VoiceAssistant;

import React, { useEffect, useState } from 'react';
import useSpeech from '../hooks/useSpeech';
import { interpretVoiceCommand } from '../utils/api';

const API_BASE = "http://localhost:8000";

function VoiceAssistant() {
  const { transcript, listening, setListening } = useSpeech();
  const [interpretation, setInterpretation] = useState(null);
  const [taskResult, setTaskResult] = useState(null);
  const [lastCommand, setLastCommand] = useState("");
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [spokenWords, setSpokenWords] = useState([]);
  const [spokenIndex, setSpokenIndex] = useState(null);

  const taskEndpoints = {
    "read_emails": `${API_BASE}/api/email/read`,
    "play_music": `${API_BASE}/api/music/play`,
    "create_calendar_event": `${API_BASE}/api/calendar/create`,
    "search_reservation": `${API_BASE}/api/searchreservation/execute`,
    "websearch": `${API_BASE}/api/websearch/search`,
    "send_whatsapp": `${API_BASE}/api/whatsapp/send`,
    "get_today_schedule": `${API_BASE}/api/calendar/today`,
    "get_events_for_date": `${API_BASE}/api/calendar/events`,
  };

  const performTask = async (task, args) => {
    const endpoint = taskEndpoints[task];
    if (!endpoint) return { error: "Unknown task: " + task };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args)
      });

      const text = await response.text();
      const result = JSON.parse(text);
      if (task === "send_whatsapp" && result.result?.status === "sent") {
        speakText(`WhatsApp message sent successfully.`);
        setTaskResult({ task, sid: result.result.sid });
      }
      else if (task === "create_calendar_event" && result.status === "success") {
        setTaskResult({
          task,
          event: result.event,
          status: result.status
        });
        speakText(`Event "${result.event.summary}" has been added at ${new Date(result.event.start.dateTime).toLocaleTimeString()}.`);
      }
      else if ((task === "get_today_schedule" || task === "get_events_for_date") && result.status === "success") {
        setCalendarEvents(result.events || []);
        setTaskResult({ task });
        readEventsAloud(result.events || []);
      } else {
        setCalendarEvents([]);
        setTaskResult(result);
      }

      return result;
    } catch (error) {
      return { error: error.toString() };
    }
  };

  const toggleListening = async () => {
    if (listening) {
      setListening(false);
      if (transcript && transcript.trim() !== "" && transcript !== lastCommand) {
        setLastCommand(transcript);
        const gptResult = await interpretVoiceCommand(transcript);
        setInterpretation(gptResult);

        if (gptResult.task && gptResult.task !== "none" && gptResult.task !== "error") {
          await performTask(gptResult.task, gptResult.arguments);
        }
      }
    } else {
      setInterpretation(null);
      setTaskResult(null);
      setCalendarEvents([]);
      setListening(true);
    }
  };

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
      <p><strong>Transcript:</strong> {transcript}</p>
      <button onClick={toggleListening}>
        {listening ? "Stop Listening" : "Start Listening"}
      </button>

      {interpretation && (
        <div style={{ marginTop: "1rem", textAlign: "left" }}>
          <h3>Interpretation:</h3>
          <pre>{JSON.stringify(interpretation, null, 2)}</pre>
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
      {/* Calendar Events create */}

      {taskResult?.task === "create_calendar_event" && taskResult.status === "success" && (
        <div style={{
          marginTop: "2rem",
          padding: "1rem",
          background: "rgba(0,229,255,0.1)",
          border: "1px solid #00e5ff",
          borderRadius: "10px",
          color: "#00e5ff",
          boxShadow: "0 0 12px #00e5ff"
        }}>
          ✅ <strong>Event Created:</strong> {taskResult.event.summary} at{" "}
          {new Date(taskResult.event.start.dateTime).toLocaleString()}
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
                  <h4 style={{ marginBottom: "0.5rem", color: "#ffffff", textShadow: `0 0 5px ${borderColor}` }}>
                    {event.summary || "Untitled Event"}
                  </h4>
                  <p><strong>Time:</strong> {startTime}</p>
                  {event.location && <p><strong>Location:</strong> {event.location}</p>}
                  {isMeeting && <p style={{ color: "#00ffc3" }}>👥 Meeting</p>}
                </div>
              );
            })}
          </div>

        {/* whatsapp text */}
        {taskResult?.task === "send_whatsapp" && (
          <div style={{
            marginTop: "2rem",
            padding: "1rem",
            background: "rgba(0,229,255,0.1)",
            border: "1px solid #00e5ff",
            borderRadius: "10px",
            color: "#00e5ff",
            boxShadow: "0 0 12px #00e5ff"
          }}>
            ✅ <strong>Message Sent</strong><br />
            Message SID: {taskResult.sid}
          </div>
        )}


          {/* Highlighted text area */}
          {spokenWords.length > 0 && (
  <div style={{
    marginTop: "2rem",
    textAlign: "center",
    padding: "1rem",
    border: "1px solid #00e5ff",
    borderRadius: "8px",
    boxShadow: "0 0 10px #00e5ff",
    background: "rgba(0, 229, 255, 0.05)",
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
        </div>
      )}
    </div>
  );
}

export default VoiceAssistant;

