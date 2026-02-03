import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTextToSpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice | null;
}

export const useTextToSpeech = (options: UseTextToSpeechOptions = {}) => {
  const {
    rate = 1,
    pitch = 1,
    volume = 1,
    voice = null,
  } = options;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentRate, setCurrentRate] = useState(rate);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(voice);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;

      // Load available voices
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);

        // Auto-select a good default voice
        if (!selectedVoice && voices.length > 0) {
          // Priority 1: Google US English (often very high quality)
          let bestVoice = voices.find(v => v.name === 'Google US English');

          // Priority 2: Other Google voices (usually better quality)
          if (!bestVoice) {
            bestVoice = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en'));
          }

          // Priority 3: Premium or Enhanced voices
          if (!bestVoice) {
            bestVoice = voices.find(v =>
              (v.name.includes('Premium') || v.name.includes('Enhanced')) &&
              v.lang.startsWith('en')
            );
          }

          // Priority 4: Any English voice
          if (!bestVoice) {
            bestVoice = voices.find(v => v.lang.startsWith('en'));
          }

          // Fallback
          setSelectedVoice(bestVoice || voices[0]);
        }
      };

      loadVoices();

      // Some browsers load voices asynchronously
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, [selectedVoice]);

  const speak = useCallback((text: string) => {
    if (!synthRef.current || !text.trim()) {
      return;
    }

    // Cancel any ongoing speech
    synthRef.current.cancel();

    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = currentRate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    // Event handlers
    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      utteranceRef.current = null;
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsPlaying(false);
      setIsPaused(false);
      utteranceRef.current = null;
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  }, [currentRate, pitch, volume, selectedVoice]);

  const pause = useCallback(() => {
    if (synthRef.current && isPlaying) {
      synthRef.current.pause();
      setIsPaused(true);
    }
  }, [isPlaying]);

  const resume = useCallback(() => {
    if (synthRef.current && isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
    }
  }, [isPaused]);

  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      utteranceRef.current = null;
    }
  }, []);

  const setRate = useCallback((newRate: number) => {
    setCurrentRate(newRate);
    if (utteranceRef.current) {
      utteranceRef.current.rate = newRate;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  return {
    speak,
    pause,
    resume,
    stop,
    isPlaying,
    isPaused,
    setRate,
    currentRate,
    availableVoices,
    selectedVoice,
    setSelectedVoice,
    isSupported: typeof window !== 'undefined' && 'speechSynthesis' in window,
  };
};
