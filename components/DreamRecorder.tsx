import React, { useState, useRef, useEffect } from 'react';
import { ImageSize } from '../types';

interface DreamRecorderProps {
  onRecordingComplete: (blob: Blob, imageSize: ImageSize) => void;
}

export const DreamRecorder: React.FC<DreamRecorderProps> = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [selectedSize, setSelectedSize] = useState<ImageSize>(ImageSize.Size1K);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const startVisualizer = (stream: MediaStream) => {
    if (!canvasRef.current) return;
    
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioCtx = new AudioContextClass();

    audioContextRef.current = audioCtx;
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;

    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = '#0B0C15'; // Clear with bg color
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 60;

      // Draw circular visualizer
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - 5, 0, 2 * Math.PI);
      ctx.strokeStyle = '#23263A';
      ctx.stroke();

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] / 2;
        const angle = (i / bufferLength) * Math.PI * 2;
        
        const x1 = centerX + Math.cos(angle) * radius;
        const y1 = centerY + Math.sin(angle) * radius;
        const x2 = centerX + Math.cos(angle) * (radius + barHeight);
        const y2 = centerY + Math.sin(angle) * (radius + barHeight);

        ctx.strokeStyle = `rgba(139, 92, 246, ${dataArray[i] / 255})`; // Mystic purple
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    };
    draw();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      startVisualizer(stream);
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(blob, selectedSize);
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setDuration(0);
      
      timerRef.current = window.setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access denied. Please allow permissions to record your dream.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto px-6">
      <div className="relative w-64 h-64 mb-8 flex items-center justify-center">
        <canvas 
          ref={canvasRef} 
          width={300} 
          height={300} 
          className="absolute inset-0 w-full h-full"
        />
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.6)]' 
              : 'bg-mystic-500 hover:bg-mystic-400 shadow-[0_0_20px_rgba(139,92,246,0.4)]'
          }`}
        >
          {isRecording ? (
            <div className="w-8 h-8 bg-white rounded-sm" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
          )}
        </button>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-serif text-white mb-2">
          {isRecording ? "Recording Dream..." : "Tap to Record"}
        </h2>
        <p className="text-mystic-300 font-mono text-lg">
          {formatTime(duration)}
        </p>
      </div>

      <div className="w-full bg-night-800 rounded-xl p-6 border border-mystic-500/20">
        <label className="block text-sm font-medium text-gray-400 mb-3">Image Quality (Nano Banana Pro)</label>
        <div className="grid grid-cols-3 gap-3">
          {[ImageSize.Size1K, ImageSize.Size2K, ImageSize.Size4K].map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              disabled={isRecording}
              className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                selectedSize === size
                  ? 'bg-mystic-500 text-white shadow-lg shadow-mystic-500/20'
                  : 'bg-night-700 text-gray-400 hover:bg-night-600'
              } ${isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {size}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Higher resolution (4K) may take slightly longer to generate.
        </p>
      </div>
    </div>
  );
};