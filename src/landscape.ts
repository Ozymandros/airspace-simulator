import * as THREE from 'three';
import { GROUND_Y } from './constants';

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

const dummy = new THREE.Object3D();

function scatter(
  count: number,
  minD: number,
  maxD: number,
  maxH: number,
  place: (index: number, x: number, y: number, z: number) => void,
): number {
  let placed = 0;
  let guard = 0;
  while (placed < count && guard++ < count * 40) {
    const ang = Math.random() * Math.PI * 2;
    const d = THREE.MathUtils.randFloat(minD, maxD);
    const x = Math.cos(ang) * d;
    const z = Math.sin(ang) * d;
    if (Math.max(Math.abs(x), Math.abs(z)) < 104) continue;
    const h = terrainHeight(x, z);
    if (h > maxH) continue;
    place(placed++, x, GROUND_Y + h, z);
  }
  return placed;
}

export interface CloudGroup extends THREE.Group {
  userData: THREE.Object3D['userData'] & { speed: number };
}

export function buildLandscape(scene: THREE.Scene): CloudGroup[] {
  const geo = new THREE.PlaneGeometry(1200, 1200, 96, 96);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const grass = new THREE.Color(0x55803f);
  const rock = new THREE.Color(0x8a7f72);
  const snow = new THREE.Color(0xeef3f8);
  const c = new THREE.Color();

  for (let i = 0; i < pos.count; i++) {
    const h = terrainHeight(pos.getX(i), pos.getZ(i));
    pos.setY(i, h);
    if (h > 48) c.copy(rock).lerp(snow, THREE.MathUtils.smoothstep(h, 48, 65));
    else c.copy(grass).lerp(rock, THREE.MathUtils.smoothstep(h, 12, 48));
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const terrain = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1 }),
  );
  terrain.position.y = GROUND_Y;
  scene.add(terrain);

  const TREES = 110;
  const trunks = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.35, 0.5, 3, 5),
    new THREE.MeshStandardMaterial({ color: 0x6b4a2f, flatShading: true }),
    TREES,
  );
  const canopies = new THREE.InstancedMesh(
    new THREE.ConeGeometry(2.4, 6.5, 6),
    new THREE.MeshStandardMaterial({ color: 0x2f5e33, flatShading: true }),
    TREES,
  );
  let n = scatter(TREES, 110, 400, 20, (i, x, y, z) => {
    const s = THREE.MathUtils.randFloat(0.8, 1.7);
    dummy.position.set(x, y + 1.5 * s, z);
    dummy.rotation.set(0, Math.random() * Math.PI * 2, 0);
    dummy.scale.setScalar(s);
    dummy.updateMatrix();
    trunks.setMatrixAt(i, dummy.matrix);
    dummy.position.y = y + 5.2 * s;
    dummy.updateMatrix();
    canopies.setMatrixAt(i, dummy.matrix);
  });
  trunks.count = canopies.count = n;
  scene.add(trunks, canopies);

  const HOUSES = 16;
  const bodies = new THREE.InstancedMesh(
    new THREE.BoxGeometry(6, 4, 5),
    new THREE.MeshStandardMaterial({ flatShading: true }),
    HOUSES,
  );
  const roofs = new THREE.InstancedMesh(
    new THREE.ConeGeometry(4.4, 2.8, 4),
    new THREE.MeshStandardMaterial({ color: 0xa8523c, flatShading: true }),
    HOUSES,
  );
  const walls = [0xe8e0cf, 0xd9c9a8, 0xcfd8e0, 0xe3d2c2];
  const wallColor = new THREE.Color();
  n = scatter(HOUSES, 110, 300, 8, (i, x, y, z) => {
    const s = THREE.MathUtils.randFloat(0.9, 1.4);
    const rot = Math.random() * Math.PI * 2;
    dummy.position.set(x, y + 2 * s, z);
    dummy.rotation.set(0, rot, 0);
    dummy.scale.setScalar(s);
    dummy.updateMatrix();
    bodies.setMatrixAt(i, dummy.matrix);
    bodies.setColorAt(i, wallColor.setHex(walls[i % walls.length]));
    dummy.position.y = y + 5.4 * s;
    dummy.rotation.y = rot + Math.PI / 4;
    dummy.updateMatrix();
    roofs.setMatrixAt(i, dummy.matrix);
  });
  bodies.count = roofs.count = n;
  scene.add(bodies, roofs);

  const clouds: CloudGroup[] = [];
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    flatShading: true,
    transparent: true,
    opacity: 0.92,
    roughness: 1,
  });
  const puffGeo = new THREE.SphereGeometry(1, 7, 5);

  for (let i = 0; i < 9; i++) {
    const cloud = new THREE.Group() as CloudGroup;
    const puffs = 3 + Math.floor(Math.random() * 4);
    for (let p = 0; p < puffs; p++) {
      const puff = new THREE.Mesh(puffGeo, cloudMat);
      puff.position.set(
        THREE.MathUtils.randFloatSpread(16),
        THREE.MathUtils.randFloatSpread(3),
        THREE.MathUtils.randFloatSpread(7),
      );
      puff.scale.set(
        THREE.MathUtils.randFloat(5, 10),
        THREE.MathUtils.randFloat(2.6, 4.5),
        THREE.MathUtils.randFloat(4, 7),
      );
      cloud.add(puff);
    }
    cloud.position.set(
      THREE.MathUtils.randFloatSpread(900),
      THREE.MathUtils.randFloat(125, 190),
      THREE.MathUtils.randFloatSpread(900),
    );
    cloud.userData.speed = THREE.MathUtils.randFloat(1.5, 4);
    clouds.push(cloud);
    scene.add(cloud);
  }

  return clouds;
}
