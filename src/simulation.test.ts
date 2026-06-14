import { describe, expect, it } from 'vitest';
import {
  advanceCloudX,
  capDelta,
  clampFollowDistance,
  clampVehicleToAirspace,
  computeSimDelta,
  enforceMinSpeed,
  propellerDelta,
  scaleVelocityToSpeed,
} from './simulation';

describe('computeSimDelta', () => {
  it('returns zero when paused', () => {
    expect(computeSimDelta(0.016, true, 2)).toBe(0);
  });

  it('scales delta by time scale when running', () => {
    expect(computeSimDelta(0.1, false, 2)).toBeCloseTo(0.2);
    expect(computeSimDelta(0.1, false, 4)).toBeCloseTo(0.4);
  });
});

describe('advanceCloudX', () => {
  it('moves clouds along +X', () => {
    expect(advanceCloudX(100, 2, 0.5)).toBe(101);
  });

  it('wraps clouds past the eastern boundary', () => {
    expect(advanceCloudX(549, 4, 1)).toBe(-550);
  });
});

describe('clampVehicleToAirspace', () => {
  it('clamps position and reflects positive velocity at the upper wall', () => {
    const position = { x: 120, y: 0, z: 0 };
    const velocity = { x: 10, y: 0, z: 0 };

    clampVehicleToAirspace(position, velocity, 100);

    expect(position.x).toBe(98);
    expect(velocity.x).toBe(-5);
  });

  it('clamps position and reflects negative velocity at the lower wall', () => {
    const position = { x: -120, y: 0, z: 0 };
    const velocity = { x: -8, y: 0, z: 0 };

    clampVehicleToAirspace(position, velocity, 100);

    expect(position.x).toBe(-98);
    expect(velocity.x).toBe(4);
  });

  it('leaves in-bounds vehicles unchanged', () => {
    const position = { x: 10, y: -20, z: 30 };
    const velocity = { x: 5, y: -1, z: 2 };

    clampVehicleToAirspace(position, velocity, 100);

    expect(position).toEqual({ x: 10, y: -20, z: 30 });
    expect(velocity).toEqual({ x: 5, y: -1, z: 2 });
  });
});

describe('enforceMinSpeed', () => {
  it('boosts speeds below the minimum floor', () => {
    expect(enforceMinSpeed(3, 6)).toBe(6);
  });

  it('leaves speeds above the floor unchanged', () => {
    expect(enforceMinSpeed(12, 6)).toBe(12);
  });

  it('ignores near-zero speeds', () => {
    expect(enforceMinSpeed(0.0005, 6)).toBe(0.0005);
  });
});

describe('scaleVelocityToSpeed', () => {
  it('preserves direction while matching target speed', () => {
    const velocity = { x: 3, y: 0, z: 4 };
    scaleVelocityToSpeed(velocity, 5, 10);
    expect(velocity.x).toBeCloseTo(6);
    expect(velocity.y).toBe(0);
    expect(velocity.z).toBeCloseTo(8);
  });
});

describe('propellerDelta', () => {
  it('spins faster at higher airspeed', () => {
    expect(propellerDelta(10, 0.1)).toBeCloseTo(1.4);
    expect(propellerDelta(20, 0.1)).toBeCloseTo(2.8);
  });
});

describe('capDelta', () => {
  it('limits large frame gaps', () => {
    expect(capDelta(0.5)).toBe(0.1);
    expect(capDelta(0.016)).toBe(0.016);
  });
});

describe('clampFollowDistance', () => {
  it('clamps chase distance within camera limits', () => {
    expect(clampFollowDistance(3)).toBe(6);
    expect(clampFollowDistance(50)).toBe(50);
    expect(clampFollowDistance(120)).toBe(90);
  });
});
