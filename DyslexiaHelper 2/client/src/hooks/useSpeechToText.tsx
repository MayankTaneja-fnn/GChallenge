import { useState, useEffect } from 'react';

export function useSpeechToText() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Check if SpeechRecognition is supported
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const isSupported = !!SpeechRecognition;
  
  useEffect(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in your browser.');
      return;
    }
    
    let recognition: any = null;
    
    if (isListening) {
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setTranscript('');
      };
      
      recognition.onresult = (event: any) => {
        const currentTranscript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        
        setTranscript(currentTranscript);
      };
      
      recognition.onerror = (event: any) => {
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
    }
    
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [isListening, isSupported]);
  
  const startListening = () => {
    if (isSupported) {
      setIsListening(true);
      setError(null);
    } else {
      setError('Speech recognition is not supported in your browser.');
    }
  };
  
  const stopListening = () => {
    setIsListening(false);
  };
  
  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    isSupported
  };
}

// Declare global SpeechRecognition types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
