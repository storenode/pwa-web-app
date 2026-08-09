import { useState } from "react";
import { useVoiceRecorder } from "../hooks/useVoiceRecorder";
import { submitVoiceReview } from "../voicenotes.api";

const MicIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    className="size-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
    />
  </svg>
);

interface VoiceYourReviewButtonProps {
  storeId: string | undefined;
  phone: string;
}

export default function VoiceYourReviewButton({
  storeId,
  phone,
}: VoiceYourReviewButtonProps) {
  const {
    isSupported,
    isRecording,
    transcript,
    setTranscript,
    error,
    start,
    stop,
    reset,
  } = useVoiceRecorder();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!storeId || !transcript.trim()) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await submitVoiceReview(storeId, phone, transcript.trim());
      setIsSubmitted(true);
    } catch (err) {
      setSubmitError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRerecord = () => {
    reset();
    setIsSubmitted(false);
    setSubmitError(null);
  };

  if (!isSupported) {
    return null;
  }

  if (isSubmitted) {
    return (
      <p className="text-success text-sm text-center">
        Thanks for your feedback — the store team will read it soon!
      </p>
    );
  }

  // Nothing recorded yet, and not currently recording.
  if (!isRecording && !transcript) {
    return (
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={start}
          className="btn btn-info gap-2 w-full justify-center hover:btn-info-focus"
        >
          <MicIcon />
          Voice Your Review
        </button>
        {error && (
          <span className="text-error text-sm text-center">{error}</span>
        )}
      </div>
    );
  }

  // Actively recording.
  if (isRecording) {
    return (
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={stop}
          className="btn btn-error gap-2 w-full justify-center animate-pulse"
        >
          <MicIcon />
          Recording... tap to stop
        </button>
        {transcript && (
          <p className="text-sm text-base-content/70 italic">{transcript}</p>
        )}
      </div>
    );
  }

  // Stopped, transcript ready to review/edit before submitting.
  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        className="textarea textarea-bordered w-full"
        rows={3}
      />
      {submitError && (
        <span className="text-error text-sm">{submitError}</span>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          className="btn btn-ghost flex-1"
          disabled={isSubmitting}
          onClick={handleRerecord}
        >
          Re-record
        </button>
        <button
          type="button"
          className="btn btn-info flex-1"
          disabled={isSubmitting || !transcript.trim()}
          onClick={() => void handleSubmit()}
        >
          {isSubmitting ? "Submitting..." : "Submit Feedback"}
        </button>
      </div>
    </div>
  );
}
