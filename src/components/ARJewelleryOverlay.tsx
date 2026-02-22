import { useMemo } from "react";
import type { FaceLandmarks } from "@/hooks/useFaceLandmarks";
import type { HandLandmarks } from "@/hooks/useHandLandmarks";
import type { JewelleryItem, JewelleryCategory } from "@/data/jewellery";
import ARJewellery3D from "@/components/3d/ARJewellery3D";

interface Placement {
  type: "single" | "dual";
  left?: { x: number; y: number; size: number };
  right?: { x: number; y: number; size: number };
  position?: { x: number; y: number; size: number };
  rotation: number;
}

export interface HeadPose {
  yaw: number;   // left-right rotation in radians
  pitch: number; // up-down rotation in radians
  roll: number;  // tilt rotation in radians
}

interface ARJewelleryOverlayProps {
  item: JewelleryItem;
  faceLandmarks: FaceLandmarks | null;
  handLandmarks: HandLandmarks[];
  containerWidth: number;
  containerHeight: number;
  videoWidth: number;
  videoHeight: number;
  mirrored?: boolean;
}

/**
 * Convert normalized landmark coords (0-1 relative to video frame)
 * to pixel coords in the container, accounting for CSS object-cover.
 */
function landmarkToPixel(
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
    // Video is wider — cropped on sides
    scale = ch / vh;
    offsetX = (vw * scale - cw) / 2;
  } else {
    // Video is taller — cropped on top/bottom
    scale = cw / vw;
    offsetY = (vh * scale - ch) / 2;
  }

  const x = mirrored ? 1 - nx : nx;
  const px = x * vw * scale - offsetX;
  const py = ny * vh * scale - offsetY;

  return { px, py };
}

function getFacePlacement(
  category: "earrings" | "necklaces",
  landmarks: FaceLandmarks,
  cw: number, ch: number, vw: number, vh: number,
  mirrored: boolean
): Placement | null {
  const ltp = (nx: number, ny: number) => landmarkToPixel(nx, ny, cw, ch, vw, vh, mirrored);
  const fw = landmarks.faceWidth; // normalized

  // Compute face width in pixels using object-cover mapping
  const lEar = ltp(landmarks.leftEar.x, landmarks.leftEar.y);
  const rEar = ltp(landmarks.rightEar.x, landmarks.rightEar.y);
  const fwPx = Math.abs(lEar.px - rEar.px);

  if (category === "earrings") {
    const left = ltp(landmarks.leftEarlobe.x, landmarks.leftEarlobe.y);
    const right = ltp(landmarks.rightEarlobe.x, landmarks.rightEarlobe.y);
    const size = fwPx * 0.4;
    return {
      type: "dual",
      left: { x: left.px, y: left.py + size * 0.55, size },
      right: { x: right.px, y: right.py + size * 0.55, size },
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

  return null;
}

function getHandPlacement(
  category: "rings" | "bracelets",
  hand: HandLandmarks,
  cw: number, ch: number, vw: number, vh: number,
  mirrored: boolean
): Placement | null {
  const ltp = (nx: number, ny: number) => landmarkToPixel(nx, ny, cw, ch, vw, vh, mirrored);

  // Hand width in pixels
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

const ARJewelleryOverlay = ({
  item,
  faceLandmarks,
  handLandmarks,
  containerWidth,
  containerHeight,
  videoWidth,
  videoHeight,
  mirrored = true,
}: ARJewelleryOverlayProps) => {
  // Estimate head pose from face landmarks
  const headPose = useMemo((): HeadPose | null => {
    if (!faceLandmarks) return null;
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
  }, [faceLandmarks, mirrored]);

  const placement = useMemo(() => {
    const vw = videoWidth;
    const vh = videoHeight;
    if (item.category === "earrings" || item.category === "necklaces") {
      if (!faceLandmarks) return null;
      return getFacePlacement(item.category, faceLandmarks, containerWidth, containerHeight, vw, vh, mirrored);
    }
    if (item.category === "rings" || item.category === "bracelets") {
      if (handLandmarks.length === 0) return null;
      return getHandPlacement(item.category, handLandmarks[0], containerWidth, containerHeight, vw, vh, mirrored);
    }
    return null;
  }, [item.category, faceLandmarks, handLandmarks, containerWidth, containerHeight, videoWidth, videoHeight, mirrored]);

  if (!placement) return null;

  const isCustom = item.id.startsWith("custom-");

  const renderPiece = (x: number, y: number, size: number, rotation: number, key: string) => {
    // Custom uploads use 2D image overlay
    if (isCustom) {
      return (
        <img
          key={key}
          src={item.image}
          alt={item.name}
          className="absolute pointer-events-none"
          style={{
            left: x,
            top: y,
            width: size,
            height: size * 1.3,
            transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
            objectFit: "contain",
            filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.35)) brightness(1.08) contrast(1.1) saturate(1.15)",
            transition: "left 0.04s linear, top 0.04s linear, width 0.06s ease, height 0.06s ease",
          }}
          draggable={false}
        />
      );
    }

    // All built-in items (earrings, necklaces, rings, bracelets) use 3D rendering
    return (
      <ARJewellery3D
        key={key}
        modelId={item.id}
        x={x}
        y={y}
        size={size}
        rotation={rotation}
        headPose={headPose}
        category={item.category}
      />
    );
  };

  if (placement.type === "dual" && placement.left && placement.right) {
    return (
      <>
        {renderPiece(placement.left.x, placement.left.y, placement.left.size, -placement.rotation, "left")}
        {renderPiece(placement.right.x, placement.right.y, placement.right.size, -placement.rotation, "right")}
      </>
    );
  }

  if (placement.position) {
    return renderPiece(
      placement.position.x,
      placement.position.y,
      placement.position.size,
      placement.rotation,
      "single"
    );
  }

  return null;
};

export default ARJewelleryOverlay;
