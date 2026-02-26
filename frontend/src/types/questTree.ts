export interface QuestTreeNode {
  id: number;
  name: string;
  traderName: string | null;
  traderImageUrl: string | null;
  mapName: string | null;
  minPlayerLevel: number;
  kappaRequired: boolean;
  lightkeeperRequired: boolean;
}

export interface QuestTreeEdge {
  source: number;
  target: number;
}

export interface QuestTreeResponse {
  nodes: QuestTreeNode[];
  edges: QuestTreeEdge[];
}
