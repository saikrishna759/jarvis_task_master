import { useState, useEffect } from 'react';

export default function useSpeech() {
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);

  
  
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech recognition is not supported in this browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        interimTranscript += event.results[i][0].transcript;
      }
      setTranscript(interimTranscript);
    };
    
    if (listening) {
      recognition.start();
    } else {
      recognition.stop();
    }
    
    return () => recognition.stop();
  }, [listening]);

  return { transcript, listening, setListening };
}
