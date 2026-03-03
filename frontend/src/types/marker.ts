export type CustomMarkerType = 'LOCATION' | 'NOTE' | 'WAYPOINT' | 'LOOT_SPOT' | 'DANGER';

export interface UserMapMarker {
  id: number;
  mapId: number;
  floorId: string | null;
  positionX: number;
  positionY: number;
  title: string;
  description: string | null;
  type: CustomMarkerType;
  color: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MarkerCreateRequest {
  mapId: number;
  floorId: string | null;
  positionX: number;
  positionY: number;
  title: string;
  description?: string;
  type: CustomMarkerType;
  color?: string;
}

export interface MarkerUpdateRequest {
  title?: string;
  description?: string;
  type?: CustomMarkerType;
  color?: string;
}
