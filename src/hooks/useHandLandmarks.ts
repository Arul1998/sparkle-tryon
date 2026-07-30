import { useRef, useEffect, useState, useCallback } from "react";
import {
  HandLandmarker,
  FilesetResolver,
  type NormalizedLandmark,
} from "@mediapipe/tasks-vision";

export interface HandLandmarks {
  all: NormalizedLandmark[];
  wrist: NormalizedLandmark;
  ringFingerBase: NormalizedLandmark;
  ringFingerMid: NormalizedLandmark;
  middleFingerBase: NormalizedLandmark;
  indexFingerBase: NormalizedLandmark;
  pinkyBase: NormalizedLandmark;
  handWidth: number;
  handedness: "Left" | "Right";
}

export function useHandLandmarks(videoRef: React.RefObject<HTMLVideoElement>) {
  const [hands, setHands] = useState<HandLandmarks[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
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

        const handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 2,
        });

        if (cancelled) {
          handLandmarker.close();
          return;
        }

        landmarkerRef.current = handLandmarker;
        setIsLoading(false);
      } catch (err) {
        if (!cancelled) {
          console.error("HandLandmarker init error:", err);
          // Retry with CPU delegate
          try {
            const vision = await FilesetResolver.forVisionTasks(
              "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm"
            );
            if (cancelled) return;
            const handLandmarker = await HandLandmarker.createFromOptions(vision, {
              baseOptions: {
                modelAssetPath:
                  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
                delegate: "CPU",
              },
              runningMode: "VIDEO",
              numHands: 2,
            });
            if (cancelled) {
              handLandmarker.close();
              return;
            }
            landmarkerRef.current = handLandmarker;
            setIsLoading(false);
          } catch (retryErr) {
            if (!cancelled) {
              console.error("HandLandmarker CPU fallback error:", retryErr);
              setError("Hand detection unavailable. Check internet connection.");
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

      if (result.landmarks && result.landmarks.length > 0) {
        const detectedHands: HandLandmarks[] = result.landmarks.map((hand, i) => {
          const wrist = hand[0];
          const indexBase = hand[5];
          const middleBase = hand[9];
          const ringBase = hand[13];
          const ringMid = hand[14];
          const pinkyBase = hand[17];

          const handWidth = Math.sqrt(
            Math.pow(indexBase.x - pinkyBase.x, 2) +
            Math.pow(indexBase.y - pinkyBase.y, 2)
          );

          const handedness = (result.handednesses?.[i]?.[0]?.categoryName as "Left" | "Right") ?? "Right";

          return {
            all: hand,
            wrist,
            ringFingerBase: ringBase,
            ringFingerMid: ringMid,
            middleFingerBase: middleBase,
            indexFingerBase: indexBase,
            pinkyBase,
            handWidth,
            handedness,
          };
        });

        setHands(detectedHands);
      } else {
        setHands([]);
      }
    } catch {
      // continue
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

  return { hands, isLoading, error };
}
