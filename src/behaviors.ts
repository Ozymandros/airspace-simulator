import * as THREE from 'three';
import * as YUKA from 'yuka';
import { HALF } from './constants';

export class ContainmentBehavior extends YUKA.SteeringBehavior {
  half: number;
  margin: number;
  strength: number;

  constructor(half = HALF, margin = 30, strength = 60) {
    super();
    this.half = half;
    this.margin = margin;
    this.strength = strength;
  }

  calculate(vehicle: YUKA.Vehicle, force: YUKA.Vector3): YUKA.Vector3 {
    const inner = this.half - this.margin;
    for (const axis of ['x', 'y', 'z'] as const) {
      const p = vehicle.position[axis];
      if (p > inner) {
        const t = Math.min((p - inner) / this.margin, 1.5);
        force[axis] -= t * t * this.strength;
      } else if (p < -inner) {
        const t = Math.min((-p - inner) / this.margin, 1.5);
        force[axis] += t * t * this.strength;
      }
    }
    return force;
  }
}

export class AltitudeWanderBehavior extends YUKA.SteeringBehavior {
  targetY: number;
  timer: number;

  constructor() {
    super();
    this.targetY = THREE.MathUtils.randFloat(-HALF + 35, HALF - 35);
    this.timer = THREE.MathUtils.randFloat(4, 12);
  }

  calculate(vehicle: YUKA.Vehicle, force: YUKA.Vector3, delta: number): YUKA.Vector3 {
    this.timer -= delta;
    if (this.timer <= 0) {
      this.targetY = THREE.MathUtils.randFloat(-HALF + 35, HALF - 35);
      this.timer = THREE.MathUtils.randFloat(8, 16);
    }
    force.y += THREE.MathUtils.clamp((this.targetY - vehicle.position.y) * 0.4, -6, 6);
    return force;
  }
}
