import { Suspense, useRef } from "react";
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
  WayfarerGlasses,
  AviatorGlasses,
  RoundSpectacles,
} from "./JewelleryModels";
import type { HeadPose } from "@/lib/landmarkMath";
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
  g1: WayfarerGlasses,
  g2: AviatorGlasses,
  g3: RoundSpectacles,
};

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
  const targetRotation = useRef(new THREE.Euler());
  const currentRotation = useRef(new THREE.Euler());

  useFrame(() => {
    if (!groupRef.current) return;
    if (headPose) {
      const isNecklace = category === "necklaces";
      targetRotation.current.set(
        headPose.pitch * (isNecklace ? 0.6 : 0.4),
        -headPose.yaw * (isNecklace ? 1.2 : 0.8),
        headPose.roll * (isNecklace ? 0.5 : 0.3),
      );
    }
    currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * 0.15;
    currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * 0.15;
    currentRotation.current.z += (targetRotation.current.z - currentRotation.current.z) * 0.15;
    groupRef.current.rotation.copy(currentRotation.current);
  });

  return <group ref={groupRef}>{children}</group>;
};

const ARJewellery3D = ({ modelId, x, y, size, rotation, headPose, category }: ARJewellery3DProps) => {
  const ModelComponent = modelMap[modelId];
  if (!ModelComponent) return null;

  const canvasSize = size * 1.3;
  return (
    <div
      className="absolute pointer-events-none"
      data-ar-layer
      data-ar-rotation={rotation}
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
        camera={{
          position: [0, 0, 3],
          fov: category === "necklaces" || category === "earrings" || category === "glasses" ? 40 : 35,
        }}
        gl={{
          alpha: true,
          antialias: true,
          premultipliedAlpha: false,
          powerPreference: "low-power",
          preserveDrawingBuffer: true,
        }}
        style={{ background: "transparent" }}
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
