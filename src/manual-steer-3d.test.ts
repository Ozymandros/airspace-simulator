import { describe, expect, it } from 'vitest';
import { applyManualSteer } from './manual-steer-3d';

describe('applyManualSteer', () => {
  it('rotates velocity while preserving speed', () => {
    const velocity = { x: 0, y: 0, z: 10 };
    applyManualSteer(velocity, 0, 1, 0.1);
    const speed = Math.hypot(velocity.x, velocity.y, velocity.z);
    expect(speed).toBeCloseTo(10, 5);
    expect(velocity.x).not.toBe(0);
  });

  it('does nothing at zero airspeed', () => {
    const velocity = { x: 0, y: 0, z: 0 };
    applyManualSteer(velocity, 1, 1, 0.1);
    expect(velocity).toEqual({ x: 0, y: 0, z: 0 });
  });

  it('does nothing when sim is paused', () => {
    const velocity = { x: 0, y: 0, z: 10 };
    applyManualSteer(velocity, 1, 0, 0);
    expect(velocity).toEqual({ x: 0, y: 0, z: 10 });
  });
});
