import { useRef, useEffect, useState, useCallback } from "react";
import { Camera, CameraOff, FlipHorizontal, Loader2, Hand, ScanFace, AlertCircle } from "lucide-react";
import { useFaceLandmarks, type FaceLandmarks } from "@/hooks/useFaceLandmarks";
import { useHandLandmarks, type HandLandmarks } from "@/hooks/useHandLandmarks";
import { Progress } from "@/components/ui/progress";

export interface TrackingData {
  face: FaceLandmarks | null;
  hands: HandLandmarks[];
  videoWidth: number;
  videoHeight: number;
}

interface CameraViewProps {
  mirrored: boolean;
  onMirroredChange: (mirrored: boolean) => void;
  onTrackingUpdate?: (data: TrackingData) => void;
  children?: React.ReactNode;
}

const cameraErrorMessage = (error: unknown) => {
  if (error instanceof DOMException && error.name === "NotAllowedError") {
    return "Camera access denied. Please allow camera permissions in your browser settings.";
  }
  if (error instanceof DOMException && error.name === "NotFoundError") {
    return "No camera found. Please connect a camera and try again.";
  }
  return "Could not start camera. Please check your device and try again.";
};

const CameraView = ({
  mirrored,
  onMirroredChange,
  onTrackingUpdate,
  children,
}: CameraViewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const { landmarks: faceLandmarks, isLoading: faceLoading, error: faceError } = useFaceLandmarks(videoRef);
  const { hands: handLandmarks, isLoading: handLoading, error: handError } = useHandLandmarks(videoRef);

  const modelsLoading = faceLoading || handLoading;
  const modelError = faceError && handError ? `${faceError}. ${handError}` : faceError || handError;

  useEffect(() => {
    if (!modelsLoading) {
      setLoadingProgress(100);
      return;
    }
    let progress = 0;
    const interval = window.setInterval(() => {
      progress = Math.min(progress + 8, 90);
      setLoadingProgress(progress);
    }, 500);
    return () => window.clearInterval(interval);
  }, [modelsLoading]);

  useEffect(() => {
    const video = videoRef.current;
    onTrackingUpdate?.({
      face: faceLandmarks,
      hands: handLandmarks,
      videoWidth: video?.videoWidth ?? 0,
      videoHeight: video?.videoHeight ?? 0,
    });
  }, [faceLandmarks, handLandmarks, onTrackingUpdate]);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera access requires a modern browser and a secure HTTPS connection.");
      return;
    }
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
    } catch (error: unknown) {
      setCameraError(cameraErrorMessage(error));
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsStreaming(false);
  }, []);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  return (
    <div className="relative w-full h-full bg-noir-light rounded-sm overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover ${mirrored ? "scale-x-[-1]" : ""} ${!isStreaming ? "hidden" : ""}`}
      />

      {!isStreaming && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6">
          <div className="w-24 h-24 rounded-full border-2 border-gold/30 flex items-center justify-center">
            <Camera className="w-10 h-10 text-gold/60" />
          </div>
          <p className="text-foreground font-display text-xl mb-1">AR Try-On</p>
          <p className="text-muted-foreground font-body text-sm max-w-xs text-center">
            {cameraError || "Enable your camera to try on jewellery with real-time face & hand tracking"}
          </p>
          {cameraError && (
            <div className="flex items-start gap-2 glass-dark p-3 rounded-sm border border-destructive/30 max-w-xs">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-xs font-body text-muted-foreground">
                Check the camera icon in your address bar or your browser privacy settings.
              </p>
            </div>
          )}
          <button
            onClick={startCamera}
            className="bg-gold-gradient text-primary-foreground font-body text-sm font-medium px-8 py-3 rounded-sm tracking-wider uppercase hover:opacity-90 transition-opacity mt-2"
          >
            Enable Camera
          </button>
        </div>
      )}

      {isStreaming && (
        <div className="absolute top-4 left-4 z-30 flex flex-col gap-1.5">
          {modelsLoading ? (
            <div className="glass-dark px-3 py-2.5 rounded-sm border border-border space-y-2 min-w-[180px]">
              <div className="flex items-center gap-2">
                <Loader2 className="w-3 h-3 text-gold animate-spin" />
                <span className="text-xs font-body text-muted-foreground">Loading AR models...</span>
              </div>
              <Progress value={loadingProgress} className="h-1.5" />
            </div>
          ) : modelError ? (
            <div className="glass-dark px-3 py-2 rounded-sm border border-destructive/30 max-w-[220px]">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
                <span className="text-xs font-body text-destructive">{modelError}</span>
              </div>
            </div>
          ) : (
            <>
              <div className={`glass-dark px-3 py-1.5 rounded-sm border flex items-center gap-2 ${faceLandmarks ? "border-gold/30" : "border-border"}`}>
                <ScanFace className={`w-3.5 h-3.5 ${faceLandmarks ? "text-gold" : "text-muted-foreground"}`} />
                <span className="text-xs font-body text-muted-foreground">
                  {faceLandmarks ? "Face tracked" : "Looking for face..."}
                </span>
              </div>
              <div className={`glass-dark px-3 py-1.5 rounded-sm border flex items-center gap-2 ${handLandmarks.length ? "border-gold/30" : "border-border"}`}>
                <Hand className={`w-3.5 h-3.5 ${handLandmarks.length ? "text-gold" : "text-muted-foreground"}`} />
                <span className="text-xs font-body text-muted-foreground">
                  {handLandmarks.length
                    ? `${handLandmarks.length} hand${handLandmarks.length > 1 ? "s" : ""} tracked`
                    : "Show hand for rings"}
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {isStreaming && children}

      {isStreaming && (
        <div className="absolute top-4 right-4 flex gap-2 z-30">
          <button
            onClick={() => onMirroredChange(!mirrored)}
            className="glass-dark p-2.5 rounded-sm border border-border hover:border-gold/30 transition-colors"
            aria-label={mirrored ? "Use unmirrored camera view" : "Mirror camera view"}
          >
            <FlipHorizontal className="w-4 h-4 text-foreground" />
          </button>
          <button
            onClick={stopCamera}
            className="glass-dark p-2.5 rounded-sm border border-border hover:border-destructive/50 transition-colors"
            aria-label="Stop camera"
          >
            <CameraOff className="w-4 h-4 text-foreground" />
          </button>
        </div>
      )}
    </div>
  );
};

export default CameraView;
