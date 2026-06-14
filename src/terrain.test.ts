import { describe, expect, it } from 'vitest';
import { terrainHeight } from './terrain';

describe('terrainHeight', () => {
  it('keeps the valley under the airspace flat', () => {
    expect(terrainHeight(0, 0)).toBeCloseTo(0, 1);
    expect(terrainHeight(50, 0)).toBeLessThan(5);
    expect(terrainHeight(0, 80)).toBeLessThan(5);
  });

  it('rises toward distant mountains', () => {
    const near = terrainHeight(150, 150);
    const far = terrainHeight(450, 450);
    expect(far).toBeGreaterThan(near);
  });

  it('is deterministic for the same coordinates', () => {
    expect(terrainHeight(120, -340)).toBe(terrainHeight(120, -340));
  });
});
