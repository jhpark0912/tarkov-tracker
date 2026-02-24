export interface MapFloorInfo {
  floorId: string;
  floorLabel: string;
  floorOrder: number;
}

export interface MapListItem {
  id: number;
  name: string;
  normalizedName: string;
  svgFile: string | null;
  defaultFloor: string | null;
}

export interface MapDetail extends MapListItem {
  coordinateRotation: number;
  floors: MapFloorInfo[];
}

export interface MarkerItemDto {
  itemName: string;
  iconUrl: string | null;
  count: number;
  foundInRaid: boolean;
}

export interface QuestMapMarker {
  questId: number;
  questName: string;
  objectiveId: number;
  objectiveDescription: string;
  objectiveType: string;
  traderName: string | null;
  floorId: string | null;
  positionX: number | null;
  positionY: number | null;
  kappaRequired: boolean;
  requiredItems: MarkerItemDto[];
}
