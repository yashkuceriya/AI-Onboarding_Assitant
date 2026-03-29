import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, RotateCcw, Check, X, AlertTriangle, ZoomIn } from 'lucide-react';

interface DocumentCaptureProps {
  onCapture: (file: File) => void;
  documentType?: string;
}

export default function DocumentCapture({ onCapture, documentType = 'ID' }: DocumentCaptureProps) {
  const [mode, setMode] = useState<'select' | 'camera' | 'preview'>('select');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      setStream(mediaStream);
      setMode('camera');

      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      });
    } catch {
      setFeedback('Camera access denied. Please use file upload instead.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);
    setMode('preview');
    stopCamera();
  }, [stopCamera]);

  const confirmCapture = useCallback(() => {
    if (!capturedImage) return;

    fetch(capturedImage)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], `${documentType}_capture.jpg`, { type: 'image/jpeg' });
        onCapture(file);
      });
  }, [capturedImage, documentType, onCapture]);

  const retake = useCallback(() => {
    setCapturedImage(null);
    setFeedback(null);
    startCamera();
  }, [startCamera]);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onCapture(file);
    },
    [onCapture]
  );

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {mode === 'select' && (
          <motion.div
            key="select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 gap-3"
          >
            <button
              onClick={startCamera}
              className="flex flex-col items-center gap-2 p-6 bg-[#e0f7fc] border-2 border-[#00aed9]/30 rounded-xl hover:bg-[#e0f7fc] transition"
            >
              <Camera size={32} className="text-[#00aed9]" />
              <span className="text-sm font-medium text-[#0090b3]">Take Photo</span>
              <span className="text-xs text-slate-500">Use camera guides</span>
            </button>
            <label className="flex flex-col items-center gap-2 p-6 bg-slate-50 border-2 border-slate-200 rounded-xl hover:bg-slate-100 transition cursor-pointer">
              <Upload size={32} className="text-slate-600" />
              <span className="text-sm font-medium text-slate-700">Upload File</span>
              <span className="text-xs text-slate-500">JPG, PNG, PDF</span>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </motion.div>
        )}

        {mode === 'camera' && (
          <motion.div
            key="camera"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative rounded-xl overflow-hidden bg-black"
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full aspect-[4/3] object-cover"
            />

            {/* Document overlay guides */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[85%] h-[60%] border-2 border-white/70 rounded-lg relative">
                {/* Corner guides */}
                <div className="absolute -top-0.5 -left-0.5 w-6 h-6 border-t-4 border-l-4 border-[#00aed9] rounded-tl" />
                <div className="absolute -top-0.5 -right-0.5 w-6 h-6 border-t-4 border-r-4 border-[#00aed9] rounded-tr" />
                <div className="absolute -bottom-0.5 -left-0.5 w-6 h-6 border-b-4 border-l-4 border-[#00aed9] rounded-bl" />
                <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 border-b-4 border-r-4 border-[#00aed9] rounded-br" />
              </div>
            </div>

            {/* Guidance text */}
            <div className="absolute top-3 left-0 right-0 text-center">
              <span className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
                Align your {documentType} within the frame
              </span>
            </div>

            {/* Tips */}
            <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-3">
              <span className="bg-black/60 text-white/90 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <ZoomIn size={10} /> Fill the frame
              </span>
              <span className="bg-black/60 text-white/90 text-xs px-2 py-1 rounded-full">
                Good lighting
              </span>
            </div>

            {/* Controls */}
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-4">
              <button
                onClick={() => { stopCamera(); setMode('select'); }}
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
              >
                <X size={20} className="text-white" />
              </button>
              <button
                onClick={capturePhoto}
                className="w-14 h-14 bg-white rounded-full border-4 border-[#00aed9] flex items-center justify-center hover:scale-105 transition"
              >
                <div className="w-10 h-10 bg-[#00aed9] rounded-full" />
              </button>
            </div>
          </motion.div>
        )}

        {mode === 'preview' && capturedImage && (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="relative rounded-xl overflow-hidden">
              <img src={capturedImage} alt="Captured document" className="w-full" />
            </div>
            <div className="flex gap-2">
              <button
                onClick={retake}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-lg flex items-center justify-center gap-2 text-sm font-medium hover:bg-slate-200 transition"
              >
                <RotateCcw size={16} />
                Retake
              </button>
              <button
                onClick={confirmCapture}
                className="flex-1 py-2.5 bg-[#00aed9] text-white rounded-lg flex items-center justify-center gap-2 text-sm font-medium hover:bg-[#0090b3] transition"
              >
                <Check size={16} />
                Use Photo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {feedback && (
        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
          <AlertTriangle size={14} />
          {feedback}
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
