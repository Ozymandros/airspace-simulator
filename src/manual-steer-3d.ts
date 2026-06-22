import * as THREE from 'three';
import type { AxisState } from './simulation';
import { STEER_RATE } from './manual-steer';

const _vel = new THREE.Vector3();
const _right = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
const _yawQ = new THREE.Quaternion();
const _pitchQ = new THREE.Quaternion();

/** Rotate velocity toward manual pitch/yaw while preserving airspeed. */
export function applyManualSteer(
  velocity: AxisState,
  pitch: number,
  yaw: number,
  simDelta: number,
  steerRate = STEER_RATE,
): void {
  const speed = Math.hypot(velocity.x, velocity.y, velocity.z);
  if (speed <= 0.001 || simDelta <= 0 || (!pitch && !yaw)) return;

  _vel.set(velocity.x, velocity.y, velocity.z);
  _yawQ.setFromAxisAngle(_up, -yaw * steerRate * simDelta);
  _vel.applyQuaternion(_yawQ);
  _right.crossVectors(_vel, _up).normalize();
  _pitchQ.setFromAxisAngle(_right, pitch * steerRate * simDelta);
  _vel.applyQuaternion(_pitchQ);
  velocity.x = _vel.x;
  velocity.y = _vel.y;
  velocity.z = _vel.z;
}
