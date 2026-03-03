import { create } from 'zustand';
import { mapApi } from '../api/mapApi';
import { markerApi } from '../api/markerApi';
import type { MapListItem, MapDetail, QuestMapMarker, MapPositionData, MarkerCategory } from '../types/map';
import type { UserMapMarker, MarkerCreateRequest, MarkerUpdateRequest } from '../types/marker';

interface MarkerVisibility {
  quests: boolean;
  extracts: boolean;
  locks: boolean;
  lootContainers: boolean;
  customMarkers: boolean;
}

interface MapStore {
  maps: MapListItem[];
  currentMap: MapDetail | null;
  markers: QuestMapMarker[];
  positions: MapPositionData | null;
  customMarkers: UserMapMarker[];
  markerVisibility: MarkerVisibility;
  lootContainerFilter: Set<string>;
  loading: boolean;
  error: string | null;
  markerError: string | null;

  fetchMaps: () => Promise<void>;
  fetchMapDetail: (normalizedName: string) => Promise<void>;
  fetchMarkers: (mapId: number, floor?: string) => Promise<void>;
  fetchPositions: (normalizedName: string) => Promise<void>;
  fetchCustomMarkers: (mapId: number) => Promise<void>;
  addCustomMarker: (request: MarkerCreateRequest) => Promise<UserMapMarker>;
  updateCustomMarker: (markerId: number, request: MarkerUpdateRequest) => Promise<void>;
  deleteCustomMarker: (markerId: number) => Promise<void>;
  toggleMarkerCategory: (category: MarkerCategory) => void;
  toggleLootContainerType: (normalizedName: string) => void;
  toggleAllLootContainers: (allTypes: string[]) => void;
  clearCurrentMap: () => void;
  clearMarkerError: () => void;
}

const DEFAULT_VISIBILITY: MarkerVisibility = {
  quests: true,
  extracts: true,
  locks: true,
  lootContainers: false,
  customMarkers: true,
};

export const useMapStore = create<MapStore>((set) => ({
  maps: [],
  currentMap: null,
  markers: [],
  positions: null,
  customMarkers: [],
  markerVisibility: { ...DEFAULT_VISIBILITY },
  lootContainerFilter: new Set<string>(),
  loading: false,
  error: null,
  markerError: null,

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

  fetchPositions: async (normalizedName) => {
    try {
      const positions = await mapApi.getMapPositions(normalizedName);
      // 위치 데이터 로드 시 모든 컨테이너 타입을 필터에 추가
      const allTypes = new Set<string>();
      if (positions?.lootContainers) {
        positions.lootContainers.forEach((c) => allTypes.add(c.normalizedName));
      }
      set({ positions, lootContainerFilter: allTypes });
    } catch {
      set({ positions: null });
    }
  },

  fetchCustomMarkers: async (mapId) => {
    try {
      const customMarkers = await markerApi.getMarkers(mapId);
      set({ customMarkers });
    } catch {
      set({ customMarkers: [] });
    }
  },

  addCustomMarker: async (request) => {
    try {
      const marker = await markerApi.createMarker(request);
      set((s) => ({ customMarkers: [...s.customMarkers, marker], markerError: null }));
      return marker;
    } catch (e) {
      set({ markerError: '마커 생성에 실패했습니다.' });
      throw e;
    }
  },

  updateCustomMarker: async (markerId, request) => {
    try {
      const updated = await markerApi.updateMarker(markerId, request);
      set((s) => ({
        customMarkers: s.customMarkers.map((m) => (m.id === markerId ? updated : m)),
        markerError: null,
      }));
    } catch (e) {
      set({ markerError: '마커 수정에 실패했습니다.' });
      throw e;
    }
  },

  deleteCustomMarker: async (markerId) => {
    try {
      await markerApi.deleteMarker(markerId);
      set((s) => ({ customMarkers: s.customMarkers.filter((m) => m.id !== markerId), markerError: null }));
    } catch (e) {
      set({ markerError: '마커 삭제에 실패했습니다.' });
      throw e;
    }
  },

  toggleMarkerCategory: (category) =>
    set((state) => ({
      markerVisibility: {
        ...state.markerVisibility,
        [category]: !state.markerVisibility[category],
      },
    })),

  toggleLootContainerType: (normalizedName) =>
    set((state) => {
      const next = new Set(state.lootContainerFilter);
      if (next.has(normalizedName)) {
        next.delete(normalizedName);
      } else {
        next.add(normalizedName);
      }
      return { lootContainerFilter: next };
    }),

  toggleAllLootContainers: (allTypes) =>
    set((state) => {
      const allSelected = allTypes.every((t) => state.lootContainerFilter.has(t));
      return { lootContainerFilter: allSelected ? new Set<string>() : new Set(allTypes) };
    }),

  clearCurrentMap: () =>
    set({
      currentMap: null, markers: [], positions: null, customMarkers: [], error: null,
      markerError: null,
      markerVisibility: { ...DEFAULT_VISIBILITY },
      lootContainerFilter: new Set<string>(),
    }),

  clearMarkerError: () => set({ markerError: null }),
}));
