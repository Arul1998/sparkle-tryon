import { useMemo } from "react";
import type { FaceLandmarks } from "@/hooks/useFaceLandmarks";
import type { HandLandmarks } from "@/hooks/useHandLandmarks";
import type { JewelleryItem } from "@/data/jewellery";
import { getFacePlacement, getHandPlacement, estimateHeadPose } from "@/lib/landmarkMath";
import type { HeadPose } from "@/lib/landmarkMath";
import ARJewellery3D from "@/components/3d/ARJewellery3D";

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
  const headPose = useMemo(
    (): HeadPose | null => faceLandmarks ? estimateHeadPose(faceLandmarks, mirrored) : null,
    [faceLandmarks, mirrored],
  );

  const placement = useMemo(() => {
    if (["earrings", "necklaces", "glasses"].includes(item.category)) {
      return faceLandmarks
        ? getFacePlacement(item.category, faceLandmarks, containerWidth, containerHeight, videoWidth, videoHeight, mirrored)
        : null;
    }
    if (["rings", "bracelets"].includes(item.category)) {
      return handLandmarks.length
        ? getHandPlacement(item.category, handLandmarks[0], containerWidth, containerHeight, videoWidth, videoHeight, mirrored)
        : null;
    }
    return null;
  }, [item.category, faceLandmarks, handLandmarks, containerWidth, containerHeight, videoWidth, videoHeight, mirrored]);

  if (!placement) return null;
  const isCustom = item.id.startsWith("custom-");

  const renderPiece = (x: number, y: number, size: number, rotation: number, key: string) => {
    if (isCustom) {
      return (
        <img
          key={key}
          src={item.image}
          alt={item.name}
          data-ar-layer
          data-ar-rotation={rotation}
          className="absolute pointer-events-none"
          style={{
            left: x,
            top: y,
            width: size,
            height: size * 1.3,
            transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
            objectFit: "contain",
            filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.35)) brightness(1.08) contrast(1.1) saturate(1.15)",
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

  if (placement.type === "dual") {
    return (
      <>
        {placement.left && renderPiece(placement.left.x, placement.left.y, placement.left.size, -placement.rotation, "left")}
        {placement.right && renderPiece(placement.right.x, placement.right.y, placement.right.size, -placement.rotation, "right")}
      </>
    );
  }

  return placement.position
    ? renderPiece(placement.position.x, placement.position.y, placement.position.size, placement.rotation, "single")
    : null;
};

export default ARJewelleryOverlay;
