export type QuestStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface UserProgressResponse {
  questStatuses: Record<string, QuestStatus>;
  itemCollectedCounts: Record<string, number>;
}

export interface ProgressSummaryResponse {
  totalQuests: number;
  completedQuests: number;
  totalProgressPercent: number;
  kappaQuests: { total: number; completed: number; percent: number };
  byTrader: Array<{ traderName: string; total: number; completed: number; percent: number }>;
  byMap: Array<{ mapName: string; total: number; completed: number; percent: number }>;
}

export interface QuestProgressResponse {
  questId: number;
  questName: string;
  status: QuestStatus;
  updatedAt: string;
}

export interface ItemProgressResponse {
  objectiveId: number;
  questId: number;
  collectedCount: number;
  updatedAt: string;
}
