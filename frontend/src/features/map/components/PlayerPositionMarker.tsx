import { useState } from 'react';
import { Crosshair } from 'lucide-react';
import { convertGameCoords, type MapBoundsConfig } from '../../../utils/coordinateConverter';
import type { PlayerPosition } from '../../../hooks/useTauriScreenshot';

interface MapBounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface PlayerPositionMarkerProps {
  position: PlayerPosition | null;
  history: PlayerPosition[];
  mapBounds: MapBounds;
  zoom: number;
  mapConfig: MapBoundsConfig | null;
  selectedFloor: string | null;
}

export default function PlayerPositionMarker({
  position,
  history,
  mapBounds,
  zoom,
  mapConfig,
  selectedFloor,
}: PlayerPositionMarkerProps) {
  const [showTrail, setShowTrail] = useState(false);

  if (!position || !mapConfig) return null;

  const converted = convertGameCoords(position.x, position.y, position.z, mapConfig);
  if (!converted) return null;

  // 다른 층이면 반투명 표시
  const isCurrentFloor = !selectedFloor || converted.floorId === selectedFloor;

  const ml = mapBounds.left + (converted.positionX / 100) * mapBounds.width;
  const mt = mapBounds.top + (converted.positionY / 100) * mapBounds.height;

  // 이동 경로 (trail)
  const trailPositions = showTrail
    ? history
        .slice(-20)
        .map((p) => {
          const c = convertGameCoords(p.x, p.y, p.z, mapConfig);
          if (!c) return null;
          return {
            left: mapBounds.left + (c.positionX / 100) * mapBounds.width,
            top: mapBounds.top + (c.positionY / 100) * mapBounds.height,
            floorId: c.floorId,
            timestamp: p.timestamp,
          };
        })
        .filter(Boolean) as Array<{ left: number; top: number; floorId: string; timestamp: string }>
    : [];

  return (
    <>
      {/* 이동 경로 점 */}
      {trailPositions.map((tp, i) => {
        const trailOnFloor = !selectedFloor || tp.floorId === selectedFloor;
        return (
          <div
            key={i}
            className="absolute pointer-events-none"
            style={{
              left: tp.left,
              top: tp.top,
              transform: `translate(-50%, -50%) scale(${1 / zoom})`,
              opacity: trailOnFloor ? 0.3 + (i / trailPositions.length) * 0.5 : 0.1,
            }}
          >
            <div
              className="w-2 h-2 rounded-full bg-cyan-400"
              style={{ filter: trailOnFloor ? 'none' : 'blur(1px)' }}
            />
          </div>
        );
      })}

      {/* 현재 위치 마커 */}
      <div
        className="absolute z-50 pointer-events-auto cursor-pointer group"
        style={{
          left: ml,
          top: mt,
          transform: `translate(-50%, -50%) scale(${1 / zoom})`,
          opacity: isCurrentFloor ? 1 : 0.3,
          filter: isCurrentFloor ? 'none' : 'blur(1px)',
        }}
        onClick={() => setShowTrail((prev) => !prev)}
        title={`내 위치: ${position.x.toFixed(1)}, ${position.y.toFixed(1)}, ${position.z.toFixed(1)}\n층: ${converted.floorId}\n${showTrail ? '경로 숨기기' : '경로 보기'}`}
      >
        {/* 펄스 애니메이션 링 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-cyan-400/20 animate-ping" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-cyan-400/30" />
        </div>

        {/* 중앙 아이콘 */}
        <div className="relative flex items-center justify-center w-8 h-8">
          <div className="absolute w-5 h-5 rounded-full bg-cyan-500 shadow-lg shadow-cyan-500/50" />
          <Crosshair className="relative w-5 h-5 text-white drop-shadow-lg" strokeWidth={2.5} />
        </div>

        {/* 호버 시 좌표 표시 */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-8 hidden group-hover:block whitespace-nowrap">
          <div className="bg-surface/95 border border-cyan-500/30 rounded px-2 py-0.5 text-xs text-cyan-300 shadow-lg">
            {position.x.toFixed(1)}, {position.z.toFixed(1)}
          </div>
        </div>
      </div>
    </>
  );
}
