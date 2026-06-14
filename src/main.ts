import './styles.css';

import * as YUKA from 'yuka';
import { AIRCRAFT_COUNT, COLORS } from './constants';
import { Aircraft } from './aircraft';
import { buildLandscape } from './landscape';
import { createScene, bindResize } from './scene';
import {
  buildFleetPanel,
  createFollowState,
  followAircraft,
  updateSimStatus,
} from './ui';
import { bindInput } from './input';
import { startLoop } from './loop';

const { scene, camera, renderer, controls } = createScene();
bindResize(camera, renderer);

const clouds = buildLandscape(scene);

const entityManager = new YUKA.EntityManager();
const time = new YUKA.Time();

const aircraftList: Aircraft[] = [];
for (let i = 0; i < AIRCRAFT_COUNT; i++) {
  const a = new Aircraft(i, COLORS[i % COLORS.length]);
  aircraftList.push(a);
  entityManager.add(a.vehicle);
  scene.add(a.group, a.trail);
}

const state = createFollowState();
updateSimStatus(state);

buildFleetPanel(aircraftList, (aircraft) => followAircraft(aircraft, state, controls));
bindInput(renderer, camera, controls, aircraftList, state);

startLoop({
  scene,
  camera,
  renderer,
  controls,
  entityManager,
  time,
  aircraftList,
  clouds,
  state,
});
