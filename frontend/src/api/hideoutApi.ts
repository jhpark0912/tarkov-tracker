import axiosInstance from './axiosInstance';
import type {
  HideoutStationListItem,
  HideoutStationDetail,
  HideoutProgressResponse,
} from '../types/hideout';

export const hideoutApi = {
  getStations: () =>
    axiosInstance.get<HideoutStationListItem[]>('/hideout/stations').then((r) => r.data),

  getStationDetail: (apiId: string) =>
    axiosInstance.get<HideoutStationDetail>(`/hideout/stations/${encodeURIComponent(apiId)}`).then((r) => r.data),

  getProgress: () =>
    axiosInstance.get<HideoutProgressResponse>('/hideout/progress').then((r) => r.data),

  updateStationLevel: (apiId: string, level: number) =>
    axiosInstance.put(`/hideout/progress/station/${encodeURIComponent(apiId)}`, { level }).then((r) => r.data),

  updateItemProgress: (reqId: number, collectedCount: number) =>
    axiosInstance.put(`/hideout/progress/item/${reqId}`, { collectedCount }).then((r) => r.data),
};
