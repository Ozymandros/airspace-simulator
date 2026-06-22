import { describe, expect, it, vi } from 'vitest';
import type { PerspectiveCamera, WebGLRenderer } from 'three';
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { Aircraft } from './aircraft';
import { bindInput } from './input';
import { createFollowState } from './ui';

function mockAircraft(): Aircraft {
  return {
    index: 0,
    colorHex: '#FF3333',
    cruiseSpeed: 12,
    minSpeed: 5,
    materials: [],
    group: { children: [] } as Aircraft['group'],
    propeller: { rotation: { z: 0 } } as Aircraft['propeller'],
    vehicle: {
      getSpeed: () => 10,
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 10 },
    } as Aircraft['vehicle'],
    trail: {} as Aircraft['trail'],
    setHighlighted: vi.fn(),
    updateTrail: vi.fn(),
  };
}

function setupInput() {
  const state = createFollowState();
  const controls = { enabled: true, target: { set: vi.fn() } } as unknown as OrbitControls;
  const renderer = { domElement: document.createElement('canvas') } as WebGLRenderer;
  const camera = {} as PerspectiveCamera;
  bindInput(renderer, camera, controls, [mockAircraft()], state);
  return { state, controls, canvas: renderer.domElement };
}

function key(type: 'keydown' | 'keyup', code: string, key = code) {
  window.dispatchEvent(new KeyboardEvent(type, { code, key, bubbles: true }));
}

describe('bindInput', () => {
  it('toggles pause with Space', () => {
    const { state } = setupInput();
    key('keydown', 'Space', ' ');
    expect(state.simPaused).toBe(true);
    expect(document.getElementById('sim-status')?.textContent).toBe('Paused · 1×');
    key('keydown', 'Space', ' ');
    expect(state.simPaused).toBe(false);
  });

  it('sets time scale with number keys', () => {
    const { state } = setupInput();
    key('keydown', 'Digit2', '2');
    expect(state.timeScale).toBe(2);
    expect(document.getElementById('sim-status')?.textContent).toBe('Running · 2×');
    key('keydown', 'Digit4', '4');
    expect(state.timeScale).toBe(4);
  });

  it('tracks manual yaw while following an aircraft', () => {
    const { state } = setupInput();
    state.followTarget = mockAircraft();
    key('keydown', 'KeyA', 'a');
    expect(state.manualInput).toEqual({ pitch: 0, yaw: -1 });
    key('keyup', 'KeyA', 'a');
    expect(state.manualInput).toEqual({ pitch: 0, yaw: 0 });
  });

  it('ignores manual input when not following', () => {
    const { state } = setupInput();
    key('keydown', 'KeyW', 'w');
    expect(state.manualInput).toEqual({ pitch: 0, yaw: 0 });
  });

  it('adjusts follow distance with the mouse wheel while tracking', () => {
    const { state, canvas } = setupInput();
    state.followTarget = mockAircraft();
    canvas.dispatchEvent(new WheelEvent('wheel', { deltaY: 100, bubbles: true }));
    expect(state.followDistance).toBeGreaterThan(15);
  });

  it('releases follow with Escape', () => {
    const { state, controls } = setupInput();
    state.followTarget = mockAircraft();
    key('keydown', 'Escape');
    expect(state.followTarget).toBeNull();
    expect(controls.enabled).toBe(true);
  });
});
