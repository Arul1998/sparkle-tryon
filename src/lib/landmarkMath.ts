import type { FaceLandmarks } from "@/hooks/useFaceLandmarks";
import type { HandLandmarks } from "@/hooks/useHandLandmarks";

export interface Placement {
  type: "single" | "dual";
  left?: { x: number; y: number; size: number };
  right?: { x: number; y: number; size: number };
  position?: { x: number; y: number; size: number };
  rotation: number;
}

export interface HeadPose {
  yaw: number;
  pitch: number;
  roll: number;
}

/**
 * Convert normalized landmark coords (0-1 relative to video frame)
 * to pixel coords in the container, accounting for CSS object-cover.
 */
export function landmarkToPixel(
  nx: number,
  ny: number,
  cw: number,
  ch: number,
  vw: number,
  vh: number,
  mirrored: boolean
): { px: number; py: number } {
  if (vw === 0 || vh === 0) return { px: nx * cw, py: ny * ch };

  const containerAspect = cw / ch;
  const videoAspect = vw / vh;

  let scale: number;
  let offsetX = 0;
  let offsetY = 0;

  if (videoAspect > containerAspect) {
    scale = ch / vh;
    offsetX = (vw * scale - cw) / 2;
  } else {
    scale = cw / vw;
    offsetY = (vh * scale - ch) / 2;
  }

  const x = mirrored ? 1 - nx : nx;
  const px = x * vw * scale - offsetX;
  const py = ny * vh * scale - offsetY;

  return { px, py };
}

export function getFacePlacement(
  category: "earrings" | "necklaces" | "glasses",
  landmarks: FaceLandmarks,
  cw: number, ch: number, vw: number, vh: number,
  mirrored: boolean
): Placement | null {
  const ltp = (nx: number, ny: number) => landmarkToPixel(nx, ny, cw, ch, vw, vh, mirrored);

  const lEar = ltp(landmarks.leftEar.x, landmarks.leftEar.y);
  const rEar = ltp(landmarks.rightEar.x, landmarks.rightEar.y);
  const fwPx = Math.abs(lEar.px - rEar.px);

  if (category === "earrings") {
    const left = ltp(landmarks.leftEarlobe.x, landmarks.leftEarlobe.y);
    const right = ltp(landmarks.rightEarlobe.x, landmarks.rightEarlobe.y);
    const size = fwPx * 0.4;
    const rot = landmarks.rotationAngle;
    const threshold = 5;
    const showLeft = rot > -threshold;
    const showRight = rot < threshold;

    return {
      type: "dual",
      left: showLeft ? { x: left.px, y: left.py + size * 0.15, size } : undefined,
      right: showRight ? { x: right.px, y: right.py + size * 0.15, size } : undefined,
      rotation: landmarks.rotationAngle,
    };
  }

  if (category === "necklaces") {
    const neck = ltp(landmarks.neckCenter.x, landmarks.neckCenter.y);
    const size = fwPx * 1.3;
    return {
      type: "single",
      position: { x: neck.px, y: neck.py + size * 0.05, size },
      rotation: landmarks.rotationAngle * 0.4,
    };
  }

  if (category === "glasses") {
    const all = landmarks.all;
    if (!all || all.length < 400) return null;

    const lo = ltp(all[33].x, all[33].y);
    const ro = ltp(all[263].x, all[263].y);
    const nb = ltp(all[6].x, all[6].y);

    const cx = (lo.px + ro.px) / 2;
    const cy = nb.py + fwPx * 0.02;
    const eyeSpan = Math.abs(lo.px - ro.px);
    const size = eyeSpan * 1.45;

    return {
      type: "single",
      position: { x: cx, y: cy, size },
      rotation: landmarks.rotationAngle * 0.5,
    };
  }

  return null;
}

export function getHandPlacement(
  category: "rings" | "bracelets",
  hand: HandLandmarks,
  cw: number, ch: number, vw: number, vh: number,
  mirrored: boolean
): Placement | null {
  const ltp = (nx: number, ny: number) => landmarkToPixel(nx, ny, cw, ch, vw, vh, mirrored);

  const ib = ltp(hand.indexFingerBase.x, hand.indexFingerBase.y);
  const pb = ltp(hand.pinkyBase.x, hand.pinkyBase.y);
  const hwPx = Math.sqrt(Math.pow(ib.px - pb.px, 2) + Math.pow(ib.py - pb.py, 2));

  if (category === "rings") {
    const base = hand.ringFingerBase;
    const mid = hand.ringFingerMid;
    const midPt = ltp((base.x + mid.x) / 2, (base.y + mid.y) / 2);
    const size = hwPx * 0.45;
    const dx = mid.x - base.x;
    const dy = mid.y - base.y;
    const angle = Math.atan2(dy, mirrored ? -dx : dx) * (180 / Math.PI);
    return { type: "single", position: { x: midPt.px, y: midPt.py, size }, rotation: angle };
  }

  if (category === "bracelets") {
    const wrist = ltp(hand.wrist.x, hand.wrist.y);
    const size = hwPx * 1.4;
    const dx = hand.middleFingerBase.x - hand.wrist.x;
    const dy = hand.middleFingerBase.y - hand.wrist.y;
    const angle = Math.atan2(dy, mirrored ? -dx : dx) * (180 / Math.PI) - 90;
    return { type: "single", position: { x: wrist.px, y: wrist.py, size }, rotation: angle };
  }

  return null;
}

export function estimateHeadPose(
  faceLandmarks: FaceLandmarks,
  mirrored: boolean
): HeadPose | null {
  const all = faceLandmarks.all;
  if (!all || all.length < 400) return null;

  const noseTip = all[1];
  const leftEar = all[234];
  const rightEar = all[454];
  const faceCenterX = (leftEar.x + rightEar.x) / 2;
  const faceWidth = Math.abs(leftEar.x - rightEar.x);
  const yaw = faceWidth > 0 ? ((noseTip.x - faceCenterX) / faceWidth) * 1.8 : 0;

  const forehead = all[10];
  const chin = all[152];
  const faceHeight = Math.abs(forehead.y - chin.y);
  const noseToForehead = noseTip.y - forehead.y;
  const noseToChin = chin.y - noseTip.y;
  const pitch = faceHeight > 0 ? ((noseToChin - noseToForehead) / faceHeight) * 0.8 : 0;

  const roll = Math.atan2(rightEar.y - leftEar.y, rightEar.x - leftEar.x);

  return { yaw: mirrored ? -yaw : yaw, pitch, roll: mirrored ? -roll : roll };
}
