import { useRef, useEffect, useState, useCallback } from "react";
import { Camera, CameraOff, FlipHorizontal, Loader2, Hand, ScanFace } from "lucide-react";
import { useFaceLandmarks, type FaceLandmarks } from "@/hooks/useFaceLandmarks";
import { useHandLandmarks, type HandLandmarks } from "@/hooks/useHandLandmarks";

export interface TrackingData {
  face: FaceLandmarks | null;
  hands: HandLandmarks[];
}

interface CameraViewProps {
  onTrackingUpdate?: (data: TrackingData) => void;
  children?: React.ReactNode;
}

const CameraView = ({ onTrackingUpdate, children }: CameraViewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [mirrored, setMirrored] = useState(true);
  const streamRef = useRef<MediaStream | null>(null);

  const { landmarks: faceLandmarks, isLoading: faceLoading, error: faceError } = useFaceLandmarks(videoRef);
  const { hands: handLandmarks, isLoading: handLoading, error: handError } = useHandLandmarks(videoRef);

  const modelsLoading = faceLoading || handLoading;
  const modelError = faceError || handError;

  // Forward tracking data to parent
  useEffect(() => {
    onTrackingUpdate?.({ face: faceLandmarks, hands: handLandmarks });
  }, [faceLandmarks, handLandmarks, onTrackingUpdate]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
        setCameraError(null);
      }
    } catch {
      setCameraError("Camera access denied. Please allow camera permissions.");
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
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6">
          <div className="w-24 h-24 rounded-full border-2 border-gold/30 flex items-center justify-center">
            <Camera className="w-10 h-10 text-gold/60" />
          </div>
          <p className="text-foreground font-display text-xl mb-1">AR Try-On</p>
          <p className="text-muted-foreground font-body text-sm max-w-xs text-center">
            {cameraError || "Enable your camera to try on jewellery with real-time face & hand tracking"}
          </p>
          <button
            onClick={startCamera}
            className="bg-gold-gradient text-primary-foreground font-body text-sm font-medium px-8 py-3 rounded-sm tracking-wider uppercase hover:opacity-90 transition-opacity mt-2"
          >
            Enable Camera
          </button>
        </div>
      )}

      {/* Tracking status badges */}
      {isStreaming && (
        <div className="absolute top-4 left-4 z-30 flex flex-col gap-1.5">
          {modelsLoading ? (
            <div className="glass-dark px-3 py-2 rounded-sm border border-border flex items-center gap-2">
              <Loader2 className="w-3 h-3 text-gold animate-spin" />
              <span className="text-xs font-body text-muted-foreground">Loading AR models...</span>
            </div>
          ) : modelError ? (
            <div className="glass-dark px-3 py-2 rounded-sm border border-destructive/30">
              <span className="text-xs font-body text-destructive">{modelError}</span>
            </div>
          ) : (
            <>
              {/* Face status */}
              <div className={`glass-dark px-3 py-1.5 rounded-sm border flex items-center gap-2 ${
                faceLandmarks ? "border-gold/30" : "border-border"
              }`}>
                <ScanFace className={`w-3.5 h-3.5 ${faceLandmarks ? "text-gold" : "text-muted-foreground"}`} />
                <span className={`text-xs font-body ${faceLandmarks ? "text-foreground" : "text-muted-foreground"}`}>
                  {faceLandmarks ? "Face tracked" : "No face"}
                </span>
                {faceLandmarks && <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />}
              </div>
              {/* Hand status */}
              <div className={`glass-dark px-3 py-1.5 rounded-sm border flex items-center gap-2 ${
                handLandmarks.length > 0 ? "border-gold/30" : "border-border"
              }`}>
                <Hand className={`w-3.5 h-3.5 ${handLandmarks.length > 0 ? "text-gold" : "text-muted-foreground"}`} />
                <span className={`text-xs font-body ${handLandmarks.length > 0 ? "text-foreground" : "text-muted-foreground"}`}>
                  {handLandmarks.length > 0
                    ? `${handLandmarks.length} hand${handLandmarks.length > 1 ? "s" : ""}`
                    : "No hands"}
                </span>
                {handLandmarks.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />}
              </div>
            </>
          )}
        </div>
      )}

      {/* Jewellery overlays rendered by parent */}
      {isStreaming && children}

      {/* Camera controls */}
      {isStreaming && (
        <div className="absolute top-4 right-4 flex gap-2 z-30">
          <button
            onClick={() => setMirrored(!mirrored)}
            className="glass-dark p-2.5 rounded-sm border border-border hover:border-gold/30 transition-colors"
          >
            <FlipHorizontal className="w-4 h-4 text-foreground" />
          </button>
          <button
            onClick={stopCamera}
            className="glass-dark p-2.5 rounded-sm border border-border hover:border-destructive/50 transition-colors"
          >
            <CameraOff className="w-4 h-4 text-foreground" />
          </button>
        </div>
      )}
    </div>
  );
};

export default CameraView;
