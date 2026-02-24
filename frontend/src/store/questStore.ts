import { create } from 'zustand';
import { questApi } from '../api/questApi';
import type { QuestListItem, QuestDetail } from '../types/quest';

interface QuestFilters {
  search: string;
  trader: string;
  map: string;
  kappaOnly: boolean;
}

interface QuestStore {
  quests: QuestListItem[];
  currentDetail: QuestDetail | null;
  filters: QuestFilters;
  loading: boolean;
  error: string | null;

  fetchList: (params?: { trader?: string; kappa?: boolean; map?: string }) => Promise<void>;
  fetchDetail: (id: number) => Promise<void>;
  setFilters: (filters: Partial<QuestFilters>) => void;
  clearDetail: () => void;
}

export const useQuestStore = create<QuestStore>((set) => ({
  quests: [],
  currentDetail: null,
  filters: { search: '', trader: '', map: '', kappaOnly: false },
  loading: false,
  error: null,

  fetchList: async (params) => {
    set({ loading: true, error: null });
    try {
      const quests = await questApi.getList(params);
      set({ quests, loading: false });
    } catch {
      set({ error: '퀘스트 목록을 불러오는데 실패했습니다.', loading: false });
    }
  },

  fetchDetail: async (id) => {
    set({ loading: true, error: null });
    try {
      const detail = await questApi.getDetail(id);
      set({ currentDetail: detail, loading: false });
    } catch {
      set({ error: '퀘스트 상세를 불러오는데 실패했습니다.', loading: false });
    }
  },

  setFilters: (filters) =>
    set((s) => ({ filters: { ...s.filters, ...filters } })),

  clearDetail: () => set({ currentDetail: null }),
}));
