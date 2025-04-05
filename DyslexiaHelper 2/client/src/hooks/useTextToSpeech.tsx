import { useState, useEffect } from 'react';

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [pitch, setPitch] = useState(1);
  const [rate, setRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [error, setError] = useState<string | null>(null);
  
  // Check if SpeechSynthesis is supported
  const isSupported = 'speechSynthesis' in window;
  
  // Get available voices
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  useEffect(() => {
    if (!isSupported) {
      setError('Text-to-speech is not supported in your browser.');
      return;
    }
    
    // Function to get voices
    const getVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      // Set default voice (preferably English)
      if (availableVoices.length > 0) {
        const englishVoice = availableVoices.find(voice => voice.lang.includes('en-'));
        setVoice(englishVoice || availableVoices[0]);
      }
    };
    
    // Chrome loads voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = getVoices;
    }
    
    getVoices();
    
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [isSupported]);
  
  // Create utterance when text or voice changes
  const createUtterance = (text: string) => {
    const newUtterance = new SpeechSynthesisUtterance(text);
    
    if (voice) {
      newUtterance.voice = voice;
    }
    
    newUtterance.pitch = pitch;
    newUtterance.rate = rate;
    newUtterance.volume = volume;
    
    newUtterance.onstart = () => setIsSpeaking(true);
    newUtterance.onend = () => setIsSpeaking(false);
    newUtterance.onpause = () => setIsPaused(true);
    newUtterance.onresume = () => setIsPaused(false);
    newUtterance.onerror = (event) => {
      setError(`An error occurred: ${event.error}`);
      setIsSpeaking(false);
    };
    
    setUtterance(newUtterance);
    return newUtterance;
  };
  
  // Speak function
  const speak = (text: string) => {
    if (!isSupported) {
      setError('Text-to-speech is not supported in your browser.');
      return;
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const newUtterance = createUtterance(text);
    window.speechSynthesis.speak(newUtterance);
  };
  
  // Pause function
  const pause = () => {
    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };
  
  // Resume function
  const resume = () => {
    if (isSpeaking && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };
  
  // Cancel function
  const cancel = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };
  
  // Change voice
  const changeVoice = (voiceURI: string) => {
    const newVoice = voices.find(v => v.voiceURI === voiceURI) || null;
    setVoice(newVoice);
    
    if (utterance && newVoice) {
      utterance.voice = newVoice;
    }
  };
  
  // Change speech parameters
  const changePitch = (newPitch: number) => {
    setPitch(newPitch);
    if (utterance) utterance.pitch = newPitch;
  };
  
  const changeRate = (newRate: number) => {
    setRate(newRate);
    if (utterance) utterance.rate = newRate;
  };
  
  const changeVolume = (newVolume: number) => {
    setVolume(newVolume);
    if (utterance) utterance.volume = newVolume;
  };
  
  return {
    speak,
    pause,
    resume,
    cancel,
    isSpeaking,
    isPaused,
    voices,
    currentVoice: voice,
    changeVoice,
    pitch,
    changePitch,
    rate,
    changeRate,
    volume,
    changeVolume,
    error,
    isSupported
  };
}
