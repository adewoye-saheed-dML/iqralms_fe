'use client';

import * as React from 'react';
import { Mic, Square, Play, Pause, RotateCcw, Upload, Volume2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AudioRecorderProps {
  onAudioReady: (file: Blob | File | null) => void;
  existingAudioUrl?: string | null;
  disabled?: boolean;
}

export function AudioRecorder({
  onAudioReady,
  existingAudioUrl,
  disabled = false,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordingDuration, setRecordingDuration] = React.useState(0);
  const [audioBlob, setAudioBlob] = React.useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = React.useState<string | null>(existingAudioUrl || null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [playbackTime, setPlaybackTime] = React.useState(0);
  const [totalDuration, setTotalDuration] = React.useState(0);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isUploadedFile, setIsUploadedFile] = React.useState(false);
  const [uploadedFileName, setUploadedFileName] = React.useState<string | null>(null);

  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const timerIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = React.useRef<HTMLAudioElement | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Clean up object URLs on unmount
  React.useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (audioUrl && audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    setErrorMessage(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone recording is not supported in this browser. Please upload an audio file instead.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      audioChunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const format = mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: format });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        setIsUploadedFile(false);
        setUploadedFileName(null);
        onAudioReady(blob);

        // Stop all tracks to release mic hardware
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250); // slices of 250ms
      setIsRecording(true);
      setRecordingDuration(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || 'Failed to access microphone. Please grant permission.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  const handleReset = () => {
    if (isRecording) {
      stopRecording();
    }
    if (audioUrl && audioUrl.startsWith('blob:')) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setPlaybackTime(0);
    setTotalDuration(0);
    setIsUploadedFile(false);
    setUploadedFileName(null);
    onAudioReady(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const togglePlayback = () => {
    if (!audioPlayerRef.current || !audioUrl) return;

    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      setErrorMessage('Please select a valid audio file (.mp3, .wav, .m4a, .webm, etc.)');
      return;
    }

    if (audioUrl && audioUrl.startsWith('blob:')) {
      URL.revokeObjectURL(audioUrl);
    }

    const url = URL.createObjectURL(file);
    setAudioBlob(file);
    setAudioUrl(url);
    setIsUploadedFile(true);
    setUploadedFileName(file.name);
    setErrorMessage(null);
    onAudioReady(file);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm">Quran Recitation Recording</span>
        </div>
        {isRecording && (
          <Badge variant="destructive" className="animate-pulse flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-white animate-ping" />
            Recording ({formatTime(recordingDuration)})
          </Badge>
        )}
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-2.5 rounded-md">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main recording / playback widget */}
      <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg bg-muted/20 gap-4">
        {audioUrl ? (
          <div className="w-full space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{isUploadedFile ? `File: ${uploadedFileName}` : 'Recitation Recorded'}</span>
              <span>
                {formatTime(playbackTime)} / {formatTime(totalDuration || recordingDuration)}
              </span>
            </div>

            {/* Hidden HTML audio element */}
            <audio
              ref={audioPlayerRef}
              src={audioUrl}
              onTimeUpdate={(e) => setPlaybackTime(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => setTotalDuration(e.currentTarget.duration || 0)}
              onEnded={() => {
                setIsPlaying(false);
                setPlaybackTime(0);
              }}
              onError={() => setErrorMessage('Error playing audio file')}
            />

            {/* Playback progress bar */}
            <div
              className="w-full bg-muted rounded-full h-2 overflow-hidden cursor-pointer"
              onClick={(e) => {
                if (!audioPlayerRef.current || !totalDuration) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const newRatio = Math.max(0, Math.min(1, clickX / rect.width));
                audioPlayerRef.current.currentTime = newRatio * totalDuration;
              }}
            >
              <div
                className="bg-primary h-full transition-all duration-100"
                style={{
                  width: `${totalDuration ? (playbackTime / totalDuration) * 100 : 0}%`,
                }}
              />
            </div>

            {/* Control buttons */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={togglePlayback}
                disabled={disabled}
                className="flex items-center gap-2"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? 'Pause' : 'Play Preview'}
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleReset}
                disabled={disabled || isRecording}
                className="text-muted-foreground hover:text-destructive flex items-center gap-1.5"
              >
                <RotateCcw className="h-4 w-4" />
                Re-record / Reset
              </Button>
            </div>
          </div>
        ) : isRecording ? (
          <div className="flex flex-col items-center gap-3">
            {/* Waveform animation bars */}
            <div className="flex items-center gap-1.5 h-12">
              {[40, 75, 100, 60, 90, 45, 80, 65, 95, 50, 70, 85].map((height, idx) => (
                <div
                  key={idx}
                  className="w-1.5 bg-destructive rounded-full animate-bounce"
                  style={{
                    height: `${height}%`,
                    animationDelay: `${(idx % 4) * 0.15}s`,
                    animationDuration: '0.8s',
                  }}
                />
              ))}
            </div>

            <span className="text-xl font-mono font-bold text-destructive">
              {formatTime(recordingDuration)}
            </span>

            <Button
              type="button"
              variant="destructive"
              onClick={stopRecording}
              className="flex items-center gap-2"
            >
              <Square className="h-4 w-4" />
              Stop Recording
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="p-4 rounded-full bg-primary/10 text-primary">
              <Mic className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-medium">Record recitation with your microphone</p>
              <p className="text-xs text-muted-foreground">
                Recite clearly at your normal pace. You can review before submitting.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                type="button"
                onClick={startRecording}
                disabled={disabled}
                className="flex items-center gap-2"
              >
                <Mic className="h-4 w-4" />
                Start Recording
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload Audio File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
