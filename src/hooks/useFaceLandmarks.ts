import { useRef, useEffect, useState, useCallback } from "react";
import {
  FaceLandmarker,
  FilesetResolver,
  type NormalizedLandmark,
} from "@mediapipe/tasks-vision";

export interface FaceLandmarks {
  all: NormalizedLandmark[];
  leftEar: NormalizedLandmark;
  rightEar: NormalizedLandmark;
  leftEarlobe: NormalizedLandmark;
  rightEarlobe: NormalizedLandmark;
  chin: NormalizedLandmark;
  neckCenter: NormalizedLandmark;
  noseTip: NormalizedLandmark;
  forehead: NormalizedLandmark;
  faceWidth: number;
  rotationAngle: number;
}

const LANDMARK_INDICES = {
  noseTip: 1,
  chin: 152,
  leftEar: 234,
  rightEar: 454,
  // Jaw corners near ears — better earlobe approximation
  leftJawEar: 132,
  rightJawEar: 361,
  forehead: 10,
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

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        setIsLoading(true);
        setError(null);

        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm"
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
      } catch (err) {
        if (!cancelled) {
          console.error("FaceLandmarker init error:", err);
          // Retry with CPU delegate
          try {
            const vision = await FilesetResolver.forVisionTasks(
              "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm"
            );
            if (cancelled) return;
            const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
              baseOptions: {
                modelAssetPath:
                  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
                delegate: "CPU",
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
          } catch (retryErr) {
            if (!cancelled) {
              console.error("FaceLandmarker CPU fallback error:", retryErr);
              setError("Face detection unavailable. Check internet connection.");
              setIsLoading(false);
            }
          }
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
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const detect = useCallback(() => {
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;

    if (!video || !landmarker || video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(detect);
      return;
    }

    const now = performance.now();
    if (now <= lastTimeRef.current) {
      animFrameRef.current = requestAnimationFrame(detect);
      return;
    }
    lastTimeRef.current = now;

    try {
      const result = landmarker.detectForVideo(video, now);

      if (result.faceLandmarks && result.faceLandmarks.length > 0) {
        const face = result.faceLandmarks[0];

        const leftEar = face[LANDMARK_INDICES.leftEar];
        const rightEar = face[LANDMARK_INDICES.rightEar];
        const leftJawEar = face[LANDMARK_INDICES.leftJawEar];
        const rightJawEar = face[LANDMARK_INDICES.rightJawEar];

        const chin = face[LANDMARK_INDICES.chin];
        const noseTip = face[LANDMARK_INDICES.noseTip];
        const forehead = face[LANDMARK_INDICES.forehead];

        const faceWidth = Math.abs(leftEar.x - rightEar.x);

        // Lateral correction: push visible ear's earring outward in profile view
        const faceCenterX = (leftEar.x + rightEar.x) / 2;
        const noseOffset = noseTip.x - faceCenterX; // positive = turned showing left ear
        const boost = Math.abs(noseOffset) * 0.4;

        const leftEarlobe: NormalizedLandmark = {
          x: leftEar.x - (noseOffset > 0 ? boost : boost * 0.15),
          y: leftJawEar.y,
          z: leftEar.z,
          visibility: 1,
        };
        const rightEarlobe: NormalizedLandmark = {
          x: rightEar.x + (noseOffset < 0 ? boost : boost * 0.15),
          y: rightJawEar.y,
          z: rightEar.z,
          visibility: 1,
        };

        const jawLeft = face[LANDMARK_INDICES.jawLeft];
        const jawRight = face[LANDMARK_INDICES.jawRight];
        const neckCenter: NormalizedLandmark = {
          x: (jawLeft.x + jawRight.x) / 2,
          y: chin.y + (chin.y - noseTip.y) * 0.18,
          z: chin.z,
          visibility: 1,
        };

        const leftDist = Math.abs(noseTip.x - leftEar.x);
        const rightDist = Math.abs(noseTip.x - rightEar.x);
        const rotationAngle = ((rightDist - leftDist) / (rightDist + leftDist)) * 30;

        setLandmarks({
          all: face,
          leftEar,
          rightEar,
          leftEarlobe,
          rightEarlobe,
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
