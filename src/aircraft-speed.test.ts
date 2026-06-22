import { describe, expect, it } from 'vitest';
import { createAircraftSpeedProfile } from './aircraft-speed';

describe('createAircraftSpeedProfile', () => {
  it('derives min speed as 45% of cruise speed', () => {
    const profile = createAircraftSpeedProfile(() => 10);
    expect(profile.cruiseSpeed).toBe(10);
    expect(profile.minSpeed).toBe(4.5);
  });

  it('keeps start speed within the aircraft speed envelope', () => {
    const profile = createAircraftSpeedProfile(
      (min, max) => (min === 8 && max === 18 ? 12 : min === 60 && max === 100 ? 80 : 10),
    );
    expect(profile.startSpeed).toBeGreaterThanOrEqual(profile.minSpeed);
    expect(profile.startSpeed).toBeLessThanOrEqual(profile.cruiseSpeed);
    expect(profile.maxForce).toBe(80);
  });

  it('uses the configured cruise and force ranges', () => {
    const ranges: Array<[number, number]> = [];
    createAircraftSpeedProfile((min, max) => {
      ranges.push([min, max]);
      return min;
    });
    expect(ranges[0]).toEqual([8, 18]);
    expect(ranges[1]).toEqual([60, 100]);
  });
});
