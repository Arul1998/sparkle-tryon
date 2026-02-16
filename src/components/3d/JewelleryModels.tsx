import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial, MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";

// ─── Diamond Stud Earring ───
export const DiamondStudEarring = ({ color = "#FFD700" }: { color?: string }) => {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.5;
  });

  return (
    <group ref={ref} scale={1.2}>
      {/* Gold post */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
        <meshStandardMaterial color={color} metalness={0.95} roughness={0.1} />
      </mesh>
      {/* Gold prong setting */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.2, 0.08, 0.2, 6]} />
        <meshStandardMaterial color={color} metalness={0.95} roughness={0.1} />
      </mesh>
      {/* Diamond */}
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
export const DropEarring = ({ color = "#FFD700" }: { color?: string }) => {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.5;
  });

  return (
    <group ref={ref} scale={1}>
      {/* Hook */}
      <mesh position={[0, 0.8, 0]}>
        <torusGeometry args={[0.12, 0.025, 8, 16, Math.PI]} />
        <meshStandardMaterial color={color} metalness={0.95} roughness={0.1} />
      </mesh>
      {/* Chain links */}
      {[0.5, 0.25, 0].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <torusGeometry args={[0.06, 0.02, 8, 16]} />
          <meshStandardMaterial color={color} metalness={0.95} roughness={0.1} />
        </mesh>
      ))}
      {/* Teardrop diamond */}
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

// ─── Pendant Necklace ───
export const PendantNecklace = ({ color = "#FFD700" }: { color?: string }) => {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.4;
  });

  return (
    <group ref={ref} scale={0.9}>
      {/* Chain arc */}
      <mesh>
        <torusGeometry args={[0.7, 0.025, 8, 32, Math.PI]} />
        <meshStandardMaterial color={color} metalness={0.95} roughness={0.1} />
      </mesh>
      {/* Bail */}
      <mesh position={[0, -0.7, 0]}>
        <torusGeometry args={[0.06, 0.02, 8, 12]} />
        <meshStandardMaterial color={color} metalness={0.95} roughness={0.1} />
      </mesh>
      {/* Pendant setting */}
      <mesh position={[0, -0.85, 0]}>
        <cylinderGeometry args={[0.18, 0.1, 0.08, 8]} />
        <meshStandardMaterial color={color} metalness={0.95} roughness={0.1} />
      </mesh>
      {/* Diamond pendant */}
      <mesh position={[0, -1.05, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.18, 0.3, 8]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={0.9}
          roughness={0.0}
          ior={2.42}
          thickness={0.5}
          envMapIntensity={3}
          clearcoat={1}
        />
      </mesh>
      <mesh position={[0, -0.92, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.06, 8]} />
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

// ─── Pearl Choker Necklace ───
export const PearlChoker = ({ color = "#C0C0C0" }: { color?: string }) => {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.4;
  });

  const pearlCount = 15;

  return (
    <group ref={ref} scale={0.9}>
      {/* Chain */}
      <mesh>
        <torusGeometry args={[0.7, 0.015, 8, 32, Math.PI]} />
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.15} />
      </mesh>
      {/* Pearls along the arc */}
      {Array.from({ length: pearlCount }).map((_, i) => {
        const angle = (Math.PI * i) / (pearlCount - 1);
        const x = Math.cos(angle) * 0.7;
        const y = -Math.sin(angle) * 0.7;
        return (
          <mesh key={i} position={[x, y, 0]}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshPhysicalMaterial
              color="#FFF8F0"
              roughness={0.2}
              metalness={0.1}
              clearcoat={0.8}
              clearcoatRoughness={0.1}
              sheen={1}
              sheenColor={new THREE.Color("#ffe4d6")}
            />
          </mesh>
        );
      })}
      {/* Center pearl drop */}
      <mesh position={[0, -0.85, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshPhysicalMaterial
          color="#FFF8F0"
          roughness={0.15}
          metalness={0.1}
          clearcoat={1}
          sheen={1}
          sheenColor={new THREE.Color("#ffe4d6")}
        />
      </mesh>
    </group>
  );
};

// ─── Diamond Solitaire Ring ───
export const SolitaireRing = ({ color = "#FFD700" }: { color?: string }) => {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.6;
  });

  return (
    <group ref={ref} rotation={[Math.PI * 0.3, 0, 0]} scale={1.1}>
      {/* Band */}
      <mesh>
        <torusGeometry args={[0.4, 0.06, 16, 32]} />
        <meshStandardMaterial color={color} metalness={0.95} roughness={0.08} />
      </mesh>
      {/* Prong setting */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.12, 0.06, 0.15, 6]} />
        <meshStandardMaterial color={color} metalness={0.95} roughness={0.1} />
      </mesh>
      {/* Diamond */}
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
export const TennisBracelet = ({ color = "#FFD700" }: { color?: string }) => {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.5;
  });

  const stoneCount = 20;

  return (
    <group ref={ref} rotation={[Math.PI * 0.35, 0, 0]} scale={1}>
      {/* Band */}
      <mesh>
        <torusGeometry args={[0.5, 0.04, 8, 32]} />
        <meshStandardMaterial color={color} metalness={0.95} roughness={0.1} />
      </mesh>
      {/* Diamonds around */}
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
