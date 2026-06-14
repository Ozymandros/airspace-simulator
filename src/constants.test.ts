import { describe, expect, it } from 'vitest';
import {
  AIRCRAFT_COUNT,
  BOX_SIZE,
  COLORS,
  GROUND_Y,
  HALF,
  TRAIL_LENGTH,
} from './constants';

describe('constants', () => {
  it('defines a cubic airspace centered on the origin', () => {
    expect(HALF).toBe(BOX_SIZE / 2);
    expect(GROUND_Y).toBe(-HALF);
  });

  it('provides enough colors for the full fleet', () => {
    expect(COLORS.length).toBeGreaterThanOrEqual(AIRCRAFT_COUNT);
    expect(new Set(COLORS).size).toBe(COLORS.length);
  });

  it('uses a meaningful trail history length', () => {
    expect(TRAIL_LENGTH).toBeGreaterThan(10);
  });
});
