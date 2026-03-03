import { useState, useCallback } from 'react';
import { useMapStore } from '../../../store/mapStore';
import type { MapDetail } from '../../../types/map';
import type { UserMapMarker, CustomMarkerType } from '../../../types/marker';
import type { PopupData } from '../components/MapMarkerPopup';

interface UseCustomMarkersParams {
  currentMap: MapDetail | null;
  selectedFloor: string | null;
  mapBounds: { left: number; top: number; width: number; height: number } | null;
  pan: { x: number; y: number };
  zoom: number;
  token: string | null;
  dragRef: React.RefObject<{ moved: boolean }>;
  setPopup: (popup: PopupData | null) => void;
}

export function useCustomMarkers({
  currentMap, selectedFloor, mapBounds, pan, zoom, token, dragRef, setPopup,
}: UseCustomMarkersParams) {
  const { addCustomMarker, updateCustomMarker, deleteCustomMarker } = useMapStore();
  const [createModalPos, setCreateModalPos] = useState<{ screen: { x: number; y: number }; map: { x: number; y: number } } | null>(null);
  const [activeCustomMarkerId, setActiveCustomMarkerId] = useState<number | null>(null);
  const [editingMarker, setEditingMarker] = useState<UserMapMarker | null>(null);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (!token || !mapBounds) return;
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const containerX = e.clientX - rect.left;
    const containerY = e.clientY - rect.top;
    const wx = (containerX - pan.x) / zoom;
    const wy = (containerY - pan.y) / zoom;
    const posX = ((wx - mapBounds.left) / mapBounds.width) * 100;
    const posY = ((wy - mapBounds.top) / mapBounds.height) * 100;
    if (posX < 0 || posX > 100 || posY < 0 || posY > 100) return;
    setCreateModalPos({ screen: { x: containerX, y: containerY }, map: { x: posX, y: posY } });
  }, [token, mapBounds, pan, zoom]);

  const handleCreateMarkerSave = useCallback(async (data: { title: string; type: CustomMarkerType; description?: string; color?: string }) => {
    if (!createModalPos || !currentMap) return;
    try {
      await addCustomMarker({
        mapId: currentMap.id,
        floorId: selectedFloor,
        positionX: createModalPos.map.x,
        positionY: createModalPos.map.y,
        title: data.title,
        description: data.description,
        type: data.type,
        color: data.color,
      });
      setCreateModalPos(null);
    } catch {
      // markerError는 store에서 처리
    }
  }, [createModalPos, currentMap, selectedFloor, addCustomMarker]);

  const handleCustomMarkerClick = useCallback((marker: UserMapMarker, e: React.MouseEvent) => {
    e.stopPropagation();
    if (dragRef.current?.moved) return;
    setActiveCustomMarkerId((prev) => prev === marker.id ? null : marker.id);
    setPopup({ type: 'custom', data: marker });
  }, [dragRef, setPopup]);

  const handleCustomMarkerDelete = useCallback(async (markerId: number) => {
    try {
      await deleteCustomMarker(markerId);
    } catch {
      // markerError는 store에서 처리
    }
    setActiveCustomMarkerId(null);
    setPopup(null);
  }, [deleteCustomMarker, setPopup]);

  const handleCustomMarkerEdit = useCallback((marker: UserMapMarker) => {
    setEditingMarker(marker);
    setPopup(null);
  }, [setPopup]);

  const handleCustomMarkerUpdate = useCallback(async (markerId: number, data: { title: string; type: CustomMarkerType; description?: string | null; color?: string | null }) => {
    try {
      await updateCustomMarker(markerId, {
        title: data.title,
        type: data.type,
        description: data.description ?? undefined,
        color: data.color ?? undefined,
      });
      setEditingMarker(null);
    } catch {
      // markerError는 store에서 처리
    }
  }, [updateCustomMarker]);

  return {
    createModalPos,
    setCreateModalPos,
    activeCustomMarkerId,
    setActiveCustomMarkerId,
    editingMarker,
    setEditingMarker,
    handleContextMenu,
    handleCreateMarkerSave,
    handleCustomMarkerClick,
    handleCustomMarkerDelete,
    handleCustomMarkerEdit,
    handleCustomMarkerUpdate,
  };
}
