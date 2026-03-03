export function getFloorDistance(
  floorId: string | null,
  activeFloor: string | null,
  floors: { floorId: string }[]
): number {
  if (!floorId || !activeFloor) return 0;
  const a = floors.findIndex((f) => f.floorId === floorId);
  const b = floors.findIndex((f) => f.floorId === activeFloor);
  return a === -1 || b === -1 ? 0 : Math.abs(a - b);
}
