import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import {
  DiamondStudEarring,
  DropEarring,
  PendantNecklace,
  PearlChoker,
  SolitaireRing,
  TennisBracelet,
} from "./JewelleryModels";

interface JewelleryPreview3DProps {
  modelId: string;
  className?: string;
}

const modelMap: Record<string, React.FC> = {
  e1: DiamondStudEarring,
  e2: DropEarring,
  n1: PendantNecklace,
  n2: PearlChoker,
  r1: SolitaireRing,
  b1: TennisBracelet,
};

const JewelleryPreview3D = ({ modelId, className = "" }: JewelleryPreview3DProps) => {
  const ModelComponent = modelMap[modelId];

  if (!ModelComponent) {
    return <div className={`bg-secondary ${className}`} />;
  }

  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 35 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} />
          <directionalLight position={[-3, 3, -3]} intensity={0.6} color="#ffeedd" />
          <pointLight position={[0, -2, 3]} intensity={0.5} color="#ffd700" />
          <Environment preset="studio" />
          <ModelComponent />
          <ContactShadows
            position={[0, -1.2, 0]}
            opacity={0.4}
            scale={3}
            blur={2}
            far={3}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default JewelleryPreview3D;
