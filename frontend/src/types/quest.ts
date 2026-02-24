export interface TraderRef {
  id: number;
  name: string;
  imageUrl: string | null;
}

export interface MapRef {
  id: number;
  name: string;
  normalizedName: string;
}

export interface ItemRef {
  id: number;
  name: string;
  shortName: string | null;
  iconUrl: string | null;
}

export interface RequiredItem {
  item: ItemRef;
  count: number;
  foundInRaid: boolean;
}

export interface QuestObjectiveDto {
  id: number;
  type: string;
  description: string;
  mapName: string | null;
  floorId: string | null;
  positionX: number | null;
  positionY: number | null;
  optional: boolean;
  requiredItems: RequiredItem[];
  userCollectedCount?: number;
}

export interface PrerequisiteDto {
  id: number;
  name: string;
  status?: string;
}

export interface QuestListItem {
  id: number;
  name: string;
  trader: TraderRef;
  mapName: string | null;
  kappaRequired: boolean;
  minPlayerLevel: number;
  objectiveCount: number;
  requiredItemCount: number;
  userStatus?: string;
}

export interface QuestDetail {
  id: number;
  name: string;
  trader: TraderRef;
  map: MapRef | null;
  kappaRequired: boolean;
  minPlayerLevel: number;
  wikiLink: string | null;
  taskImageLink: string | null;
  experience: number;
  objectives: QuestObjectiveDto[];
  prerequisites: PrerequisiteDto[];
  userStatus?: string;
}
