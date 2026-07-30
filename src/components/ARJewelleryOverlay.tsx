import { useMemo } from "react";
import type { FaceLandmarks } from "@/hooks/useFaceLandmarks";
import type { JewelleryItem, JewelleryCategory } from "@/data/jewellery";

interface ARJewelleryOverlayProps {
  item: JewelleryItem;
  landmarks: FaceLandmarks;
  containerWidth: number;
  containerHeight: number;
  mirrored?: boolean;
}

/**
 * Compute position & scale for each jewellery category based on face landmarks.
 * All landmark coordinates are normalized (0–1), so we multiply by container dimensions.
 */
function getPlacement(
  category: JewelleryCategory,
  landmarks: FaceLandmarks,
  containerWidth: number,
  containerHeight: number,
  mirrored: boolean
) {
  const mirrorX = (x: number) => (mirrored ? 1 - x : x);

  // Base size relative to face width
  const facePixelWidth = landmarks.faceWidth * containerWidth;

  switch (category) {
    case "earrings": {
      // Position at both ears
      const leftX = mirrorX(landmarks.leftEar.x) * containerWidth;
      const leftY = landmarks.leftEar.y * containerHeight;
      const rightX = mirrorX(landmarks.rightEar.x) * containerWidth;
      const rightY = landmarks.rightEar.y * containerHeight;
      const size = facePixelWidth * 0.3;

      return {
        type: "dual" as const,
        left: { x: leftX, y: leftY + size * 0.15, size },
        right: { x: rightX, y: rightY + size * 0.15, size },
        rotation: landmarks.rotationAngle,
      };
    }
    case "necklaces": {
      const x = mirrorX(landmarks.neckCenter.x) * containerWidth;
      const y = landmarks.neckCenter.y * containerHeight;
      const size = facePixelWidth * 1.2;

      return {
        type: "single" as const,
        position: { x, y: y + size * 0.1, size },
        rotation: landmarks.rotationAngle * 0.5,
      };
    }
    case "rings": {
      // Show ring near chin area as a preview (no hand tracking)
      const x = mirrorX(landmarks.chin.x) * containerWidth;
      const y = landmarks.chin.y * containerHeight + facePixelWidth * 0.8;
      const size = facePixelWidth * 0.25;

      return {
        type: "single" as const,
        position: { x, y, size },
        rotation: 0,
      };
    }
    case "bracelets": {
      // Show bracelet below face area
      const x = mirrorX(landmarks.chin.x) * containerWidth;
      const y = landmarks.chin.y * containerHeight + facePixelWidth * 1;
      const size = facePixelWidth * 0.4;

      return {
        type: "single" as const,
        position: { x, y, size },
        rotation: 0,
      };
    }
  }
}

const ARJewelleryOverlay = ({
  item,
  landmarks,
  containerWidth,
  containerHeight,
  mirrored = true,
}: ARJewelleryOverlayProps) => {
  const placement = useMemo(
    () => getPlacement(item.category, landmarks, containerWidth, containerHeight, mirrored),
    [item.category, landmarks, containerWidth, containerHeight, mirrored]
  );

  if (!placement) return null;

  const renderPiece = (
    x: number,
    y: number,
    size: number,
    rotation: number,
    key: string
  ) => (
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
        filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.4))",
        transition: "left 0.05s linear, top 0.05s linear, width 0.1s ease, height 0.1s ease",
      }}
      draggable={false}
    />
  );

  if (placement.type === "dual") {
    return (
      <>
        {renderPiece(
          placement.left.x,
          placement.left.y,
          placement.left.size,
          -placement.rotation,
          "left"
        )}
        {renderPiece(
          placement.right.x,
          placement.right.y,
          placement.right.size,
          -placement.rotation,
          "right"
        )}
      </>
    );
  }

  return renderPiece(
    placement.position.x,
    placement.position.y,
    placement.position.size,
    placement.rotation,
    "single"
  );
};

export default ARJewelleryOverlay;
