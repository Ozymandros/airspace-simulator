import type { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { Aircraft } from './aircraft';

const trackingEl = document.getElementById('tracking')!;
const fleetEl = document.getElementById('fleet')!;
const simStatusEl = document.getElementById('sim-status')!;

export interface FollowState {
  followTarget: Aircraft | null;
  followDistance: number;
  simPaused: boolean;
  timeScale: number;
}

export function createFollowState(): FollowState {
  return {
    followTarget: null,
    followDistance: 15,
    simPaused: false,
    timeScale: 1,
  };
}

export function buildFleetPanel(aircraftList: Aircraft[], follow: (aircraft: Aircraft) => void): void {
  aircraftList.forEach((a) => {
    const btn = document.createElement('button');
    btn.style.background = a.colorHex;
    btn.style.color = a.colorHex;
    btn.title = `Follow Aircraft #${a.index} (cruise ${a.cruiseSpeed.toFixed(0)})`;
    btn.setAttribute('aria-label', btn.title);
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      follow(a);
    });
    fleetEl.appendChild(btn);
    a.fleetButton = btn;
  });
}

export function updateTrackingPanel(aircraft: Aircraft): void {
  const speed = aircraft.vehicle.getSpeed().toFixed(1);
  trackingEl.innerHTML =
    `<span class="swatch" style="background:${aircraft.colorHex};color:${aircraft.colorHex}"></span>` +
    `Tracking: Aircraft #${aircraft.index}<br>` +
    `Speed ${speed} / ${aircraft.cruiseSpeed.toFixed(0)}`;
}

export function updateSimStatus(state: FollowState): void {
  simStatusEl.textContent = `${state.simPaused ? 'Paused' : 'Running'} · ${state.timeScale}×`;
  simStatusEl.classList.toggle('paused', state.simPaused);
}

export function followAircraft(
  aircraft: Aircraft,
  state: FollowState,
  controls: OrbitControls,
): void {
  if (state.followTarget) {
    state.followTarget.setHighlighted(false);
    state.followTarget.fleetButton?.classList.remove('active');
  }
  state.followTarget = aircraft;
  aircraft.setHighlighted(true);
  aircraft.fleetButton?.classList.add('active');
  controls.enabled = false;
  updateTrackingPanel(aircraft);
}

export function releaseFollow(state: FollowState, controls: OrbitControls): void {
  if (!state.followTarget) return;
  state.followTarget.setHighlighted(false);
  state.followTarget.fleetButton?.classList.remove('active');
  controls.target.set(
    state.followTarget.vehicle.position.x,
    state.followTarget.vehicle.position.y,
    state.followTarget.vehicle.position.z,
  );
  state.followTarget = null;
  controls.enabled = true;
  trackingEl.textContent = '';
}
