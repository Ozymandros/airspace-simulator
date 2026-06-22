import * as THREE from 'three';
import * as YUKA from 'yuka';
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { HALF } from './constants';
import type { Aircraft } from './aircraft';
import type { CloudGroup } from './landscape';
import {
  advanceCloudX,
  capDelta,
  clampVehicleToAirspace,
  computeSimDelta,
  enforceMinSpeed,
  propellerDelta,
  scaleVelocityToSpeed,
} from './simulation';
import { updateTrackingPanel, type FollowState } from './ui';

const _pos = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _scale = new THREE.Vector3();
const _offset = new THREE.Vector3();
const _desired = new THREE.Vector3();
const _lookAt = new THREE.Vector3();
const _vel = new THREE.Vector3();
const _right = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
const _yawQ = new THREE.Quaternion();
const _pitchQ = new THREE.Quaternion();
const STEER_RATE = 1.4; // radians per second

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

    const delta = capDelta(time.update().getDelta());
    const simDelta = computeSimDelta(delta, state.simPaused, state.timeScale);

    entityManager.update(simDelta);

    for (const c of clouds) {
      c.position.x = advanceCloudX(c.position.x, c.userData.speed, simDelta);
    }

    for (const a of aircraftList) {
      const v = a.vehicle;

      if (simDelta > 0) {
        clampVehicleToAirspace(v.position, v.velocity, HALF);

        const speed = v.getSpeed();
        const targetSpeed = enforceMinSpeed(speed, a.minSpeed);
        if (targetSpeed !== speed) {
          scaleVelocityToSpeed(v.velocity, speed, targetSpeed);
        }

        a.propeller.rotation.z += propellerDelta(speed, simDelta);
        a.updateTrail();
      }
    }

    if (state.followTarget && simDelta > 0 && (state.manualInput.yaw || state.manualInput.pitch)) {
      const v = state.followTarget.vehicle;
      const speed = v.getSpeed();
      if (speed > 0.001) {
        _vel.set(v.velocity.x, v.velocity.y, v.velocity.z);
        _yawQ.setFromAxisAngle(_up, -state.manualInput.yaw * STEER_RATE * simDelta);
        _vel.applyQuaternion(_yawQ);
        _right.crossVectors(_vel, _up).normalize();
        _pitchQ.setFromAxisAngle(_right, state.manualInput.pitch * STEER_RATE * simDelta);
        _vel.applyQuaternion(_pitchQ);
        v.velocity.set(_vel.x, _vel.y, _vel.z);
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
