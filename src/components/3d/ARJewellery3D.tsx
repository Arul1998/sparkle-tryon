import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import {
  DiamondStudEarring,
  DropEarring,
  PendantNecklace,
  PearlChoker,
  SolitaireRing,
  TennisBracelet,
} from "./JewelleryModels";
import type { HeadPose } from "@/components/ARJewelleryOverlay";
import type { JewelleryCategory } from "@/data/jewellery";

interface ARJewellery3DProps {
  modelId: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
  headPose?: HeadPose | null;
  category?: JewelleryCategory;
}

const modelMap: Record<string, React.FC<{ headPose?: HeadPose | null }>> = {
  e1: DiamondStudEarring,
  e2: DropEarring,
  n1: PendantNecklace,
  n2: PearlChoker,
  r1: SolitaireRing,
  b1: TennisBracelet,
};

// Smoothly interpolates head pose to avoid jitter
const PoseTracker = ({
  headPose,
  category,
  children,
}: {
  headPose?: HeadPose | null;
  category?: JewelleryCategory;
  children: React.ReactNode;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const targetRotation = useRef(new THREE.Euler(0, 0, 0));
  const currentRotation = useRef(new THREE.Euler(0, 0, 0));

  useFrame(() => {
    if (!groupRef.current) return;

    if (headPose) {
      const isNecklace = category === "necklaces";
      const yawScale = isNecklace ? 1.2 : 0.8;
      const pitchScale = isNecklace ? 0.6 : 0.4;
      const rollScale = isNecklace ? 0.5 : 0.3;

      targetRotation.current.set(
        headPose.pitch * pitchScale,
        -headPose.yaw * yawScale,
        headPose.roll * rollScale
      );
    }

    const lerpFactor = 0.15;
    currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * lerpFactor;
    currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * lerpFactor;
    currentRotation.current.z += (targetRotation.current.z - currentRotation.current.z) * lerpFactor;

    groupRef.current.rotation.copy(currentRotation.current);
  });

  return <group ref={groupRef}>{children}</group>;
};

const ARJewellery3D = ({ modelId, x, y, size, rotation, headPose, category }: ARJewellery3DProps) => {
  const ModelComponent = modelMap[modelId];

  if (!ModelComponent) return null;

  const isNecklace = category === "necklaces";
  const canvasSize = isNecklace ? size * 1.3 : size;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: x,
        top: y,
        width: canvasSize,
        height: canvasSize,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        transition: "left 0.05s linear, top 0.05s linear, width 0.08s ease, height 0.08s ease",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 3], fov: isNecklace ? 40 : 35 }}
        gl={{
          alpha: true,
          antialias: true,
          premultipliedAlpha: false,
          powerPreference: "low-power",
          preserveDrawingBuffer: false,
        }}
        style={{ background: "transparent" }}
        frameloop="always"
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[3, 5, 5]} intensity={1.8} />
          <directionalLight position={[-4, 3, -2]} intensity={0.6} color="#ffeedd" />
          <pointLight position={[0, -2, 4]} intensity={0.5} color="#ffd700" />

          <Environment preset="studio" environmentIntensity={0.5} />

          <PoseTracker headPose={headPose} category={category}>
            <ModelComponent headPose={headPose} />
          </PoseTracker>
        </Suspense>
      </Canvas>
    </div>
  );
};

export default ARJewellery3D;
