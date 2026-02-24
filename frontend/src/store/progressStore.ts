import { create } from 'zustand';
import { progressApi } from '../api/progressApi';
import type {
  UserProgressResponse,
  ProgressSummaryResponse,
  QuestStatus,
} from '../types/progress';

interface ProgressStore {
  questStatuses: Record<string, QuestStatus>;
  itemCounts: Record<string, number>;
  summary: ProgressSummaryResponse | null;
  loaded: boolean;

  fetchProgress: () => Promise<void>;
  fetchSummary: () => Promise<void>;
  updateQuestStatus: (questId: number, status: QuestStatus) => Promise<void>;
  updateItemCount: (objectiveId: number, count: number) => Promise<void>;
  resetProgress: () => Promise<void>;
  clear: () => void;
}

export const useProgressStore = create<ProgressStore>((set) => ({
  questStatuses: {},
  itemCounts: {},
  summary: null,
  loaded: false,

  fetchProgress: async () => {
    try {
      const data: UserProgressResponse = await progressApi.getUserProgress();
      set({
        questStatuses: data.questStatuses as Record<string, QuestStatus>,
        itemCounts: data.itemCollectedCounts,
        loaded: true,
      });
    } catch {
      // 미로그인 상태이면 빈 상태 유지
      set({ loaded: true });
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

  resetProgress: async () => {
    await progressApi.resetProgress();
    set({ questStatuses: {}, itemCounts: {}, summary: null });
  },

  clear: () => set({ questStatuses: {}, itemCounts: {}, summary: null, loaded: false }),
}));
