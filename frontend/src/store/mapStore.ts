import { create } from 'zustand';
import { mapApi } from '../api/mapApi';
import type { MapListItem, MapDetail, QuestMapMarker } from '../types/map';

interface MapStore {
  maps: MapListItem[];
  currentMap: MapDetail | null;
  markers: QuestMapMarker[];
  loading: boolean;
  error: string | null;

  fetchMaps: () => Promise<void>;
  fetchMapDetail: (normalizedName: string) => Promise<void>;
  fetchMarkers: (mapId: number, floor?: string) => Promise<void>;
  clearCurrentMap: () => void;
}

export const useMapStore = create<MapStore>((set) => ({
  maps: [],
  currentMap: null,
  markers: [],
  loading: false,
  error: null,

  fetchMaps: async () => {
    set({ loading: true, error: null });
    try {
      const maps = await mapApi.getMapList();
      set({ maps, loading: false });
    } catch {
      set({ error: '맵 목록을 불러오지 못했습니다.', loading: false });
    }
  },

  fetchMapDetail: async (normalizedName) => {
    set({ loading: true, error: null, currentMap: null, markers: [] });
    try {
      const currentMap = await mapApi.getMapDetail(normalizedName);
      set({ currentMap, loading: false });
    } catch {
      set({ error: '맵 정보를 불러오지 못했습니다.', loading: false });
    }
  },

  fetchMarkers: async (mapId, floor) => {
    try {
      const markers = await mapApi.getMapMarkers(mapId, floor);
      set({ markers });
    } catch {
      set({ markers: [] });
    }
  },

  clearCurrentMap: () => set({ currentMap: null, markers: [], error: null }),
}));
