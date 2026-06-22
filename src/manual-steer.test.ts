import { describe, expect, it } from 'vitest';
import { computeManualInput } from './manual-steer';

describe('computeManualInput', () => {
  it('returns neutral input when not following', () => {
    expect(computeManualInput(new Set(['KeyA']), false)).toEqual({ pitch: 0, yaw: 0 });
  });

  it('maps WASD to yaw and pitch', () => {
    expect(computeManualInput(new Set(['KeyA', 'KeyW']), true)).toEqual({ pitch: -1, yaw: -1 });
    expect(computeManualInput(new Set(['KeyD', 'KeyS']), true)).toEqual({ pitch: 1, yaw: 1 });
  });

  it('maps arrow keys the same as WASD', () => {
    expect(computeManualInput(new Set(['ArrowLeft', 'ArrowUp']), true)).toEqual({
      pitch: -1,
      yaw: -1,
    });
  });
});
