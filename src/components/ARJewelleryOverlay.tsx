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
    const base = hand.ringFingerBase;
    const mid = hand.ringFingerMid;
    const x = mx((base.x + mid.x) / 2) * cw;
    const y = ((base.y + mid.y) / 2) * ch;
    const size = hw * 0.45;
    const dx = mid.x - base.x;
    const dy = mid.y - base.y;
    const angle = Math.atan2(dy, mirrored ? -dx : dx) * (180 / Math.PI);
    return { type: "single", position: { x, y, size }, rotation: angle };
  }

  if (category === "bracelets") {
    const x = mx(hand.wrist.x) * cw;
    const y = hand.wrist.y * ch;
    const size = hw * 1.4;
    const dx = hand.middleFingerBase.x - hand.wrist.x;
    const dy = hand.middleFingerBase.y - hand.wrist.y;
    const angle = Math.atan2(dy, mirrored ? -dx : dx) * (180 / Math.PI) - 90;
    return { type: "single", position: { x, y, size }, rotation: angle };
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
  // Estimate head pose from face landmarks
  const headPose = useMemo((): HeadPose | null => {
    if (!faceLandmarks) return null;
    const all = faceLandmarks.all;
    if (!all || all.length < 400) return null;

    // Yaw: nose tip vs face center (ears midpoint)
    const noseTip = all[1];
    const leftEar = all[234];
    const rightEar = all[454];
    const faceCenterX = (leftEar.x + rightEar.x) / 2;
    const faceWidth = Math.abs(leftEar.x - rightEar.x);
    const yaw = faceWidth > 0 ? ((noseTip.x - faceCenterX) / faceWidth) * 1.8 : 0;

    // Pitch: forehead vs chin vertical relationship with depth
    const forehead = all[10];
    const chin = all[152];
    const faceHeight = Math.abs(forehead.y - chin.y);
    const noseToForehead = noseTip.y - forehead.y;
    const noseToChin = chin.y - noseTip.y;
    const pitch = faceHeight > 0 ? ((noseToChin - noseToForehead) / faceHeight) * 0.8 : 0;

    // Roll: ear-to-ear tilt
    const roll = Math.atan2(rightEar.y - leftEar.y, rightEar.x - leftEar.x);

    return { yaw: mirrored ? -yaw : yaw, pitch, roll: mirrored ? -roll : roll };
  }, [faceLandmarks, mirrored]);

  const placement = useMemo(() => {
    if (item.category === "earrings" || item.category === "necklaces") {
      if (!faceLandmarks) return null;
      return getFacePlacement(item.category, faceLandmarks, containerWidth, containerHeight, mirrored);
    }
    if (item.category === "rings" || item.category === "bracelets") {
      if (handLandmarks.length === 0) return null;
      return getHandPlacement(item.category, handLandmarks[0], containerWidth, containerHeight, mirrored);
    }
    return null;
  }, [item.category, faceLandmarks, handLandmarks, containerWidth, containerHeight, mirrored]);

  if (!placement) return null;

  const isCustom = item.id.startsWith("custom-");

  const renderPiece = (x: number, y: number, size: number, rotation: number, key: string) => {
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
            height: size,
            transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
            objectFit: "contain",
            filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.4)) brightness(1.05) contrast(1.1) saturate(1.2)",
            transition: "left 0.05s linear, top 0.05s linear, width 0.08s ease, height 0.08s ease",
          }}
          draggable={false}
        />
      );
    }

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
