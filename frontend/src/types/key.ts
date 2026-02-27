export interface KeyListItem {
  apiId: string;
  name: string;
  shortName: string | null;
  iconUrl: string | null;
  doorCount: number;
  questCount: number;
  mapNames: string[];
}

export interface KeyDoor {
  lockId: number;
  lockType: string | null;
  needsPower: boolean | null;
  mapName: string;
  mapNormalizedName: string;
  floorId: string | null;
  positionX: number | null;
  positionY: number | null;
}

export interface KeyQuest {
  questId: number;
  questName: string;
  traderName: string | null;
}

export interface KeyDetail {
  apiId: string;
  name: string;
  shortName: string | null;
  iconUrl: string | null;
  wikiLink: string | null;
  doors: KeyDoor[];
  quests: KeyQuest[];
}

export interface KeyProgressItem {
  itemApiId: string;
  owned: boolean;
  updatedAt: string;
}
