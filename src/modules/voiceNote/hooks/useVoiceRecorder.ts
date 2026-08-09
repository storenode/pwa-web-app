import { useEffect, useRef, useState } from "react";

function getSpeechRecognitionCtor(): (new () => SpeechRecognition) | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

/**
 * Wraps the browser's Web Speech API (Chrome: window.webkitSpeechRecognition)
 * to turn the mic into live text — no audio upload, no server round-trip
 * for transcription. isSupported is false outside Chrome/Chromium, so
 * callers can show a fallback instead of a broken mic button.
 */
export function useVoiceRecorder() {
  const [isSupported] = useState(() => getSpeechRecognitionCtor() !== null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef("");

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const start = () => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setError("Voice review isn't supported in this browser — try Chrome.");
      return;
    }

    setError(null);
    finalTranscriptRef.current = "";
    setTranscript("");

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        if (result.isFinal) {
          finalTranscriptRef.current += `${text} `;
        } else {
          interim += text;
        }
      }
      setTranscript(`${finalTranscriptRef.current}${interim}`.trim());
    };

    recognition.onerror = (event) => {
      setError(`Couldn't hear you clearly (${event.error}) — try again.`);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const stop = () => {
    recognitionRef.current?.stop();
  };

  const reset = () => {
    finalTranscriptRef.current = "";
    setTranscript("");
    setError(null);
  };

  return {
    isSupported,
    isRecording,
    transcript,
    setTranscript,
    error,
    start,
    stop,
    reset,
  };
}
