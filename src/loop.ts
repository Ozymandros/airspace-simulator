import * as THREE from 'three';
import * as YUKA from 'yuka';
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { HALF } from './constants';
import type { Aircraft } from './aircraft';
import type { CloudGroup } from './landscape';
import { updateTrackingPanel, type FollowState } from './ui';

const _pos = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _scale = new THREE.Vector3();
const _offset = new THREE.Vector3();
const _desired = new THREE.Vector3();
const _lookAt = new THREE.Vector3();

export interface LoopContext {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  entityManager: YUKA.EntityManager;
  time: YUKA.Time;
  aircraftList: Aircraft[];
  clouds: CloudGroup[];
  state: FollowState;
}

export function startLoop(ctx: LoopContext): void {
  const { scene, camera, renderer, controls, entityManager, time, aircraftList, clouds, state } =
    ctx;

  function animate(): void {
    requestAnimationFrame(animate);

    const delta = Math.min(time.update().getDelta(), 0.1);
    const simDelta = state.simPaused ? 0 : delta * state.timeScale;

    entityManager.update(simDelta);

    for (const c of clouds) {
      c.position.x += c.userData.speed * simDelta;
      if (c.position.x > 550) c.position.x = -550;
    }

    for (const a of aircraftList) {
      const v = a.vehicle;

      if (simDelta > 0) {
        for (const axis of ['x', 'y', 'z'] as const) {
          const limit = HALF - 2;
          if (v.position[axis] > limit) {
            v.position[axis] = limit;
            if (v.velocity[axis] > 0) v.velocity[axis] *= -0.5;
          }
          if (v.position[axis] < -limit) {
            v.position[axis] = -limit;
            if (v.velocity[axis] < 0) v.velocity[axis] *= -0.5;
          }
        }

        const speed = v.getSpeed();
        if (speed > 0.001 && speed < a.minSpeed) {
          v.velocity.multiplyScalar(a.minSpeed / speed);
        }

        a.propeller.rotation.z += speed * 1.4 * simDelta;
        a.updateTrail();
      }
    }

    if (state.followTarget) {
      updateTrackingPanel(state.followTarget);
      const g = state.followTarget.group;
      g.matrix.decompose(_pos, _quat, _scale);
      _offset.set(0, state.followDistance * 0.3, -state.followDistance).applyQuaternion(_quat);
      _desired.copy(_pos).add(_offset);
      camera.position.lerp(_desired, 0.06);
      _lookAt.lerp(_pos, 0.25);
      camera.lookAt(_lookAt);
    } else {
      controls.update();
    }

    renderer.render(scene, camera);
  }

  animate();
}
