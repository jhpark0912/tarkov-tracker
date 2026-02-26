/** 공통 노드/엣지 타입 — 스토리 + 퀘스트 트리 공유 */

/** 스토리 노드 타입 */
export type StoryNodeType = 'step' | 'decision' | 'cost' | 'timegate' | 'achievement' | 'ending';

/** 스토리 노드 데이터 */
export interface StoryNodeData {
  label: string;
  description?: string;
  type: StoryNodeType;
  /** 비용 노드 전용 */
  cost?: string;
  /** 타임게이트 노드 전용 */
  duration?: string;
  /** 업적 노드 전용 */
  achievement?: string;
  /** 엔딩 노드 전용 */
  endingId?: string;
  endingColor?: string;
  /** 진행 상태 */
  completed?: boolean;
  active?: boolean;
  /** 위키 URL */
  wikiUrl?: string;
}

/** 퀘스트 트리 노드 데이터 */
export interface QuestNodeData {
  questId: number;
  label: string;
  traderName?: string;
  traderImageUrl?: string;
  mapName?: string;
  minPlayerLevel: number;
  kappaRequired: boolean;
  lightkeeperRequired: boolean;
  status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
}
