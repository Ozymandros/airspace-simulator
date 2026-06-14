import * as THREE from 'three';

export function terrainHeight(x: number, z: number): number {
  const d = Math.hypot(x, z);
  const m = THREE.MathUtils.smoothstep(d, 220, 520);
  const ridges =
    Math.abs(Math.sin(x * 0.012) * Math.cos(z * 0.014)) * 55 +
    Math.abs(Math.sin(x * 0.031 + 1.7) * Math.sin(z * 0.027 + 4.2)) * 24 +
    Math.sin(x * 0.07 + z * 0.05) * 5;
  const rolling =
    Math.sin(x * 0.05) * Math.cos(z * 0.045) * 2 *
    THREE.MathUtils.smoothstep(d, 115, 170);
  return ridges * m + rolling * (1 - m);
}
