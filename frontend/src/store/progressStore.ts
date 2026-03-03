import { create } from 'zustand';
import { progressApi } from '../api/progressApi';
import type {
  UserProgressResponse,
  ProgressSummaryResponse,
  QuestStatus,
} from '../types/progress';

export type ProgressLoadingState = 'idle' | 'loading' | 'loaded' | 'error';

interface ProgressStore {
  questStatuses: Record<string, QuestStatus>;
  itemCounts: Record<string, number>;
  summary: ProgressSummaryResponse | null;
  loadingState: ProgressLoadingState;
  error: string | null;

  fetchProgress: () => Promise<void>;
  fetchSummary: () => Promise<void>;
  updateQuestStatus: (questId: number, status: QuestStatus) => Promise<void>;
  updateItemCount: (objectiveId: number, count: number) => Promise<void>;
  /** 다중 아이템 목표: 아이템별 복합 키 업데이트 + 백엔드 총합 동기화 */
  updateIndividualItemCount: (
    objectiveId: number,
    updates: Record<string, number>,
    total: number
  ) => Promise<void>;
  resetProgress: () => Promise<void>;
  clear: () => void;
}

export const useProgressStore = create<ProgressStore>((set) => ({
  questStatuses: {},
  itemCounts: {},
  summary: null,
  loadingState: 'idle',
  error: null,

  fetchProgress: async () => {
    set({ loadingState: 'loading', error: null });
    try {
      const data: UserProgressResponse = await progressApi.getUserProgress();
      set({
        questStatuses: data.questStatuses as Record<string, QuestStatus>,
        itemCounts: data.itemCollectedCounts,
        loadingState: 'loaded',
      });
    } catch {
      // 미로그인 상태이면 빈 상태로 loaded 처리
      set({ loadingState: 'loaded' });
    }
  },

  fetchSummary: async () => {
    try {
      const summary = await progressApi.getSummary();
      set({ summary });
    } catch {
      // 미로그인 시 무시
    }
  },

  updateQuestStatus: async (questId, status) => {
    await progressApi.updateQuestStatus(questId, status);
    set((s) => ({
      questStatuses: { ...s.questStatuses, [String(questId)]: status },
    }));
  },

  updateItemCount: async (objectiveId, count) => {
    await progressApi.updateItemCount(objectiveId, count);
    set((s) => ({
      itemCounts: { ...s.itemCounts, [String(objectiveId)]: count },
    }));
  },

  updateIndividualItemCount: async (objectiveId, updates, total) => {
    await progressApi.updateItemCount(objectiveId, total);
    set((s) => ({
      itemCounts: { ...s.itemCounts, ...updates, [String(objectiveId)]: total },
    }));
  },

  resetProgress: async () => {
    await progressApi.resetProgress();
    set({ questStatuses: {}, itemCounts: {}, summary: null });
  },

  clear: () => set({ questStatuses: {}, itemCounts: {}, summary: null, loadingState: 'idle', error: null }),
}));
