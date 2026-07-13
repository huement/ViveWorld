import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface AsteroidRingProps {
  count?: number;
}

function createPRNG(seed: number) {
  let s = seed;
  return function () {
    const x = Math.sin(s++) * 10000;
    return x - Math.floor(x);
  };
}

export function AsteroidRing({ count = 400 }: AsteroidRingProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Generate stable, pure asteroid orbital data
  const asteroids = useMemo(() => {
    const rand = createPRNG(99); // Fixed seed for stability
    const temp = [];

    for (let i = 0; i < count; i++) {
      const radius = 5.8 + rand() * 2.2; // Ring spans from radius 3.8 to 6.0
      const angle = rand() * Math.PI * 2; // Random position along the circle

      temp.push({
        radius,
        angle,
        speed: 0.05 + rand() * 0.15, // Varied orbital speeds
        yOffset: (rand() - 0.5) * 0.4, // Minor vertical thickness to the ring
        size: 0.03 + rand() * 0.08, // Varied rock sizes
        rotationSpeed: rand() * 2,
      });
    }
    return temp;
  }, [count]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    asteroids.forEach((rock, i) => {
      // Progress the orbit angle over time
      rock.angle += delta * rock.speed * 0.5;

      // Calculate 3D circular position around the central planet
      const x = Math.cos(rock.angle) * rock.radius;
      const z = Math.sin(rock.angle) * rock.radius;

      dummy.position.set(x, rock.yOffset, z);

      // Give the individual rocks some scale and spin
      dummy.scale.setScalar(rock.size);
      dummy.rotation.y = state.clock.getElapsedTime() * rock.rotationSpeed;

      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[null as any, null as any, count]}
      rotation={[Math.PI / 4, 0, 0.2]}
    >
      {/* Dodecahedron creates perfect jagged, low-poly rocks */}
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color="#555566"
        flatShading={true}
        roughness={0.9}
      />
    </instancedMesh>
  );
}
