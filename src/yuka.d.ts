declare module 'yuka' {
  export class Vector3 {
    x: number;
    y: number;
    z: number;
    set(x: number, y: number, z: number): this;
    normalize(): this;
    multiplyScalar(s: number): this;
    [key: string]: number;
  }

  export class Entity {
    position: Vector3;
    worldMatrix: { elements: number[] };
  }

  export class Vehicle extends Entity {
    velocity: Vector3;
    maxSpeed: number;
    maxForce: number;
    mass: number;
    boundingRadius: number;
    updateNeighborhood: boolean;
    neighborhoodRadius: number;
    smoother: Smoother;
    steering: SteeringManager;
    setRenderComponent(
      component: unknown,
      callback: (entity: Entity, component: unknown) => void,
    ): void;
    getSpeed(): number;
  }

  export class EntityManager {
    add(entity: Entity): void;
    update(delta: number): void;
  }

  export class Time {
    update(): { getDelta(): number };
  }

  export class Smoother {
    constructor(count: number);
  }

  export class SteeringManager {
    add(behavior: SteeringBehavior): void;
  }

  export class SteeringBehavior {
    weight: number;
    calculate(vehicle: Vehicle, force: Vector3, delta?: number): Vector3;
  }

  export class WanderBehavior extends SteeringBehavior {
    radius: number;
    distance: number;
    jitter: number;
  }

  export class SeparationBehavior extends SteeringBehavior {}
  export class AlignmentBehavior extends SteeringBehavior {}
  export class CohesionBehavior extends SteeringBehavior {}
}
