/* eslint-disable @typescript-eslint/no-unused-vars */
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneControls } from "../SceneContext";

export function CircularVisualizer() {
  const { analyser } = useSceneControls();

  const numRings = 3;
  const numPoints = 180; // Matches your original layout point count
  const baseRadius = 3.2; // Placed right outside the Earth's atmosphere boundary

  // Create references to update line geometries directly
  const geoRefs = [
    useRef<THREE.BufferGeometry>(null),
    useRef<THREE.BufferGeometry>(null),
    useRef<THREE.BufferGeometry>(null),
  ];

  // Pre-allocate frequency data memory tracking buffers
  const dataArray = useMemo(() => {
    if (!analyser) return new Uint8Array(0);
    return new Uint8Array(analyser.frequencyBinCount);
  }, [analyser]);

  // Generate static base circle distributions on mount
  const ringsData = useMemo(() => {
    return Array.from({ length: numRings }).map((_, ringIdx) => {
      const positions = new Float32Array(numPoints * 3);
      const angles = new Float32Array(numPoints);

      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        angles[i] = angle;

        // X, Y, Z initial structural layout positions
        positions[i * 3] = Math.cos(angle) * baseRadius;
        positions[i * 3 + 1] = ringIdx * 0.08 - 0.08; // Slight stacking separation along the Y-axis
        positions[i * 3 + 2] = Math.sin(angle) * baseRadius;
      }

      return { positions, angles };
    });
  }, []);

  useFrame(() => {
    if (!analyser || dataArray.length === 0) return;

    analyser.getByteFrequencyData(dataArray);
    const binCount = analyser.frequencyBinCount;

    for (let ring = 0; ring < numRings; ring++) {
      const geo = geoRefs[ring].current;
      if (!geo) continue;

      const posAttribute = geo.getAttribute(
        "position",
      ) as THREE.BufferAttribute;
      const posArray = posAttribute.array as Float32Array;
      const { angles } = ringsData[ring];

      // Replicate the frequency range bin splits from your original logic
      const freqRangeStart = Math.floor((ring * binCount) / (numRings * 1.5));
      const freqRangeEnd = Math.floor(
        ((ring + 1) * binCount) / (numRings * 1.5),
      );
      const freqRange = freqRangeEnd - freqRangeStart;
      const segmentSize = Math.max(1, Math.floor(freqRange / numPoints));

      const ringRadius = baseRadius * (1.0 + ring * 0.12);

      for (let i = 0; i < numPoints; i++) {
        // Average frequency data for this specific line segment block
        let sum = 0;
        for (let j = 0; j < segmentSize; j++) {
          const freqIndex =
            freqRangeStart + ((i * segmentSize + j) % freqRange);
          sum += dataArray[freqIndex];
        }

        const normalizedValue = sum / (segmentSize * 255); // 0.0 to 1.0

        // Push vertices outward dynamically based on music amplitude spike
        const dynamicRadius = ringRadius * (1.0 + normalizedValue * 0.4);
        const angle = angles[i];

        // Update the Float32Array tracking positions live
        posArray[i * 3] = Math.cos(angle) * dynamicRadius;
        posArray[i * 3 + 2] = Math.sin(angle) * dynamicRadius;
      }

      // Tell WebGL to flush new geometry shifts immediately down to the screen paint cache
      posAttribute.needsUpdate = true;
    }
  });

  // Render using your project's high-contrast scanner theme colors
  const ringColors = ["#ff4e42", "#c2362f", "#ffb3ab"];

  return (
    <group>
      {ringsData.map((ring, index) => (
        <lineLoop key={index}>
          <bufferGeometry ref={geoRefs[index]}>
            <bufferAttribute
              attach="attributes-position"
              args={[ring.positions, 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color={ringColors[index]}
            linewidth={2}
            transparent
            opacity={0.8 - index * 0.15}
            blending={THREE.AdditiveBlending}
          />
        </lineLoop>
      ))}
    </group>
  );
}
