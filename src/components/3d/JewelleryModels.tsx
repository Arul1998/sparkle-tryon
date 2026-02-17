import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { HeadPose } from "@/components/ARJewelleryOverlay";

interface ModelProps {
  color?: string;
  headPose?: HeadPose | null;
}

// ─── Diamond Stud Earring ───
export const DiamondStudEarring = ({ color = "#FFD700" }: ModelProps) => {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.5;
  });

  return (
    <group ref={ref} scale={1.2}>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
        <meshStandardMaterial color={color} metalness={0.95} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.2, 0.08, 0.2, 6]} />
        <meshStandardMaterial color={color} metalness={0.95} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.15, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.25, 0.35, 8]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={0.9}
          roughness={0.0}
          metalness={0.0}
          ior={2.42}
          thickness={0.5}
          envMapIntensity={3}
          clearcoat={1}
        />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.1, 8]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={0.9}
          roughness={0.0}
          ior={2.42}
          thickness={0.3}
          envMapIntensity={3}
          clearcoat={1}
        />
      </mesh>
    </group>
  );
};

// ─── Drop Earring ───
export const DropEarring = ({ color = "#FFD700" }: ModelProps) => {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.5;
  });

  return (
    <group ref={ref} scale={1}>
      <mesh position={[0, 0.8, 0]}>
        <torusGeometry args={[0.12, 0.025, 8, 16, Math.PI]} />
        <meshStandardMaterial color={color} metalness={0.95} roughness={0.1} />
      </mesh>
      {[0.5, 0.25, 0].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <torusGeometry args={[0.06, 0.02, 8, 16]} />
          <meshStandardMaterial color={color} metalness={0.95} roughness={0.1} />
        </mesh>
      ))}
      <mesh position={[0, -0.35, 0]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.15, 0.4, 8]} />
        <meshPhysicalMaterial
          color="#e8e8ff"
          transmission={0.85}
          roughness={0.0}
          ior={2.42}
          thickness={0.4}
          envMapIntensity={3}
          clearcoat={1}
        />
      </mesh>
      <mesh position={[0, -0.2, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshPhysicalMaterial
          color="#e8e8ff"
          transmission={0.85}
          roughness={0.0}
          ior={2.42}
          thickness={0.3}
          envMapIntensity={3}
          clearcoat={1}
        />
      </mesh>
    </group>
  );
};

// ─── Helper: create a curved necklace chain path ───
function createNecklaceCurve(headPose?: HeadPose | null): THREE.CatmullRomCurve3 {
  // Base U-shaped curve simulating neck drape
  const yawOffset = headPose ? headPose.yaw * 0.3 : 0;
  const depthCurve = headPose ? Math.abs(headPose.yaw) * 0.15 : 0;

  const points = [
    new THREE.Vector3(-0.75 + yawOffset, 0.05, -0.1 - depthCurve),
    new THREE.Vector3(-0.55 + yawOffset * 0.8, -0.15, 0.08),
    new THREE.Vector3(-0.3 + yawOffset * 0.5, -0.35, 0.18 + depthCurve * 0.5),
    new THREE.Vector3(0 + yawOffset * 0.3, -0.48, 0.22 + depthCurve),
    new THREE.Vector3(0.3 + yawOffset * 0.1, -0.35, 0.18 + depthCurve * 0.5),
    new THREE.Vector3(0.55 - yawOffset * 0.2, -0.15, 0.08),
    new THREE.Vector3(0.75 - yawOffset * 0.4, 0.05, -0.1 - depthCurve),
  ];

  return new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.5);
}

