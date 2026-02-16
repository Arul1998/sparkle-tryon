import { useRef, useEffect, useState, useCallback } from "react";
import {
  HandLandmarker,
  FilesetResolver,
  type NormalizedLandmark,
} from "@mediapipe/tasks-vision";

export interface HandLandmarks {
  /** All 21 hand landmarks */
  all: NormalizedLandmark[];
  /** Wrist point (landmark 0) */
  wrist: NormalizedLandmark;
  /** Ring finger MCP (base, landmark 13) — for ring placement */
  ringFingerBase: NormalizedLandmark;
  /** Ring finger PIP (landmark 14) */
  ringFingerMid: NormalizedLandmark;
  /** Middle finger MCP (landmark 9) */
  middleFingerBase: NormalizedLandmark;
  /** Index finger MCP (landmark 5) */
  indexFingerBase: NormalizedLandmark;
  /** Pinky MCP (landmark 17) */
  pinkyBase: NormalizedLandmark;
  /** Estimated hand width for scaling */
  handWidth: number;
  /** Hand label: Left or Right */
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
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
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
        setError(null);
      } catch (err) {
        if (!cancelled) {
          console.error("HandLandmarker init error:", err);
          setError("Failed to load hand detection model");
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

      if (result.landmarks && result.landmarks.length > 0) {
        const detectedHands: HandLandmarks[] = result.landmarks.map((hand, i) => {
          const wrist = hand[0];
          const indexBase = hand[5];
          const middleBase = hand[9];
          const ringBase = hand[13];
          const ringMid = hand[14];
          const pinkyBase = hand[17];

          // Hand width: distance from index MCP to pinky MCP
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
