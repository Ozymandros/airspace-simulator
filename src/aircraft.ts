import * as THREE from 'three';
import * as YUKA from 'yuka';
import { TRAIL_LENGTH } from './constants';
import { ContainmentBehavior, AltitudeWanderBehavior } from './behaviors';
import { createAircraftSpeedProfile } from './aircraft-speed';
import { syncEntity } from './sync';

export class Aircraft {
  index: number;
  colorHex: string;
  materials: THREE.MeshStandardMaterial[];
  group: THREE.Group;
  propeller: THREE.Group;
  vehicle: YUKA.Vehicle;
  trail: THREE.Line;
  cruiseSpeed: number;
  minSpeed: number;
  fleetButton?: HTMLButtonElement;

  constructor(index: number, colorHex: string) {
    this.index = index;
    this.colorHex = colorHex;

    const color = new THREE.Color(colorHex);
    const bodyMat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.65,
      metalness: 0.05,
      emissive: color,
      emissiveIntensity: 0.12,
    });
    const wingMat = new THREE.MeshStandardMaterial({
      color: color.clone().offsetHSL(0, -0.05, 0.12),
      roughness: 0.88,
      metalness: 0,
      emissive: color,
      emissiveIntensity: 0.12,
    });
    const detailMat = new THREE.MeshStandardMaterial({
      color: 0x2a2218,
      roughness: 0.92,
      metalness: 0.08,
    });
    const wheelMat = new THREE.MeshStandardMaterial({
      color: 0x141414,
      roughness: 0.95,
      metalness: 0.05,
    });
    this.materials = [bodyMat, wingMat];

    const group = new THREE.Group();
    group.matrixAutoUpdate = false;

    const fuselage = new THREE.Mesh(new THREE.CapsuleGeometry(0.4, 2.0, 5, 10), bodyMat);
    fuselage.rotation.x = Math.PI / 2;
    fuselage.position.set(0, 0.04, -0.2);
    group.add(fuselage);

    const cowl = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.44, 0.48, 10), bodyMat);
    cowl.rotation.x = Math.PI / 2;
    cowl.position.set(0, 0.04, 1.12);
    group.add(cowl);

    const cockpit = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.32, 0.52), bodyMat);
    cockpit.position.set(0, 0.26, 0.02);
    group.add(cockpit);

    const wingGeo = new THREE.BoxGeometry(5.8, 0.06, 0.82);
    const lowerWing = new THREE.Mesh(wingGeo, wingMat);
    lowerWing.position.set(0, -0.06, 0.08);
    group.add(lowerWing);

    const upperWing = new THREE.Mesh(wingGeo, wingMat);
    upperWing.position.set(0, 0.58, 0.04);
    group.add(upperWing);

    const strutGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.66, 4);
    for (const x of [-1.65, 1.65]) {
      const strut = new THREE.Mesh(strutGeo, detailMat);
      strut.position.set(x, 0.26, 0.12);
      group.add(strut);
    }

    const propeller = new THREE.Group();
    propeller.position.set(0, 0.04, 1.42);
    const bladeGeo = new THREE.BoxGeometry(0.1, 1.7, 0.05);
    const bladeA = new THREE.Mesh(bladeGeo, detailMat);
    const bladeB = new THREE.Mesh(bladeGeo, detailMat);
    bladeB.rotation.z = Math.PI / 2;
    propeller.add(bladeA, bladeB);
    group.add(propeller);
    this.propeller = propeller;

    const hStab = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.05, 0.52), wingMat);
    hStab.position.set(0, 0.1, -1.32);
    group.add(hStab);

    const vFin = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.62, 0.48), wingMat);
    vFin.position.set(0, 0.4, -1.35);
    group.add(vFin);

    const rudder = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.42, 0.26), wingMat);
    rudder.position.set(0, 0.36, -1.58);
    group.add(rudder);

    const wheelGeo = new THREE.TorusGeometry(0.2, 0.055, 6, 10);
    const legGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.32, 4);
    for (const x of [-0.52, 0.52]) {
      const leg = new THREE.Mesh(legGeo, detailMat);
      leg.position.set(x, -0.2, 0.32);
      group.add(leg);
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.y = Math.PI / 2;
      wheel.position.set(x, -0.4, 0.32);
      group.add(wheel);
    }

    const skid = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.22, 4), detailMat);
    skid.rotation.x = Math.PI / 2;
    skid.position.set(0, -0.26, -1.52);
    group.add(skid);

    group.traverse((o) => {
      o.userData.aircraft = this;
    });
    this.group = group;

    const v = new YUKA.Vehicle();
    const speedProfile = createAircraftSpeedProfile(THREE.MathUtils.randFloat.bind(THREE.MathUtils));
    this.cruiseSpeed = speedProfile.cruiseSpeed;
    this.minSpeed = speedProfile.minSpeed;
    v.maxSpeed = this.cruiseSpeed;
    v.maxForce = speedProfile.maxForce;
    v.mass = 1;
    v.boundingRadius = 3.5;
    v.updateNeighborhood = true;
    v.neighborhoodRadius = 28;
    v.smoother = new YUKA.Smoother(18);

    v.position.set(
      THREE.MathUtils.randFloatSpread(160),
      THREE.MathUtils.randFloatSpread(120),
      THREE.MathUtils.randFloatSpread(160),
    );
    v.velocity
      .set(
        THREE.MathUtils.randFloatSpread(2),
        THREE.MathUtils.randFloatSpread(0.6),
        THREE.MathUtils.randFloatSpread(2),
      )
      .normalize()
      .multiplyScalar(speedProfile.startSpeed);

    const wander = new YUKA.WanderBehavior();
    wander.radius = 6;
    wander.distance = 12;
    wander.jitter = 4;
    wander.weight = 0.5;

    const separation = new YUKA.SeparationBehavior();
    separation.weight = 2;

    const alignment = new YUKA.AlignmentBehavior();
    alignment.weight = 0.15;

    const cohesion = new YUKA.CohesionBehavior();
    cohesion.weight = 0.12;

    const containment = new ContainmentBehavior();
    containment.weight = 3;

    const altitude = new AltitudeWanderBehavior();
    altitude.weight = 1;

    for (const b of [wander, separation, alignment, cohesion, containment, altitude]) {
      v.steering.add(b);
    }

    v.setRenderComponent(group, (entity, component) => {
      syncEntity(entity, component as THREE.Group);
    });
    this.vehicle = v;

    const positions = new Float32Array(TRAIL_LENGTH * 3);
    for (let i = 0; i < TRAIL_LENGTH; i++) {
      positions[i * 3] = v.position.x;
      positions[i * 3 + 1] = v.position.y;
      positions[i * 3 + 2] = v.position.z;
    }
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.trail = new THREE.Line(
      trailGeo,
      new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.3 }),
    );
    this.trail.frustumCulled = false;
  }

  updateTrail(): void {
    const attr = this.trail.geometry.attributes.position as THREE.BufferAttribute;
    attr.array.copyWithin(0, 3);
    const last = (TRAIL_LENGTH - 1) * 3;
    attr.array[last] = this.vehicle.position.x;
    attr.array[last + 1] = this.vehicle.position.y;
    attr.array[last + 2] = this.vehicle.position.z;
    attr.needsUpdate = true;
  }

  setHighlighted(on: boolean): void {
    const intensity = on ? 0.55 : 0.12;
    for (const m of this.materials) m.emissiveIntensity = intensity;
  }
}
