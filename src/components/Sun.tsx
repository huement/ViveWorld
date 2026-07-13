import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

import localSunTexture from "../assets/sun.png";
import { useSceneControls } from "../SceneContext";

export function Sun() {
  const sunRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const sunTexture = useTexture(localSunTexture);

  const { controls, analyser } = useSceneControls();
  const { x, y, z } = controls.sunPosition;

  const dataArray = useMemo(() => {
    if (!analyser) return new Uint8Array(0);
    return new Uint8Array(analyser.frequencyBinCount);
  }, [analyser]);

  useFrame((state, delta) => {
    // 1. Maintain standard slow rotations
    if (sunRef.current) sunRef.current.rotation.y += delta * 0.02;
    if (ringRef.current) ringRef.current.rotation.z -= delta * 0.01;

    // 2. Extract live audio tracking data
    if (analyser && dataArray.length > 0 && sunRef.current && ringRef.current) {
      analyser.getByteFrequencyData(dataArray);

      // Bass is situated at the absolute front of the array (bins 0 to 5)
      let bassSum = 0;
      const bassBins = 6;
      for (let i = 0; i < bassBins; i++) {
        bassSum += dataArray[i];
      }
      const averageBass = bassSum / bassBins; // Standardized scale between 0 and 255

      // Translate 0-255 byte domain into a manageable vector multiplier (e.g., 1.0 to 1.6)
      const pulseFactor = 1.0 + (averageBass / 255) * 0.6;

      // Apply the scales dynamically straight to the mesh transforms
      sunRef.current.scale.setScalar(pulseFactor);

      // Make the thin halo expand slightly further out on the bass drop
      ringRef.current.scale.setScalar(pulseFactor * 1.1);
    } else {
      // Return smoothly to normal resting size if track is paused/empty
      if (sunRef.current) sunRef.current.scale.setScalar(1.0);
      if (ringRef.current) ringRef.current.scale.setScalar(1.0);
    }
  });

  return (
    <group position={[x, y, z]}>
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
