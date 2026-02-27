import { create } from 'zustand';
import { hideoutApi } from '../api/hideoutApi';
import type { HideoutStationListItem, HideoutStationDetail } from '../types/hideout';

interface HideoutStore {
  stations: HideoutStationListItem[];
  currentDetail: HideoutStationDetail | null;
  stationLevels: Record<string, number>;
  itemCounts: Record<string, number>;
  loading: boolean;
  error: string | null;
  fetchStations: () => Promise<void>;
  fetchDetail: (apiId: string) => Promise<void>;
  fetchProgress: () => Promise<void>;
  updateStationLevel: (apiId: string, level: number) => Promise<void>;
  updateItemProgress: (reqId: number, count: number) => Promise<void>;
  clearDetail: () => void;
}

export const useHideoutStore = create<HideoutStore>((set) => ({
  stations: [],
  currentDetail: null,
  stationLevels: {},
  itemCounts: {},
  loading: false,
  error: null,

  fetchStations: async () => {
    set({ loading: true, error: null });
    try {
      const stations = await hideoutApi.getStations();
      set({ stations, loading: false });
    } catch {
      set({ error: '은신처 목록을 불러오는데 실패했습니다.', loading: false });
    }
  },

  fetchDetail: async (apiId) => {
    set({ loading: true, error: null });
    try {
      const detail = await hideoutApi.getStationDetail(apiId);
      set({ currentDetail: detail, loading: false });
    } catch {
      set({ error: '은신처 상세를 불러오는데 실패했습니다.', loading: false });
    }
  },

  fetchProgress: async () => {
    try {
      const progress = await hideoutApi.getProgress();
      set({
        stationLevels: progress.stationLevels,
        itemCounts: progress.itemCollectedCounts,
      });
    } catch {
      // 비로그인 상태에서는 무시
    }
  },

  updateStationLevel: async (apiId, level) => {
    try {
      await hideoutApi.updateStationLevel(apiId, level);
      set((state) => ({
        stationLevels: { ...state.stationLevels, [apiId]: level },
      }));
    } catch {
      // 실패 시 무시
    }
  },

  updateItemProgress: async (reqId, count) => {
    try {
      await hideoutApi.updateItemProgress(reqId, count);
      set((state) => ({
        itemCounts: { ...state.itemCounts, [String(reqId)]: count },
      }));
    } catch {
      // 실패 시 무시
    }
  },

  clearDetail: () => set({ currentDetail: null }),
}));
