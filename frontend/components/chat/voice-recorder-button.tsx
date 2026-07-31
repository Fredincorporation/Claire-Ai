"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2, Volume2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VoiceRecorderButtonProps {
  onAudioRecorded: (audioBlob: Blob) => void;
  disabled?: boolean;
}

export function VoiceRecorderButton({ onAudioRecorded, disabled }: VoiceRecorderButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    setErrorMessage(null);
    audioChunksRef.current = [];

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Voice recording is not supported in this browser.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());
        if (audioBlob.size > 0) {
          onAudioRecorded(audioBlob);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error("Microphone access error:", err);
      setErrorMessage(err.message || "Microphone access denied or unavailable.");
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="relative flex items-center">
      {errorMessage && (
        <div className="absolute bottom-12 left-0 whitespace-nowrap bg-rose-950/90 border border-rose-500/50 text-rose-200 text-xs px-3 py-1.5 rounded-lg shadow-xl flex items-center gap-1.5 z-30">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {isRecording ? (
        <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 rounded-xl animate-pulse">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <span className="text-xs font-mono font-medium text-rose-300">
            {formatTime(recordingTime)}
          </span>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={stopRecording}
            className="h-7 w-7 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300"
            title="Stop recording"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={startRecording}
          disabled={disabled}
          className="rounded-xl shrink-0 text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
          title="Speak with Groq Whisper Voice"
        >
          <Mic className="w-5 h-5 text-purple-400 hover:text-purple-300" />
        </Button>
      )}
    </div>
  );
}
