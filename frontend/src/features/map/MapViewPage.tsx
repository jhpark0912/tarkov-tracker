import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Eye, EyeOff, Crown, AlertCircle, ChevronLeft } from 'lucide-react';
import { cn } from '../../utils/cn';
import DebugOverlay from '../../components/debug/DebugOverlay';
import { useMapStore } from '../../store/mapStore';
import { useProgressStore } from '../../store/progressStore';
import type { QuestMapMarker } from '../../types/map';

interface MarkerPopup {
  marker: QuestMapMarker;
  x: number;
  y: number;
}

export default function MapViewPage() {
  const { normalizedName } = useParams<{ normalizedName: string }>();
  const { currentMap, markers, loading, error, fetchMapDetail, fetchMarkers, clearCurrentMap } = useMapStore();
  const { questStatuses } = useProgressStore();

  const [selectedFloor, setSelectedFloor] = useState<string | null>(null);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [kappaOnly, setKappaOnly] = useState(false);
  const [popup, setPopup] = useState<MarkerPopup | null>(null);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [svgViewBox, setSvgViewBox] = useState<{ w: number; h: number } | null>(null);
  const [containerSize, setContainerSize] = useState<{ w: number; h: number } | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<HTMLDivElement>(null);

  // dangerouslySetInnerHTML 객체를 메모이제이션 — 리렌더 시 innerHTML 재설정 방지
  const svgHtml = useMemo(
    () => (svgContent ? { __html: svgContent } : undefined),
    [svgContent]
  );

  // SVG viewBox 파싱 — 실제 종횡비 확인용
  useEffect(() => {
    if (!svgContent) { setSvgViewBox(null); return; }
    const m = svgContent.match(/viewBox="([^"]+)"/);
    if (m) {
      const parts = m[1].trim().split(/\s+/);
      if (parts.length >= 4) {
        setSvgViewBox({ w: parseFloat(parts[2]), h: parseFloat(parts[3]) });
      }
    }
  }, [svgContent]);

  // 컨테이너 크기 추적 (ResizeObserver)
  // currentMap이 설정된 후에 실행해야 mapContainerRef.current가 DOM에 존재함
  useEffect(() => {
    const el = mapContainerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setContainerSize({ w: width, h: height });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [currentMap]);

  // SVG 실제 렌더링 영역 계산 (letterbox 오프셋 포함)
  const svgBounds = useMemo(() => {
    if (!svgViewBox || !containerSize) return null;
    const scale = Math.min(containerSize.w / svgViewBox.w, containerSize.h / svgViewBox.h);
    const rW = svgViewBox.w * scale;
    const rH = svgViewBox.h * scale;
    return {
      left: (containerSize.w - rW) / 2,
      top: (containerSize.h - rH) / 2,
      width: rW,
      height: rH,
    };
  }, [svgViewBox, containerSize]);

  // 맵 상세 로딩
  useEffect(() => {
    if (!normalizedName) return;
    fetchMapDetail(normalizedName);
    return () => { clearCurrentMap(); setSvgContent(null); };
  }, [normalizedName, fetchMapDetail, clearCurrentMap]);

  // 맵 로딩 완료 후 기본 층 설정 + 마커 로딩 + SVG fetch
  useEffect(() => {
    if (!currentMap) return;
    const defaultFloor = currentMap.defaultFloor ?? currentMap.floors[0]?.floorId ?? null;
    setSelectedFloor(defaultFloor);
    fetchMarkers(currentMap.id);

    if (currentMap.svgFile) {
      fetch(`/maps/${currentMap.svgFile}`)
        .then((r) => r.text())
        .then((text) => {
          const fixed = text.replace(
            /<svg\b([^>]*?)(\s+width="[^"]*")?(\s+height="[^"]*")?([^>]*)>/,
            '<svg$1$4 preserveAspectRatio="xMidYMid meet">'
          );
          setSvgContent(fixed);
        })
        .catch(() => setSvgContent(null));
    }
  }, [currentMap, fetchMarkers]);

  // 층 가시성 토글 (SVG 그룹 style 직접 조작)
  useEffect(() => {
    if (!svgRef.current || !selectedFloor || !currentMap) return;
    const container = svgRef.current;
    const groundFloorId = currentMap.defaultFloor;
    const isGroundSelected = selectedFloor === groundFloorId;

    currentMap.floors.forEach((f) => {
      const el = container.querySelector<SVGGElement>(`#${CSS.escape(f.floorId)}`);
      if (!el) return;

      el.style.transition = 'opacity 0.4s ease, filter 0.4s ease';

      if (f.floorId === selectedFloor) {
        // 선택된 층: 완전히 표시
        el.style.display = 'inline';
        el.style.opacity = '1';
        el.style.filter = 'none';
      } else if (f.floorId === groundFloorId && !isGroundSelected) {
        // 지상(defaultFloor): 다른 층 선택 시 항상 블러 배경으로 표시
        el.style.display = 'inline';
        el.style.opacity = '0.2';
        el.style.filter = 'blur(3px)';
      } else {
        // 그 외 층: 숨김
        el.style.display = 'none';
      }
    });
  }, [selectedFloor, svgContent, currentMap]);

  const floors = currentMap?.floors ?? [];
  const floorIndex = floors.findIndex((f) => f.floorId === selectedFloor);

  const isCompleted = (questId: number) =>
    questStatuses[String(questId)] === 'COMPLETED';

  const visibleMarkers = markers.filter((m) => {
    if (m.positionX === null || m.positionY === null) return false;
    if (selectedFloor && m.floorId && m.floorId !== selectedFloor) return false;
    if (hideCompleted && isCompleted(m.questId)) return false;
    if (kappaOnly && !m.kappaRequired) return false;
    return true;
  });

  const switchFloor = useCallback((nextFloorId: string) => {
    setSelectedFloor(nextFloorId);
  }, []);

  const changeFloor = useCallback(
    (direction: 'up' | 'down') => {
      const idx = floors.findIndex((f) => f.floorId === selectedFloor);
      const nextIdx = direction === 'up' ? idx + 1 : idx - 1;
      if (nextIdx < 0 || nextIdx >= floors.length) return;
      switchFloor(floors[nextIdx].floorId);
    },
    [floors, selectedFloor, switchFloor]
  );

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;
    function handleWheel(e: WheelEvent) {
      if (!e.shiftKey) return;
      e.preventDefault();
      changeFloor(e.deltaY < 0 ? 'up' : 'down');
    }
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [changeFloor]);

  const handleMarkerClick = (marker: QuestMapMarker, e: React.MouseEvent) => {
    e.stopPropagation();
    setPopup((prev) =>
      prev?.marker.objectiveId === marker.objectiveId
        ? null
        : { marker, x: marker.positionX!, y: marker.positionY! }
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-5rem)]">
        <p className="text-text-muted text-sm">맵 데이터 로딩 중...</p>
      </div>
    );
  }

  if (error || !currentMap) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-5rem)] gap-4">
        <p className="text-incomplete text-sm">{error ?? '맵을 찾을 수 없습니다.'}</p>
        <Link to="/map" className="text-xs text-gold hover:underline">← 맵 목록으로</Link>
      </div>
    );
  }

  return (
    <DebugOverlay id="map-view-page" tag="div" label="MapViewPage" variant="feature">
      <div id="map-view-page" className="flex flex-col h-[calc(100vh-5rem)]">

        {/* Controls */}
        <DebugOverlay id="map-controls" tag="div" label="MapControls" variant="component">
          <div id="map-controls" className="bg-surface rounded-2xl p-4 mb-4 border border-border">
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/map" className="text-text-muted hover:text-gold transition-colors">
                <ChevronLeft size={18} />
              </Link>
              <h2 className="text-lg font-semibold text-text mr-2">{currentMap.name}</h2>

              <button
                onClick={() => setHideCompleted(!hideCompleted)}
                className={cn(
                  'flex items-center gap-2 text-sm rounded-xl px-4 py-2 transition-colors',
                  hideCompleted ? 'bg-gold/20 text-gold' : 'bg-surface-alt text-text-secondary hover:text-text'
                )}
              >
                {hideCompleted ? <EyeOff size={14} /> : <Eye size={14} />}
                완료 숨기기
              </button>

              <button
                onClick={() => setKappaOnly(!kappaOnly)}
                className={cn(
                  'flex items-center gap-2 text-sm rounded-xl px-4 py-2 transition-colors',
                  kappaOnly ? 'bg-gold/20 text-gold' : 'bg-surface-alt text-text-secondary hover:text-gold'
                )}
              >
                <Crown size={14} />
                카파 전용
              </button>

              <span className="text-xs text-text-muted ml-auto">
                {visibleMarkers.length}개 마커
              </span>
            </div>
          </div>
        </DebugOverlay>

        {/* Map container */}
        <DebugOverlay id="map-container" tag="div" label="MapContainer" variant="component">
          <div
            ref={mapContainerRef}
            id="map-container"
            className="flex-1 bg-surface rounded-2xl relative overflow-hidden border border-border"
            onClick={() => setPopup(null)}
          >
            {/* SVG 맵 렌더링 */}
            {svgHtml ? (
              <div
                ref={svgRef}
                className="absolute inset-0 [&_svg]:w-full [&_svg]:h-full [&_svg]:max-h-full"
                dangerouslySetInnerHTML={svgHtml}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-6xl font-light text-elevated/20 select-none">{currentMap.name}</p>
              </div>
            )}

            {/* Floor indicator (top-left) */}
            {floors.length > 1 && (
              <div className="absolute top-4 left-4 bg-bg/80 backdrop-blur-sm rounded-xl px-3 py-2.5 z-10">
                <p className="text-[10px] uppercase text-text-muted mb-1.5 tracking-wider">층</p>
                <div className="flex flex-col items-center gap-1">
                  {floors.map((floor, idx) => (
                    <button
                      key={floor.floorId}
                      onClick={(e) => {
                        e.stopPropagation();
                        switchFloor(floor.floorId);
                      }}
                      className="flex items-center gap-2 w-full"
                    >
                      <div
                        className={cn(
                          'w-2 h-2 rounded-full transition-all',
                          idx === floorIndex ? 'bg-gold scale-125' : 'bg-elevated'
                        )}
                      />
                      <span
                        className={cn(
                          'text-xs transition-colors',
                          idx === floorIndex ? 'text-gold font-semibold' : 'text-text-muted hover:text-text'
                        )}
                      >
                        {floor.floorLabel}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Markers */}
            {visibleMarkers.map((marker) => (
              <div
                key={marker.objectiveId}
                className="absolute group cursor-pointer z-10"
                style={svgBounds ? {
                  left: `${svgBounds.left + (marker.positionX! / 100) * svgBounds.width}px`,
                  top: `${svgBounds.top + (marker.positionY! / 100) * svgBounds.height}px`,
                  transform: 'translate(-50%, -50%)',
                } : {
                  left: `${marker.positionX}%`,
                  top: `${marker.positionY}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                onClick={(e) => handleMarkerClick(marker, e)}
              >
                <div
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center transition-transform group-hover:scale-125',
                    isCompleted(marker.questId) ? 'bg-complete/80' : 'bg-gold'
                  )}
                  style={{
                    boxShadow: isCompleted(marker.questId)
                      ? '0 0 12px rgba(52,211,153,0.4)'
                      : '0 0 12px rgba(230,184,0,0.4)',
                  }}
                >
                  <AlertCircle size={12} className="text-bg" />
                </div>

                {!popup && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                    <div className="bg-bg/90 backdrop-blur-sm text-text text-[10px] px-2 py-1 rounded-lg whitespace-nowrap">
                      {marker.questName}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Marker popup */}
            {popup && svgBounds && (
              <div
                className="absolute z-20 pointer-events-none"
                style={{
                  left: `${Math.min(
                    svgBounds.left + (popup.x / 100) * svgBounds.width,
                    svgBounds.left + svgBounds.width - 224
                  )}px`,
                  top: `${Math.max(
                    svgBounds.top + (popup.y / 100) * svgBounds.height - 20,
                    svgBounds.top + 8
                  )}px`,
                }}
              >
                <div className="pointer-events-auto bg-bg/95 backdrop-blur-md border border-border rounded-2xl p-4 w-56 shadow-xl">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Link
                      to={`/quests/${popup.marker.questId}`}
                      className="text-sm font-semibold text-gold hover:underline leading-tight"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {popup.marker.questName}
                    </Link>
                    {popup.marker.kappaRequired && (
                      <Crown size={12} className="text-gold flex-shrink-0 mt-0.5" />
                    )}
                  </div>
                  <p className="text-xs text-text-secondary mb-2">{popup.marker.objectiveDescription}</p>
                  {popup.marker.traderName && (
                    <p className="text-[10px] text-text-muted uppercase">{popup.marker.traderName}</p>
                  )}
                  {popup.marker.requiredItems.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border space-y-1">
                      {popup.marker.requiredItems.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-[10px]">
                          <span className="text-text-secondary">{item.itemName}</span>
                          <span className="text-text-muted">
                            x{item.count}{item.foundInRaid ? ' (FIR)' : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 pt-2 border-t border-border">
                    <span className={cn(
                      'text-[10px] font-medium uppercase',
                      isCompleted(popup.marker.questId) ? 'text-complete' : 'text-text-muted'
                    )}>
                      {isCompleted(popup.marker.questId) ? '완료' : '미완료'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Shift+Scroll hint */}
            <div className="absolute bottom-4 left-4 text-[10px] text-text-muted/50 z-10">
              Shift + 스크롤로 층 변경
            </div>
          </div>
        </DebugOverlay>
      </div>
    </DebugOverlay>
  );
}
