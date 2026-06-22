export interface AircraftSpeedProfile {
  cruiseSpeed: number;
  minSpeed: number;
  maxForce: number;
  startSpeed: number;
}

/** Roll per-aircraft cruise speed, force, and starting velocity magnitude. */
export function createAircraftSpeedProfile(
  randFloat: (min: number, max: number) => number,
): AircraftSpeedProfile {
  const cruiseSpeed = randFloat(8, 18);
  const minSpeed = cruiseSpeed * 0.45;
  return {
    cruiseSpeed,
    minSpeed,
    maxForce: randFloat(60, 100),
    startSpeed: randFloat(minSpeed, cruiseSpeed),
  };
}
