/**
 * 타르코프 게임 내 좌표(X, Y, Z)를 맵 SVG/PNG 퍼센트 좌표로 변환.
 * 백엔드 CoordinateConverter.java의 TypeScript 포팅.
 */

export interface MapBoundsConfig {
  bounds: number[][];          // [[x1, z1], [x2, z2]]
  coordinateRotation: number;  // 0, 90, 180, 270
  floorRanges?: FloorRange[];
  defaultFloor: string;
}

export interface FloorRange {
  floorId: string;
  yMin: number;
  yMax: number;
}

export interface ConvertedPosition {
  positionX: number; // 0~100%
  positionY: number; // 0~100%
  floorId: string;
}

export function convertGameCoords(
  gameX: number,
  gameY: number,
  gameZ: number,
  config: MapBoundsConfig,
): ConvertedPosition | null {
  const { bounds, coordinateRotation, floorRanges, defaultFloor } = config;

  if (!bounds || bounds.length < 2) return null;

  const [x1, z1] = bounds[0];
  const [x2, z2] = bounds[1];

  const dx = x1 - x2;
  const dz = z2 - z1;

  if (Math.abs(dx) < 0.001 || Math.abs(dz) < 0.001) return null;

  let leftPercent: number;
  let topPercent: number;

  switch (coordinateRotation) {
    case 90:
      // Factory
      leftPercent = ((z1 - gameZ) / (z1 - z2)) * 100;
      topPercent = ((gameX - x1) / (x2 - x1)) * 100;
      break;
    case 270:
      // The Lab
      leftPercent = ((gameZ - z1) / dz) * 100;
      topPercent = ((gameX - x2) / (x1 - x2)) * 100;
      break;
    case 0:
      leftPercent = ((gameX - x2) / (x1 - x2)) * 100;
      topPercent = ((z1 - gameZ) / (z1 - z2)) * 100;
      break;
    default: // 180
      leftPercent = ((x1 - gameX) / dx) * 100;
      topPercent = ((gameZ - z1) / dz) * 100;
      break;
  }

  leftPercent = Math.max(0, Math.min(100, leftPercent));
  topPercent = Math.max(0, Math.min(100, topPercent));

  const floorId = detectFloor(gameY, floorRanges, defaultFloor);

  return { positionX: leftPercent, positionY: topPercent, floorId };
}

function detectFloor(
  gameY: number,
  floorRanges: FloorRange[] | undefined,
  defaultFloor: string,
): string {
  if (!floorRanges || floorRanges.length === 0) return defaultFloor;
  for (const range of floorRanges) {
    if (gameY >= range.yMin && gameY < range.yMax) {
      return range.floorId;
    }
  }
  return defaultFloor;
}
