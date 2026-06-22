export interface ManualInput {
  pitch: number;
  yaw: number;
}

export const STEER_RATE = 1.4;

/** Map held steer keys to pitch/yaw while following an aircraft. */
export function computeManualInput(steerKeys: ReadonlySet<string>, hasFollowTarget: boolean): ManualInput {
  if (!hasFollowTarget) return { pitch: 0, yaw: 0 };
  return {
    yaw:
      (steerKeys.has('KeyA') || steerKeys.has('ArrowLeft') ? -1 : 0) +
      (steerKeys.has('KeyD') || steerKeys.has('ArrowRight') ? 1 : 0),
    pitch:
      (steerKeys.has('KeyW') || steerKeys.has('ArrowUp') ? -1 : 0) +
      (steerKeys.has('KeyS') || steerKeys.has('ArrowDown') ? 1 : 0),
  };
}
