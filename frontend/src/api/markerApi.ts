import axiosInstance from './axiosInstance';
import type { UserMapMarker, MarkerCreateRequest, MarkerUpdateRequest } from '../types/marker';

export const markerApi = {
  getMarkers: (mapId: number) =>
    axiosInstance.get<UserMapMarker[]>('/markers', { params: { mapId } }).then((r) => r.data),

  createMarker: (request: MarkerCreateRequest) =>
    axiosInstance.post<UserMapMarker>('/markers', request).then((r) => r.data),

  updateMarker: (markerId: number, request: MarkerUpdateRequest) =>
    axiosInstance.put<UserMapMarker>(`/markers/${markerId}`, request).then((r) => r.data),

  deleteMarker: (markerId: number) =>
    axiosInstance.delete(`/markers/${markerId}`),
};
