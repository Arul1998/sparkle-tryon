import { useMemo } from "react";
import type { FaceLandmarks } from "@/hooks/useFaceLandmarks";
import type { HandLandmarks } from "@/hooks/useHandLandmarks";
import type { JewelleryItem, JewelleryCategory } from "@/data/jewellery";

interface Placement {
  type: "single" | "dual";
  left?: { x: number; y: number; size: number };
  right?: { x: number; y: number; size: number };
  position?: { x: number; y: number; size: number };
  rotation: number;
}

interface ARJewelleryOverlayProps {
  item: JewelleryItem;
  faceLandmarks: FaceLandmarks | null;
  handLandmarks: HandLandmarks[];
  containerWidth: number;
  containerHeight: number;
  mirrored?: boolean;
}

function getFacePlacement(
  category: "earrings" | "necklaces",
  landmarks: FaceLandmarks,
  cw: number,
  ch: number,
  mirrored: boolean
): Placement | null {
  const mx = (x: number) => (mirrored ? 1 - x : x);
  const fw = landmarks.faceWidth * cw;

  if (category === "earrings") {
    const lx = mx(landmarks.leftEar.x) * cw;
    const ly = landmarks.leftEar.y * ch;
    const rx = mx(landmarks.rightEar.x) * cw;
    const ry = landmarks.rightEar.y * ch;
    const size = fw * 0.32;
    return {
      type: "dual",
      left: { x: lx, y: ly + size * 0.2, size },
      right: { x: rx, y: ry + size * 0.2, size },
      rotation: landmarks.rotationAngle,
    };
  }

  if (category === "necklaces") {
    const x = mx(landmarks.neckCenter.x) * cw;
    const y = landmarks.neckCenter.y * ch;
    const size = fw * 1.3;
    return {
      type: "single",
      position: { x, y: y + size * 0.05, size },
      rotation: landmarks.rotationAngle * 0.4,
    };
  }

  return null;
}

function getHandPlacement(
  category: "rings" | "bracelets",
  hand: HandLandmarks,
  cw: number,
  ch: number,
  mirrored: boolean
): Placement | null {
  const mx = (x: number) => (mirrored ? 1 - x : x);
  const hw = hand.handWidth * cw;

  if (category === "rings") {
    // Position between ring finger base and mid joint
    const base = hand.ringFingerBase;
    const mid = hand.ringFingerMid;
    const x = mx((base.x + mid.x) / 2) * cw;
    const y = ((base.y + mid.y) / 2) * ch;
    const size = hw * 0.45;

    // Calculate finger angle
    const dx = mid.x - base.x;
    const dy = mid.y - base.y;
    const angle = Math.atan2(dy, mirrored ? -dx : dx) * (180 / Math.PI);

    return {
      type: "single",
      position: { x, y, size },
      rotation: angle,
    };
  }

  if (category === "bracelets") {
    const x = mx(hand.wrist.x) * cw;
    const y = hand.wrist.y * ch;
    const size = hw * 1.4;

    // Wrist angle from wrist to middle finger base
    const dx = hand.middleFingerBase.x - hand.wrist.x;
    const dy = hand.middleFingerBase.y - hand.wrist.y;
    const angle = Math.atan2(dy, mirrored ? -dx : dx) * (180 / Math.PI) - 90;

    return {
      type: "single",
      position: { x, y, size },
      rotation: angle,
    };
  }

  return null;
}

const ARJewelleryOverlay = ({
  item,
  faceLandmarks,
  handLandmarks,
  containerWidth,
  containerHeight,
  mirrored = true,
}: ARJewelleryOverlayProps) => {
  const placement = useMemo(() => {
    if (item.category === "earrings" || item.category === "necklaces") {
      if (!faceLandmarks) return null;
      return getFacePlacement(item.category, faceLandmarks, containerWidth, containerHeight, mirrored);
    }

    if (item.category === "rings" || item.category === "bracelets") {
      if (handLandmarks.length === 0) return null;
      // Use first detected hand
      return getHandPlacement(item.category, handLandmarks[0], containerWidth, containerHeight, mirrored);
    }

    return null;
  }, [item.category, faceLandmarks, handLandmarks, containerWidth, containerHeight, mirrored]);

  if (!placement) return null;

  const renderPiece = (x: number, y: number, size: number, rotation: number, key: string) => (
    <img
      key={key}
      src={item.image}
      alt={item.name}
      className="absolute pointer-events-none"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        objectFit: "contain",
        filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5)) drop-shadow(0 0 2px rgba(255,215,0,0.3)) brightness(1.1) contrast(1.15) saturate(1.3)",
        transition: "left 0.04s linear, top 0.04s linear, width 0.08s ease, height 0.08s ease",
      }}
      draggable={false}
    />
  );

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
