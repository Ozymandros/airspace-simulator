import { describe, expect, it, vi } from 'vitest';
import type * as YUKA from 'yuka';
import { ContainmentBehavior, AltitudeWanderBehavior } from './behaviors';
import { HALF } from './constants';

function mockVehicle(x: number, y: number, z: number) {
  return { position: { x, y, z } };
}

function zeroForce(): YUKA.Vector3 {
  return { x: 0, y: 0, z: 0 } as YUKA.Vector3;
}

describe('ContainmentBehavior', () => {
  it('applies no force at the center of the airspace', () => {
    const behavior = new ContainmentBehavior(100, 30, 60);
    const force = behavior.calculate(mockVehicle(0, 0, 0) as never, zeroForce());
    expect(force).toEqual({ x: 0, y: 0, z: 0 });
  });

  it('pushes inward near the positive X wall', () => {
    const behavior = new ContainmentBehavior(100, 30, 60);
    const force = behavior.calculate(mockVehicle(80, 0, 0) as never, zeroForce());
    expect(force.x).toBeLessThan(0);
    expect(force.y).toBe(0);
    expect(force.z).toBe(0);
  });

  it('pushes inward near the negative Z wall', () => {
    const behavior = new ContainmentBehavior(100, 30, 60);
    const force = behavior.calculate(mockVehicle(0, 0, -85) as never, zeroForce());
    expect(force.z).toBeGreaterThan(0);
  });

  it('grows quadratically deeper inside the margin zone', () => {
    const behavior = new ContainmentBehavior(100, 30, 60);
    const shallow = behavior.calculate(mockVehicle(72, 0, 0) as never, zeroForce());
    const deep = behavior.calculate(mockVehicle(90, 0, 0) as never, zeroForce());
    expect(Math.abs(deep.x)).toBeGreaterThan(Math.abs(shallow.x));
  });
});

describe('AltitudeWanderBehavior', () => {
  it('steers toward the target altitude', () => {
    const behavior = new AltitudeWanderBehavior();
    behavior.targetY = 40;
    behavior.timer = 10;

    const force = behavior.calculate(mockVehicle(0, 0, 0) as never, zeroForce(), 0.016);
    expect(force.y).toBeGreaterThan(0);
  });

  it('picks a new target when the timer expires', () => {
    const behavior = new AltitudeWanderBehavior();
    behavior.targetY = 10;
    behavior.timer = 0.01;

    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5);

    behavior.calculate(mockVehicle(0, 0, 0) as never, zeroForce(), 0.02);

    expect(behavior.timer).toBeGreaterThan(0);
    expect(behavior.targetY).toBeGreaterThanOrEqual(-HALF + 35);
    expect(behavior.targetY).toBeLessThanOrEqual(HALF - 35);

    randomSpy.mockRestore();
  });

  it('clamps vertical steering force', () => {
    const behavior = new AltitudeWanderBehavior();
    behavior.targetY = HALF;
    behavior.timer = 10;

    const force = behavior.calculate(mockVehicle(0, -HALF, 0) as never, zeroForce(), 0.016);
    expect(force.y).toBeLessThanOrEqual(6);
    expect(force.y).toBeGreaterThanOrEqual(-6);
  });
});
