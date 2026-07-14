import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneControls } from "../SceneContext";

export function SphericalVisualizer() {
  const meshGeoRef = useRef<THREE.SphereGeometry>(null);
  const pointsGeoRef = useRef<THREE.SphereGeometry>(null);
  const { analyser } = useSceneControls();

  const widthSegments = 30;
  const heightSegments = 20;
  const baseRadius = 2.4; // Sits perfectly just outside the Earth's atmosphere

  // 1. Generate and cache a persistent copy of the baseline sphere positions
  const basePositions = useMemo(() => {
    const tempGeo = new THREE.SphereGeometry(
      baseRadius,
      widthSegments,
      heightSegments,
    );
    const posAttr = tempGeo.getAttribute("position").clone();
    tempGeo.dispose();
    return posAttr;
  }, []);

  const dataArray = useMemo(() => {
    if (!analyser) return new Uint8Array(0);
    return new Uint8Array(analyser.frequencyBinCount);
  }, [analyser]);

  useFrame((state) => {
    if (!analyser || dataArray.length === 0) return;

    analyser.getByteFrequencyData(dataArray);
    const binCount = analyser.frequencyBinCount;

    // Grab both the wireframe mesh and the particle cloud geometries
    const geometries = [meshGeoRef.current, pointsGeoRef.current];

    geometries.forEach((geo) => {
      if (!geo) return;

      const posAttribute = geo.getAttribute(
        "position",
      ) as THREE.BufferAttribute;
      const posArray = posAttribute.array as Float32Array;
      const baseArray = basePositions.array as Float32Array;
      const vertexCount = posAttribute.count;

      for (let i = 0; i < vertexCount; i++) {
        // Read baseline static coordinates
        const bx = baseArray[i * 3];
        const by = baseArray[i * 3 + 1];
        const bz = baseArray[i * 3 + 2];

        // Compute normal vector projection (pointing straight out from the center of the sphere)
        const currentLength = Math.sqrt(bx * bx + by * by + bz * bz);
        const nx = bx / currentLength;
        const ny = by / currentLength;
        const nz = bz / currentLength;

        // 2. Map frequencies across the sphere by latitude (Y-axis position)
        // This distributes bass sub-frequencies to the equator and crisp treble to the poles
        const normalizedHeight = (by + baseRadius) / (baseRadius * 2); // Scale from 0.0 to 1.0
        const binIdx = Math.floor(normalizedHeight * (binCount - 1));
        const audioValue = dataArray[binIdx] / 255;

        // Create a complex wave effect by blending audio value with a subtle time-based sine wave
        const waveWobble =
          Math.sin(state.clock.elapsedTime * 4.0 + bx * 2.0) * 0.05;
        const displacement = audioValue * 0.8 + waveWobble;

        // Push the vertex outward along its normal direction vector
        posArray[i * 3] = bx + nx * displacement;
        posArray[i * 3 + 1] = by + ny * displacement;
        posArray[i * 3 + 2] = bz + nz * displacement;
      }

      // Flush changes directly down to the WebGL draw context
      posAttribute.needsUpdate = true;
    });
  });

  return (
    <group position={[0, 0.25, 0]}>
      {/* LAYER A: The Glowing Cybernetic Scanner Wireframe Cage */}
      <mesh>
        <sphereGeometry
          ref={meshGeoRef}
          args={[baseRadius, widthSegments, heightSegments]}
        />
        <meshBasicMaterial
          color="#ff4e42" // Signature cybernetic scanner red
          wireframe
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* LAYER B: The Inner Matrix Point-Cloud Core */}
      <points>
        <sphereGeometry
          ref={pointsGeoRef}
          args={[baseRadius, widthSegments, heightSegments]}
        />
        <pointsMaterial
          color="#ffb3ab" // Soft highlights color
          size={0.06}
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
