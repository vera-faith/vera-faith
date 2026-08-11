/**
 * The hero safe zone is the volume the record-cover stack occupies.
 * Every environment placement must sit outside it so ambient objects never
 * compete with the covers for attention.
 */
export const HERO_SAFE_ZONE = {
  x: 2.4,
  yMin: -1.1,
  yMax: 1.7,
  zNear: -2.2,
} as const;

export function isInsideHeroSafeZone(x: number, y: number, z: number) {
  return (
    Math.abs(x) < HERO_SAFE_ZONE.x &&
    y > HERO_SAFE_ZONE.yMin &&
    y < HERO_SAFE_ZONE.yMax &&
    z > HERO_SAFE_ZONE.zNear
  );
}
