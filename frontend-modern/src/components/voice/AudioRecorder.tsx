'use client';

import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadVoiceRecording } from '@/lib/apiClient';

interface AudioRecorderProps {
  onTranscription: (text: string) => void;
  lang?: string;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onTranscription, lang = 'en' }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      // Audio visualizer setup
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
        setAudioLevel(avg / 255);
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          animationFrameRef.current = requestAnimationFrame(updateLevel);
        }
      };

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        setIsProcessing(true);
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        chunksRef.current = [];

        try {
          const transcribedText = await uploadVoiceRecording(audioBlob);
          onTranscription(transcribedText);
        } catch (err: any) {
          console.error("Backend voice transcription failed:", err);
          alert(`Voice Error: ${err?.message || 'Failed to communicate with /transcribe'}. Please verify that the backend is running.`);
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      updateLevel();
    } catch (err) {
      alert("Microphone permission denied or not supported by browser.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
  };

  return (
    <div className="flex items-center gap-2">
      <AnimatePresence mode="wait">
        {isProcessing ? (
          <div className="flex items-center gap-2 px-3 py-2 bg-[#f3f2f1] border border-[#b1b4b6] text-[#0b0c0c] text-xs font-bold">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
              <Loader2 className="w-3.5 h-3.5 text-[#1d70b8]" />
            </motion.div>
            <span>Transcribing audio...</span>
          </div>
        ) : isRecording ? (
          <div className="flex items-center gap-2">
            <motion.button
              type="button"
              aria-label="Stop Voice Recording"
              whileTap={{ scale: 0.95 }}
              onClick={stopRecording}
              className="flex items-center gap-2 px-3 py-2 bg-[#d4351c] hover:bg-[#b12a15] text-white text-xs font-bold"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              <span>Stop Recording</span>
            </motion.button>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-[#fff7e6] border border-[#ffdd00]">
              <span className="w-2 h-2 rounded-full bg-[#d4351c] animate-ping" />
              <span className="text-xs text-[#0b0c0c] font-semibold">Listening...</span>
            </div>
          </div>
        ) : (
          <motion.button
            type="button"
            aria-label="Start Voice Recording"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={startRecording}
            className="p-2.5 bg-white border border-[#b1b4b6] hover:bg-[#f3f2f1] hover:border-[#0b0c0c] text-[#0b0c0c] transition-all shadow-2xs"
            title="Click to speak (Voice Legal Inquiry in English)"
          >
            <Mic className="w-4 h-4 text-[#1d70b8]" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
