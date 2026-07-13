import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

import localEarthMask from "../assets/planet.png";
import localMoonMask from "../assets/moon.png";

export function Planet() {
  // const outerRef = useRef<THREE.Mesh>(null);
  const moonRef = useRef<THREE.Mesh>(null);
  const planetRef = useRef<THREE.Mesh>(null);
  const earthTexture = useTexture(localEarthMask);
  const moonTexture = useTexture(localMoonMask);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 1. Rotate the planet shells
    // if (outerRef.current) {
    //   outerRef.current.rotation.y += delta * 0.12;
    //   outerRef.current.rotation.x += delta * 0.05;
    // }
    // Rotate the inner shell backward slightly slower for complex depth
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * 0.1;
    }

    // 2. Orbit the moon using standard trigonometry (cos for X, sin for Z)
    if (moonRef.current) {
      const orbitRadius = 4.5;
      const orbitSpeed = 0.6; // Lower numbers = slower orbit

      moonRef.current.position.x = Math.cos(time * orbitSpeed) * orbitRadius;
      moonRef.current.position.z = Math.sin(time * orbitSpeed) * orbitRadius;

      // Rotate the moon on its own axis too
      moonRef.current.rotation.y += delta * 0.4;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Outer Hologram Wireframe Shell 
      <mesh ref={outerRef}>
        <sphereGeometry args={[3, 30, 30]} />
        <meshBasicMaterial
          color="#65ffcc"
          wireframe
          transparent
          opacity={0.2}
        />
      </mesh>*/}

      {/* SOLID LOW-POLY EARTH */}
      <mesh ref={planetRef}>
        {/* Dropping segments to 24 and 16 makes it beautifully geometric 
          while keeping the shape of the continents recognizable.
        */}
        <sphereGeometry args={[2, 24, 16]} />
        <meshStandardMaterial
          map={earthTexture}
          flatShading={true} // <-- This makes the low-poly faces pop!
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* SOLID LOW-POLY MOON */}
      <mesh ref={moonRef}>
        {/* Even fewer segments here (12, 8) because the moon is smaller */}
        <sphereGeometry args={[0.8, 12, 8]} />
        <meshStandardMaterial
          map={moonTexture}
          flatShading={true} // <-- Keeps the moon low-poly matching the planet
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}
