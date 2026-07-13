import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

import localSunTexture from "../assets/sun.png";
import { useSceneControls } from "../SceneContext";

export function Sun() {
  const sunRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const sunTexture = useTexture(localSunTexture);

  const { controls } = useSceneControls();

  useFrame((state, delta) => {
    // 1. Grand, majestic slow rotation for the sun sphere
    if (sunRef.current) {
      // delta * 0.02 is incredibly slow and smooth, perfect for a massive star
      sunRef.current.rotation.y += delta * 0.12;
    }

    // 2. Separate, ultra-slow counter-rotation for the white halo ring
    // This keeps the scene dynamic without making it look chaotic
    if (ringRef.current) {
      ringRef.current.rotation.z -= delta * 0.41;
    }
  });

  return (
    <group
      position={[
        controls.sunPosition.x,
        controls.sunPosition.y,
        controls.sunPosition.z,
      ]}
    >
      {/* THE FIERY SUN */}
      <mesh ref={sunRef} position={[0, 0, 0]}>
        <sphereGeometry args={[controls.sunSize, 16, 12]} />
        <meshStandardMaterial
          map={sunTexture}
          emissiveMap={sunTexture}
          emissive={new THREE.Color("#ffaa44")}
          emissiveIntensity={2.5}
          flatShading={true}
        />
      </mesh>

      {/* THE TINY THIN WHITE HALO RING */}
      <mesh ref={ringRef} rotation={[Math.PI / 6, Math.PI / 1.8, 0]}>
        <torusGeometry args={[controls.sunSize + 2, 0.04, 6, 40]} />{" "}
        {/* Adjust ring size based on sun size */}
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}