// ─── Pendant Necklace (3D curved) ───
export const PendantNecklace = ({ color = "#FFD700", headPose }: ModelProps) => {
  const ref = useRef<THREE.Group>(null);

  const { tubeGeometry, pendantPos } = (() => {
    const curve = createNecklaceCurve(headPose);
    const geo = new THREE.TubeGeometry(curve, 64, 0.018, 8, false);
    const midPoint = curve.getPointAt(0.5);
    return { tubeGeometry: geo, pendantPos: midPoint };
  })();

  return (
    <group ref={ref} scale={1.1}>
      {/* Main chain — curved tube following neck contour */}
      <mesh geometry={tubeGeometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={color}
          metalness={0.98}
          roughness={0.05}
          envMapIntensity={2.5}
          clearcoat={0.8}
          clearcoatRoughness={0.05}
        />
      </mesh>

      {/* Bail */}
      <mesh position={[pendantPos.x, pendantPos.y - 0.05, pendantPos.z]} castShadow>
        <torusGeometry args={[0.05, 0.015, 8, 12]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.98}
          roughness={0.05}
          envMapIntensity={2}
        />
      </mesh>

      {/* Pendant setting */}
      <mesh position={[pendantPos.x, pendantPos.y - 0.15, pendantPos.z]} castShadow>
        <cylinderGeometry args={[0.14, 0.08, 0.06, 8]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.98}
          roughness={0.05}
          envMapIntensity={2}
        />
      </mesh>

      {/* Diamond pendant — inverted cone + crown */}
      <mesh
        position={[pendantPos.x, pendantPos.y - 0.3, pendantPos.z]}
        rotation={[Math.PI, 0, 0]}
        castShadow
      >
        <coneGeometry args={[0.14, 0.22, 8]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={0.92}
          roughness={0.0}
          ior={2.42}
          thickness={0.5}
          envMapIntensity={4}
          clearcoat={1}
          specularIntensity={2}
          specularColor={new THREE.Color("#ffffff")}
        />
      </mesh>
      <mesh position={[pendantPos.x, pendantPos.y - 0.2, pendantPos.z]} castShadow>
        <cylinderGeometry args={[0.14, 0.14, 0.05, 8]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={0.92}
          roughness={0.0}
          ior={2.42}
          thickness={0.3}
          envMapIntensity={4}
          clearcoat={1}
        />
      </mesh>
    </group>
  );
};

// ─── Pearl Choker Necklace (3D curved) ───
export const PearlChoker = ({ color = "#C0C0C0", headPose }: ModelProps) => {
  const ref = useRef<THREE.Group>(null);

  const { curve, tubeGeometry } = (() => {
    const c = createNecklaceCurve(headPose);
    const geo = new THREE.TubeGeometry(c, 64, 0.012, 8, false);
    return { curve: c, tubeGeometry: geo };
  })();

  const pearlCount = 17;

  return (
    <group ref={ref} scale={1.1}>
      {/* Silver chain */}
      <mesh geometry={tubeGeometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={color}
          metalness={0.95}
          roughness={0.1}
          envMapIntensity={2}
          clearcoat={0.6}
        />
      </mesh>

      {/* Pearls distributed along the curved path */}
      {Array.from({ length: pearlCount }).map((_, i) => {
        const t = i / (pearlCount - 1);
        const pt = curve.getPointAt(t);
        return (
          <mesh key={i} position={[pt.x, pt.y, pt.z]} castShadow>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshPhysicalMaterial
              color="#FFF8F0"
              roughness={0.15}
              metalness={0.05}
              clearcoat={1}
              clearcoatRoughness={0.08}
              sheen={1.0}
              sheenRoughness={0.2}
              sheenColor={new THREE.Color("#ffe4d6")}
              envMapIntensity={1.5}
            />
          </mesh>
        );
      })}

      {/* Center pearl drop */}
      {(() => {
        const mid = curve.getPointAt(0.5);
        return (
          <mesh position={[mid.x, mid.y - 0.08, mid.z]} castShadow>
            <sphereGeometry args={[0.065, 16, 16]} />
            <meshPhysicalMaterial
              color="#FFF8F0"
              roughness={0.12}
              metalness={0.05}
              clearcoat={1}
              sheen={1.0}
              sheenColor={new THREE.Color("#ffe4d6")}
              envMapIntensity={1.5}
            />
          </mesh>
        );
      })()}
    </group>
  );
};

// ─── Diamond Solitaire Ring ───
export const SolitaireRing = ({ color = "#FFD700" }: ModelProps) => {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.6;
  });

  return (
    <group ref={ref} rotation={[Math.PI * 0.3, 0, 0]} scale={1.1}>
      <mesh>
        <torusGeometry args={[0.4, 0.06, 16, 32]} />
        <meshStandardMaterial color={color} metalness={0.95} roughness={0.08} />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.12, 0.06, 0.15, 6]} />
        <meshStandardMaterial color={color} metalness={0.95} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.55, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.15, 0.2, 8]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={0.9}
          roughness={0.0}
          ior={2.42}
          thickness={0.4}
          envMapIntensity={3}
          clearcoat={1}
        />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.06, 8]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={0.9}
          roughness={0.0}
          ior={2.42}
          thickness={0.3}
          envMapIntensity={3}
          clearcoat={1}
        />
      </mesh>
    </group>
  );
};

// ─── Tennis Bracelet ───
export const TennisBracelet = ({ color = "#FFD700" }: ModelProps) => {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.5;
  });

  const stoneCount = 20;

  return (
    <group ref={ref} rotation={[Math.PI * 0.35, 0, 0]} scale={1}>
      <mesh>
        <torusGeometry args={[0.5, 0.04, 8, 32]} />
        <meshStandardMaterial color={color} metalness={0.95} roughness={0.1} />
      </mesh>
      {Array.from({ length: stoneCount }).map((_, i) => {
        const angle = (Math.PI * 2 * i) / stoneCount;
        const x = Math.cos(angle) * 0.5;
        const z = Math.sin(angle) * 0.5;
        return (
          <mesh key={i} position={[x, 0, z]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshPhysicalMaterial
              color="#ffffff"
              transmission={0.8}
              roughness={0.0}
              ior={2.42}
              thickness={0.2}
              envMapIntensity={3}
              clearcoat={1}
            />
          </mesh>
        );
      })}
    </group>
  );
};
