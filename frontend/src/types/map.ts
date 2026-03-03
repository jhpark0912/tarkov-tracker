export interface MapFloorInfo {
  floorId: string;
  floorLabel: string;
  floorOrder: number;
  floorImage: string | null;
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

export interface MapExtractMarker {
  name: string;
  faction: string | null;
  floorId: string | null;
  positionX: number | null;
  positionY: number | null;
}

export interface MapLockMarker {
  lockType: string | null;
  needsPower: boolean | null;
  keyApiId: string | null;
  keyName: string | null;
  keyShortName: string | null;
  keyIconUrl: string | null;
  floorId: string | null;
  positionX: number | null;
  positionY: number | null;
}

export interface MapLootContainerMarker {
  containerName: string;
  normalizedName: string;
  floorId: string | null;
  positionX: number | null;
  positionY: number | null;
}

export interface MapPositionData {
  extracts: MapExtractMarker[];
  locks: MapLockMarker[];
  lootContainers: MapLootContainerMarker[];
}

export type MarkerCategory = 'quests' | 'extracts' | 'locks' | 'lootContainers' | 'customMarkers';
