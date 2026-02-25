import { create } from 'zustand';
import { mapApi } from '../api/mapApi';
import type { MapListItem, MapDetail, QuestMapMarker, MapPositionData, MarkerCategory } from '../types/map';

interface MarkerVisibility {
  quests: boolean;
  extracts: boolean;
  locks: boolean;
  spawns: boolean;
}

interface MapStore {
  maps: MapListItem[];
  currentMap: MapDetail | null;
  markers: QuestMapMarker[];
  positions: MapPositionData | null;
  markerVisibility: MarkerVisibility;
  loading: boolean;
  error: string | null;

  fetchMaps: () => Promise<void>;
  fetchMapDetail: (normalizedName: string) => Promise<void>;
  fetchMarkers: (mapId: number, floor?: string) => Promise<void>;
  fetchPositions: (normalizedName: string) => Promise<void>;
  toggleMarkerCategory: (category: MarkerCategory) => void;
  clearCurrentMap: () => void;
}

const DEFAULT_VISIBILITY: MarkerVisibility = {
  quests: true,
  extracts: true,
  locks: true,
  spawns: false,
};

export const useMapStore = create<MapStore>((set) => ({
  maps: [],
  currentMap: null,
  markers: [],
  positions: null,
  markerVisibility: { ...DEFAULT_VISIBILITY },
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
    set({ loading: true, error: null, currentMap: null, markers: [], positions: null });
    try {
      const currentMap = await mapApi.getMapDetail(normalizedName);
      // Debug: floors 정보 확인
      if (currentMap?.floors?.length) {
        console.log(`[MapStore] ${normalizedName} floors:`, currentMap.floors.map(f => ({
          id: f.floorId, label: f.floorLabel, image: f.floorImage
        })));
      }
      set({ currentMap, loading: false });
    } catch {
      set({ error: '맵 정보를 불러오지 못했습니다.', loading: false });
    }
  },

  fetchMarkers: async (mapId, floor) => {
    try {
      const markers = await mapApi.getMapMarkers(mapId, floor);
      // Debug: 퀘스트 마커 floorId 분포 확인
      if (markers.length) {
        const counts: Record<string, number> = {};
        markers.forEach((m) => { const k = m.floorId ?? 'NULL'; counts[k] = (counts[k] || 0) + 1; });
        console.log(`[MapStore] mapId=${mapId} quest markers floorId 분포:`, counts);
      }
      set({ markers });
    } catch {
      set({ markers: [] });
    }
  },

  fetchPositions: async (normalizedName) => {
    try {
      const positions = await mapApi.getMapPositions(normalizedName);
      // Debug: floorId 분포 확인
      if (positions) {
        const floorCounts = (items: { floorId: string | null }[], label: string) => {
          const counts: Record<string, number> = {};
          items.forEach((m) => { const k = m.floorId ?? 'NULL'; counts[k] = (counts[k] || 0) + 1; });
          console.log(`[MapStore] ${normalizedName} ${label} floorId 분포:`, counts);
        };
        if (positions.extracts?.length) floorCounts(positions.extracts, 'extracts');
        if (positions.locks?.length) floorCounts(positions.locks, 'locks');
        if (positions.spawns?.length) floorCounts(positions.spawns, 'spawns');
      }
      set({ positions });
    } catch {
      set({ positions: null });
    }
  },

  toggleMarkerCategory: (category) =>
    set((state) => ({
      markerVisibility: {
        ...state.markerVisibility,
        [category]: !state.markerVisibility[category],
      },
    })),

  clearCurrentMap: () =>
    set({ currentMap: null, markers: [], positions: null, error: null, markerVisibility: { ...DEFAULT_VISIBILITY } }),
}));
