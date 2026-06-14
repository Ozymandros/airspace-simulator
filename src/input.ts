import * as THREE from 'three';
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { Aircraft } from './aircraft';
import {
  followAircraft,
  releaseFollow,
  updateSimStatus,
  type FollowState,
} from './ui';

export function bindInput(
  renderer: THREE.WebGLRenderer,
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
  aircraftList: Aircraft[],
  state: FollowState,
): void {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let downX = 0;
  let downY = 0;

  const follow = (aircraft: Aircraft) => followAircraft(aircraft, state, controls);
  const release = () => releaseFollow(state, controls);

  renderer.domElement.addEventListener('pointerdown', (e) => {
    downX = e.clientX;
    downY = e.clientY;
  });

  renderer.domElement.addEventListener('click', (e) => {
    if (Math.hypot(e.clientX - downX, e.clientY - downY) > 5) return;

    pointer.set(
      (e.clientX / innerWidth) * 2 - 1,
      -(e.clientY / innerHeight) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(
      aircraftList.map((a) => a.group),
      true,
    );
    const hit = hits.find((h) => h.object.userData.aircraft as Aircraft | undefined);

    if (hit?.object.userData.aircraft) follow(hit.object.userData.aircraft as Aircraft);
    else release();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') release();
    if (e.code === 'Space') {
      e.preventDefault();
      state.simPaused = !state.simPaused;
      updateSimStatus(state);
    }
    if (e.key === '1' || e.key === '2' || e.key === '4') {
      state.timeScale = Number(e.key);
      updateSimStatus(state);
    }
  });

  renderer.domElement.addEventListener(
    'wheel',
    (e) => {
      if (!state.followTarget) return;
      e.preventDefault();
      state.followDistance = THREE.MathUtils.clamp(
        state.followDistance + e.deltaY * 0.02,
        6,
        90,
      );
    },
    { passive: false },
  );
}
