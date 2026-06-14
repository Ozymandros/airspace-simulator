export interface AxisState {
  x: number;
  y: number;
  z: number;
}

/** Simulation timestep after pause and time-scale are applied. */
export function computeSimDelta(delta: number, paused: boolean, timeScale: number): number {
  return paused ? 0 : delta * timeScale;
}

/** Advance a cloud along +X and wrap at the scene boundary. */
export function advanceCloudX(x: number, speed: number, simDelta: number): number {
  let next = x + speed * simDelta;
  if (next > 550) next = -550;
  return next;
}

/** Hard clamp a vehicle inside the airspace cube and dampen velocity at walls. */
export function clampVehicleToAirspace(
  position: AxisState,
  velocity: AxisState,
  half: number,
  edgeInset = 2,
): void {
  const limit = half - edgeInset;
  for (const axis of ['x', 'y', 'z'] as const) {
    if (position[axis] > limit) {
      position[axis] = limit;
      if (velocity[axis] > 0) velocity[axis] *= -0.5;
    }
    if (position[axis] < -limit) {
      position[axis] = -limit;
      if (velocity[axis] < 0) velocity[axis] *= -0.5;
    }
  }
}

/** Boost sub-minimum airspeed up to the aircraft floor. Returns the effective speed. */
export function enforceMinSpeed(speed: number, minSpeed: number): number {
  if (speed > 0.001 && speed < minSpeed) return minSpeed;
  return speed;
}

/** Scale a velocity vector to match a target speed while preserving direction. */
export function scaleVelocityToSpeed(velocity: AxisState, currentSpeed: number, targetSpeed: number): void {
  if (currentSpeed <= 0.001) return;
  const factor = targetSpeed / currentSpeed;
  velocity.x *= factor;
  velocity.y *= factor;
  velocity.z *= factor;
}

/** Propeller rotation increment for one simulation step. */
export function propellerDelta(speed: number, simDelta: number): number {
  return speed * 1.4 * simDelta;
}

/** Cap raw frame delta to avoid huge jumps after tab backgrounding. */
export function capDelta(delta: number, max = 0.1): number {
  return Math.min(delta, max);
}

/** Follow-camera chase distance clamp. */
export function clampFollowDistance(distance: number, min = 6, max = 90): number {
  return Math.max(min, Math.min(max, distance));
}
