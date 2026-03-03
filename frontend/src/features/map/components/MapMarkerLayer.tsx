import { AlertCircle, LogOut, Lock, Box } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { getExtractColor, QUEST_STATUS_COLORS } from '../constants/markerConfig';
import type { QuestStatus } from '../constants/markerConfig';
import { getContainerConfig } from '../constants/containerConfig';
import type { QuestMapMarker, MapExtractMarker, MapLockMarker, MapLootContainerMarker } from '../../../types/map';
import type { PopupData } from './MapMarkerPopup';

interface MapBounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface Props {
  mapBounds: MapBounds;
  questMarkers: QuestMapMarker[];
  extractMarkers: MapExtractMarker[];
  lockMarkers: MapLockMarker[];
  lootContainerMarkers: MapLootContainerMarker[];
  ownedKeys: Set<string>;
  getFloorDistance: (floorId: string | null) => number;
  isCompleted: (questId: number) => boolean;
  getQuestStatus: (questId: number) => QuestStatus;
  onMarkerClick: (popup: PopupData, e: React.MouseEvent) => void;
  activePopup: PopupData | null;
}

export default function MapMarkerLayer({
  mapBounds,
  questMarkers,
  extractMarkers,
  lockMarkers,
  lootContainerMarkers,
  ownedKeys,
  getFloorDistance,
  isCompleted,
  getQuestStatus,
  onMarkerClick,
  activePopup,
}: Props) {
  return (
    <>
      {/* 루팅 컨테이너 마커 (가장 낮은 z-index) */}
      {lootContainerMarkers.map((marker, i) => {
        if (marker.positionX === null || marker.positionY === null) return null;
        const dist = getFloorDistance(marker.floorId);
        const ml = mapBounds.left + (marker.positionX / 100) * mapBounds.width;
        const mt = mapBounds.top + (marker.positionY / 100) * mapBounds.height;
        const config = getContainerConfig(marker.normalizedName);
        return (
          <div
            key={`loot-${i}`}
            className="absolute group cursor-pointer"
            style={{
              left: `${ml}px`,
              top: `${mt}px`,
              transform: 'translate(-50%, -50%)',
              opacity: dist === 0 ? 0.75 : dist === 1 ? 0.4 : 0.2,
              filter: dist > 0 ? `blur(${Math.min(dist, 2)}px)` : 'none',
              zIndex: dist === 0 ? 7 : 3,
              transition: 'opacity 0.3s, filter 0.3s',
            }}
            onClick={(e) => onMarkerClick({ type: 'lootContainer', data: marker }, e)}
          >
            <div
              className={cn('w-3.5 h-3.5 rounded-full flex items-center justify-center transition-transform group-hover:scale-125', config.bgColor)}
              style={{ boxShadow: `0 0 5px ${config.glowColor}` }}
            >
              <Box size={7} className="text-white" />
            </div>
            {!activePopup && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap">
                <div className="bg-bg/90 backdrop-blur-sm text-text text-[9px] px-1.5 py-0.5 rounded-lg">
                  {marker.containerName}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* 잠금 마커 */}
      {lockMarkers.map((marker, i) => {
        if (marker.positionX === null || marker.positionY === null) return null;
        const dist = getFloorDistance(marker.floorId);
        const ml = mapBounds.left + (marker.positionX / 100) * mapBounds.width;
        const mt = mapBounds.top + (marker.positionY / 100) * mapBounds.height;
        const owned = marker.keyApiId ? ownedKeys.has(marker.keyApiId) : false;
        return (
          <div
            key={`lock-${i}`}
            className="absolute group cursor-pointer"
            style={{
              left: `${ml}px`,
              top: `${mt}px`,
              transform: 'translate(-50%, -50%)',
              opacity: dist === 0 ? 0.75 : dist === 1 ? 0.4 : 0.2,
              filter: dist > 0 ? `blur(${Math.min(dist, 2)}px)` : 'none',
              zIndex: dist === 0 ? 8 : 4,
              transition: 'opacity 0.3s, filter 0.3s',
            }}
            onClick={(e) => onMarkerClick({ type: 'lock', data: marker, isOwned: owned }, e)}
          >
            <div
              className={cn(
                'w-4 h-4 rounded-full flex items-center justify-center transition-transform group-hover:scale-125',
                owned ? 'bg-complete' : 'bg-red-500',
              )}
              style={{ boxShadow: owned ? '0 0 6px rgba(78,204,163,0.5)' : '0 0 6px rgba(239,68,68,0.5)' }}
            >
              <Lock size={8} className="text-white" />
            </div>
            {!activePopup && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap">
                <div className={cn(
                  'backdrop-blur-sm text-[9px] px-1.5 py-0.5 rounded-lg',
                  owned ? 'bg-complete/20 text-complete' : 'bg-bg/90 text-text',
                )}>
                  {owned && '✓ '}{marker.keyShortName ?? '잠금'}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* 탈출구 마커 */}
      {extractMarkers.map((marker, i) => {
        if (marker.positionX === null || marker.positionY === null) return null;
        const dist = getFloorDistance(marker.floorId);
        const ml = mapBounds.left + (marker.positionX / 100) * mapBounds.width;
        const mt = mapBounds.top + (marker.positionY / 100) * mapBounds.height;
        const { bg, glow } = getExtractColor(marker.faction);
        return (
          <div
            key={`extract-${i}`}
            className="absolute group cursor-pointer"
            style={{
              left: `${ml}px`,
              top: `${mt}px`,
              transform: 'translate(-50%, -50%)',
              opacity: dist === 0 ? 0.75 : dist === 1 ? 0.4 : 0.2,
              filter: dist > 0 ? `blur(${Math.min(dist, 2)}px)` : 'none',
              zIndex: dist === 0 ? 9 : 4,
              transition: 'opacity 0.3s, filter 0.3s',
            }}
            onClick={(e) => onMarkerClick({ type: 'extract', data: marker }, e)}
          >
            <div
              className={cn('w-5 h-5 rounded-full flex items-center justify-center transition-transform group-hover:scale-125', bg)}
              style={{ boxShadow: `0 0 8px ${glow}` }}
            >
              <LogOut size={10} className="text-white" />
            </div>
            {!activePopup && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap">
                <div className="bg-bg/90 backdrop-blur-sm text-text text-[10px] px-2 py-1 rounded-lg">
                  {marker.name}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* 퀘스트 마커 (가장 위) */}
      {questMarkers.map((marker) => {
        const dist = getFloorDistance(marker.floorId);
        const ml = mapBounds.left + (marker.positionX! / 100) * mapBounds.width;
        const mt = mapBounds.top + (marker.positionY! / 100) * mapBounds.height;
        const status = getQuestStatus(marker.questId);
        const statusColor = QUEST_STATUS_COLORS[status];
        return (
          <div
            key={`quest-${marker.objectiveId}`}
            className="absolute group cursor-pointer"
            style={{
              left: `${ml}px`,
              top: `${mt}px`,
              transform: 'translate(-50%, -50%)',
              opacity: dist === 0 ? 0.75 : dist === 1 ? 0.4 : 0.2,
              filter: dist > 0 ? `blur(${Math.min(dist, 2)}px)` : 'none',
              zIndex: dist === 0 ? 10 : 5,
              transition: 'opacity 0.3s, filter 0.3s',
            }}
            onClick={(e) => onMarkerClick({ type: 'quest', data: marker, questStatus: status }, e)}
          >
            <div
              className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center transition-transform group-hover:scale-125',
                statusColor.bg
              )}
              style={{ boxShadow: `0 0 8px ${statusColor.glow}` }}
            >
              <AlertCircle size={10} className="text-bg" />
            </div>
            {!activePopup && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap">
                <div className="bg-bg/90 backdrop-blur-sm text-text text-[10px] px-2 py-1 rounded-lg">
                  {marker.questName}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
