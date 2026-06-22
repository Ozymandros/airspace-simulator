import { describe, expect, it, vi } from 'vitest';
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { Aircraft } from './aircraft';
import {
  buildFleetPanel,
  createFollowState,
  followAircraft,
  releaseFollow,
  updateSimStatus,
  updateTrackingPanel,
} from './ui';

function mockAircraft(index: number, colorHex: string, speed: number, cruiseSpeed: number): Aircraft {
  return {
    index,
    colorHex,
    cruiseSpeed,
    minSpeed: cruiseSpeed * 0.45,
    materials: [],
    group: {} as Aircraft['group'],
    propeller: { rotation: { z: 0 } } as Aircraft['propeller'],
    vehicle: { getSpeed: () => speed, position: { x: 1, y: 2, z: 3 } } as Aircraft['vehicle'],
    trail: {} as Aircraft['trail'],
    setHighlighted: vi.fn(),
    updateTrail: vi.fn(),
  };
}

function mockControls(): OrbitControls {
  return {
    enabled: true,
    target: { set: vi.fn() },
  } as unknown as OrbitControls;
}

describe('createFollowState', () => {
  it('starts in running mode at 1x speed with neutral manual input', () => {
    expect(createFollowState()).toEqual({
      followTarget: null,
      followDistance: 15,
      simPaused: false,
      timeScale: 1,
      manualInput: { pitch: 0, yaw: 0 },
    });
  });
});

describe('updateSimStatus', () => {
  const baseState = {
    followTarget: null,
    followDistance: 15,
    manualInput: { pitch: 0, yaw: 0 },
  };

  it('shows running state and time scale', () => {
    updateSimStatus({ ...baseState, simPaused: false, timeScale: 2 });
    const el = document.getElementById('sim-status');
    expect(el?.textContent).toBe('Running · 2×');
    expect(el?.classList.contains('paused')).toBe(false);
  });

  it('shows paused state with highlight class', () => {
    updateSimStatus({ ...baseState, simPaused: true, timeScale: 4 });
    const el = document.getElementById('sim-status');
    expect(el?.textContent).toBe('Paused · 4×');
    expect(el?.classList.contains('paused')).toBe(true);
  });
});

describe('updateTrackingPanel', () => {
  it('renders aircraft index and speed telemetry', () => {
    const aircraft = mockAircraft(4, '#FF3333', 11.2, 15);
    updateTrackingPanel(aircraft);
    expect(document.getElementById('tracking')?.innerHTML).toContain('Aircraft #4');
    expect(document.getElementById('tracking')?.innerHTML).toContain('Speed 11.2 / 15');
  });
});

describe('buildFleetPanel', () => {
  it('creates one button per aircraft', () => {
    const fleet = document.getElementById('fleet')!;
    fleet.innerHTML = '';
    const follow = vi.fn();
    buildFleetPanel(
      [mockAircraft(0, '#FF3333', 10, 12), mockAircraft(1, '#33FF33', 8, 14)],
      follow,
    );
    expect(fleet.querySelectorAll('button')).toHaveLength(2);
  });

  it('calls follow when a fleet button is clicked', () => {
    const fleet = document.getElementById('fleet')!;
    fleet.innerHTML = '';
    const follow = vi.fn();
    const aircraft = mockAircraft(3, '#AA88FF', 10, 12);
    buildFleetPanel([aircraft], follow);

    fleet.querySelector('button')?.click();
    expect(follow).toHaveBeenCalledWith(aircraft);
  });
});

describe('followAircraft', () => {
  it('selects an aircraft and disables orbit controls', () => {
    const state = createFollowState();
    const controls = mockControls();
    const aircraft = mockAircraft(2, '#3355FF', 9, 13);
    aircraft.fleetButton = document.createElement('button');

    followAircraft(aircraft, state, controls);

    expect(state.followTarget).toBe(aircraft);
    expect(aircraft.setHighlighted).toHaveBeenCalledWith(true);
    expect(controls.enabled).toBe(false);
    expect(document.getElementById('tracking')?.innerHTML).toContain('Aircraft #2');
  });

  it('clears the previous follow target when switching aircraft', () => {
    const state = createFollowState();
    const controls = mockControls();
    const first = mockAircraft(0, '#FF3333', 8, 12);
    const second = mockAircraft(1, '#33FF33', 9, 14);
    first.fleetButton = document.createElement('button');
    second.fleetButton = document.createElement('button');
    first.fleetButton.classList.add('active');
    state.followTarget = first;

    followAircraft(second, state, controls);

    expect(first.setHighlighted).toHaveBeenCalledWith(false);
    expect(first.fleetButton.classList.contains('active')).toBe(false);
    expect(state.followTarget).toBe(second);
  });
});

describe('releaseFollow', () => {
  it('clears follow mode and re-enables orbit controls', () => {
    const state = createFollowState();
    const controls = mockControls();
    const aircraft = mockAircraft(1, '#FFAA00', 10, 16);
    aircraft.fleetButton = document.createElement('button');
    state.followTarget = aircraft;

    releaseFollow(state, controls);

    expect(state.followTarget).toBeNull();
    expect(aircraft.setHighlighted).toHaveBeenCalledWith(false);
    expect(controls.enabled).toBe(true);
    expect(controls.target.set).toHaveBeenCalledWith(1, 2, 3);
    expect(state.manualInput).toEqual({ pitch: 0, yaw: 0 });
    expect(document.getElementById('tracking')?.textContent).toBe('');
  });
});
