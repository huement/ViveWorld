import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface StarfieldProps {
  count?: number;
}

/**
 * A simple, deterministic pseudo-random number generator (PRNG).
 * Given the same seed, it will always yield the exact same sequence of numbers,
 * making it completely pure and idempotent for React.
 */
function createPRNG(seed: number) {
  let s = seed;
  return function () {
    const x = Math.sin(s++) * 10000;
    return x - Math.floor(x);
  };
}

export function Starfield({ count = 1000 }: StarfieldProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Generate stable, deterministic star data based on a fixed seed
  const stars = useMemo(() => {
    const rand = createPRNG(42); // 42 is our arbitrary fixed seed
    const temp = [];

    for (let i = 0; i < count; i++) {
      temp.push({
        x: (rand() - 0.5) * 50,
        y: (rand() - 0.5) * 50,
        z: (rand() - 0.5) * 100,
        speed: 0.05 + rand() * 0.1,
        // Pre-calculate stable respawn positions to avoid runtime randomness
        resetX: (rand() - 0.5) * 50,
        resetY: (rand() - 0.5) * 50,
      });
    }
    return temp;
  }, [count]);

  useFrame(() => {
    if (!meshRef.current) return;

    stars.forEach((star, i) => {
      // Move the star closer to the camera
      star.z += star.speed;

      // If the star flies past the camera, reset it using its pre-calculated pure values
      if (star.z > 15) {
        star.z = -85;
        star.x = star.resetX;
        star.y = star.resetY;
      }

      dummy.position.set(star.x, star.y, star.z);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null as any, null as any, count]}>
      <sphereGeometry args={[0.05, 4, 4]} />
      <meshBasicMaterial color="#ffffff" />
    </instancedMesh>
  );
}
