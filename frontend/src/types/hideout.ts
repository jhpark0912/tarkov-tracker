export interface HideoutStationListItem {
  apiId: string;
  name: string;
  normalizedName: string | null;
  imageLink: string | null;
  maxLevel: number;
}

export interface HideoutItemReq {
  requirementId: number;
  itemApiId: string;
  itemName: string;
  itemShortName: string | null;
  itemIconUrl: string | null;
  count: number;
}

export interface HideoutStationReq {
  stationApiId: string;
  stationName: string;
  requiredLevel: number;
}

export interface HideoutSkillReq {
  skillName: string;
  skillLevel: number;
}

export interface HideoutTraderReq {
  traderApiId: string;
  traderName: string;
  loyaltyLevel: number;
}

export interface HideoutLevelDetail {
  id: number;
  level: number;
  constructionTime: number | null;
  description: string | null;
  itemRequirements: HideoutItemReq[];
  stationRequirements: HideoutStationReq[];
  skillRequirements: HideoutSkillReq[];
  traderRequirements: HideoutTraderReq[];
}

export interface HideoutStationDetail {
  apiId: string;
  name: string;
  normalizedName: string | null;
  imageLink: string | null;
  levels: HideoutLevelDetail[];
}

export interface HideoutProgressResponse {
  stationLevels: Record<string, number>;
  itemCollectedCounts: Record<string, number>;
}
