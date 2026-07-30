import { useRef, useEffect, useState, useCallback } from "react";
import { Camera, CameraOff, FlipHorizontal } from "lucide-react";

interface CameraViewProps {
  children?: React.ReactNode;
}

const CameraView = ({ children }: CameraViewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mirrored, setMirrored] = useState(true);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
        setError(null);
      }
    } catch {
      setError("Camera access denied. Please allow camera permissions.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setIsStreaming(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full bg-noir-light rounded-sm overflow-hidden">
      {/* Video feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover ${mirrored ? "scale-x-[-1]" : ""} ${
          !isStreaming ? "hidden" : ""
        }`}
      />

      {/* Placeholder when camera is off */}
      {!isStreaming && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <div className="w-20 h-20 rounded-full border-2 border-gold/30 flex items-center justify-center">
            <Camera className="w-8 h-8 text-gold/60" />
          </div>
          <p className="text-muted-foreground font-body text-sm">
            {error || "Start camera to begin try-on"}
          </p>
          <button
            onClick={startCamera}
            className="bg-gold-gradient text-primary-foreground font-body text-sm font-medium px-6 py-2.5 rounded-sm tracking-wider uppercase hover:opacity-90 transition-opacity"
          >
            Enable Camera
          </button>
        </div>
      )}

      {/* Jewellery overlays */}
      {isStreaming && children}

      {/* Camera controls */}
      {isStreaming && (
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => setMirrored(!mirrored)}
            className="glass-dark p-2.5 rounded-sm border border-border hover:border-gold/30 transition-colors"
            title="Flip camera"
          >
            <FlipHorizontal className="w-4 h-4 text-foreground" />
          </button>
          <button
            onClick={stopCamera}
            className="glass-dark p-2.5 rounded-sm border border-border hover:border-destructive/50 transition-colors"
            title="Stop camera"
          >
            <CameraOff className="w-4 h-4 text-foreground" />
          </button>
        </div>
      )}
    </div>
  );
};

export default CameraView;
