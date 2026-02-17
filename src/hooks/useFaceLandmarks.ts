import { useRef, useEffect, useState, useCallback } from "react";
import {
  FaceLandmarker,
  FilesetResolver,
  type NormalizedLandmark,
} from "@mediapipe/tasks-vision";

export interface FaceLandmarks {
  /** All 478 face mesh landmarks (normalized 0-1 coordinates) */
  all: NormalizedLandmark[];
  /** Left ear tragion area */
  leftEar: NormalizedLandmark;
  /** Right ear tragion area */
  rightEar: NormalizedLandmark;
  /** Chin bottom */
  chin: NormalizedLandmark;
  /** Neck center (estimated below chin) */
  neckCenter: NormalizedLandmark;
  /** Nose tip */
  noseTip: NormalizedLandmark;
  /** Forehead center */
  forehead: NormalizedLandmark;
  /** Left wrist (not tracked by face mesh) */
  faceWidth: number;
  /** Face rotation angle in degrees */
  rotationAngle: number;
}

// Key MediaPipe Face Mesh landmark indices
// Reference: https://github.com/google/mediapipe/blob/master/mediapipe/modules/face_geometry/data/canonical_face_model_uv_visualization.png
const LANDMARK_INDICES = {
  noseTip: 1,
  chin: 152,
  leftEar: 234,    // left ear tragion area
  rightEar: 454,   // right ear tragion area
  forehead: 10,
  leftCheek: 323,
  rightCheek: 93,
  // For earring placement — outer ear/earlobe area
  leftEarBottom: 234,
  rightEarBottom: 454,
  // Jaw line points for necklace
  jawLeft: 172,
  jawRight: 397,
};

export function useFaceLandmarks(videoRef: React.RefObject<HTMLVideoElement>) {
  const [landmarks, setLandmarks] = useState<FaceLandmarks | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(-1);

  // Initialize FaceLandmarker
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        setIsLoading(true);
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        if (cancelled) return;

        const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numFaces: 1,
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false,
        });

        if (cancelled) {
          faceLandmarker.close();
          return;
        }

        landmarkerRef.current = faceLandmarker;
        setIsLoading(false);
        setError(null);
      } catch (err) {
        if (!cancelled) {
          console.error("FaceLandmarker init error:", err);
          setError("Failed to load face detection model");
          setIsLoading(false);
        }
      }
    }

    init();

    return () => {
      cancelled = true;
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
        landmarkerRef.current = null;
      }
    };
  }, []);

  // Detection loop
  const detect = useCallback(() => {
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;

    if (!video || !landmarker || video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(detect);
      return;
    }

    const now = performance.now();
    if (now === lastTimeRef.current) {
      animFrameRef.current = requestAnimationFrame(detect);
      return;
    }
    lastTimeRef.current = now;

    try {
      const result = landmarker.detectForVideo(video, now);

      if (result.faceLandmarks && result.faceLandmarks.length > 0) {
        const face = result.faceLandmarks[0];

        const leftEar = face[LANDMARK_INDICES.leftEarBottom];
        const rightEar = face[LANDMARK_INDICES.rightEarBottom];
        const chin = face[LANDMARK_INDICES.chin];
        const noseTip = face[LANDMARK_INDICES.noseTip];
        const forehead = face[LANDMARK_INDICES.forehead];

        // Estimate neck center below chin
        const jawLeft = face[LANDMARK_INDICES.jawLeft];
        const jawRight = face[LANDMARK_INDICES.jawRight];
        const neckCenter: NormalizedLandmark = {
          x: (jawLeft.x + jawRight.x) / 2,
          y: chin.y + (chin.y - noseTip.y) * 0.18,
          z: chin.z,
          visibility: 1,
        };

        // Face width for scaling
        const faceWidth = Math.abs(
          face[LANDMARK_INDICES.leftEar].x - face[LANDMARK_INDICES.rightEar].x
        );

        // Face rotation (yaw estimate)
        const leftDist = Math.abs(noseTip.x - face[LANDMARK_INDICES.leftEar].x);
        const rightDist = Math.abs(noseTip.x - face[LANDMARK_INDICES.rightEar].x);
        const rotationAngle = ((rightDist - leftDist) / (rightDist + leftDist)) * 30;

        setLandmarks({
          all: face,
          leftEar,
          rightEar,
          chin,
          neckCenter,
          noseTip,
          forehead,
          faceWidth,
          rotationAngle,
        });
      } else {
        setLandmarks(null);
      }
    } catch {
      // Detection can fail on some frames, just continue
    }

    animFrameRef.current = requestAnimationFrame(detect);
  }, [videoRef]);

  // Start/stop detection loop when video is playing
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const startDetection = () => {
      if (landmarkerRef.current) {
        animFrameRef.current = requestAnimationFrame(detect);
      }
    };

    const stopDetection = () => {
      cancelAnimationFrame(animFrameRef.current);
    };

    video.addEventListener("playing", startDetection);
    video.addEventListener("pause", stopDetection);
    video.addEventListener("ended", stopDetection);

    // Start if already playing
    if (!video.paused && landmarkerRef.current) {
      startDetection();
    }

    return () => {
      stopDetection();
      video.removeEventListener("playing", startDetection);
      video.removeEventListener("pause", stopDetection);
      video.removeEventListener("ended", stopDetection);
    };
  }, [videoRef, detect]);

  return { landmarks, isLoading, error };
}
