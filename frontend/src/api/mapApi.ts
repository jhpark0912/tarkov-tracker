import axiosInstance from './axiosInstance';
import type { MapListItem, MapDetail, QuestMapMarker, MapPositionData } from '../types/map';

export const mapApi = {
  getMapList: () =>
    axiosInstance.get<MapListItem[]>('/maps').then((r) => r.data),

  getMapDetail: (normalizedName: string) =>
    axiosInstance.get<MapDetail>(`/maps/${normalizedName}`).then((r) => r.data),

  getMapMarkers: (mapId: number, floor?: string) =>
    axiosInstance
      .get<QuestMapMarker[]>(`/quests/map/${mapId}`, {
        params: floor ? { floor } : undefined,
      })
      .then((r) => r.data),

  getMapPositions: (normalizedName: string) =>
    axiosInstance.get<MapPositionData>(`/maps/${normalizedName}/positions`).then((r) => r.data),
};
