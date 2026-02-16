import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import {
  DiamondStudEarring,
  DropEarring,
  PendantNecklace,
  PearlChoker,
  SolitaireRing,
  TennisBracelet,
} from "./JewelleryModels";

interface ARJewellery3DProps {
  modelId: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
}

const modelMap: Record<string, React.FC> = {
  e1: DiamondStudEarring,
  e2: DropEarring,
  n1: PendantNecklace,
  n2: PearlChoker,
  r1: SolitaireRing,
  b1: TennisBracelet,
};

const ARJewellery3D = ({ modelId, x, y, size, rotation }: ARJewellery3DProps) => {
  const ModelComponent = modelMap[modelId];

  if (!ModelComponent) return null;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        transition: "left 0.04s linear, top 0.04s linear, width 0.08s ease, height 0.08s ease",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 3], fov: 35 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
        frameloop="always"
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1.5} />
          <pointLight position={[0, -2, 3]} intensity={0.5} color="#ffd700" />
          <Environment preset="studio" />
          <ModelComponent />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default ARJewellery3D;
