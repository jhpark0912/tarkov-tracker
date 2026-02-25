import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Eye, EyeOff, Crown, AlertCircle, ChevronLeft, List, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { cn } from '../../utils/cn';
import DebugOverlay from '../../components/debug/DebugOverlay';
import { useMapStore } from '../../store/mapStore';
import { useProgressStore } from '../../store/progressStore';
import MapQuestPanel from './components/MapQuestPanel';
import type { QuestMapMarker } from '../../types/map';

interface MarkerPopup {
  marker: QuestMapMarker;
}

export default function MapViewPage() {
  const { normalizedName } = useParams<{ normalizedName: string }>();
  const { currentMap, markers, loading, error, fetchMapDetail, fetchMarkers, clearCurrentMap } = useMapStore();
  const { questStatuses } = useProgressStore();

  // ── Map / filter state ──────────────────────────────────────────────────────
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [kappaOnly, setKappaOnly] = useState(false);
  const [popup, setPopup] = useState<MarkerPopup | null>(null);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [svgViewBox, setSvgViewBox] = useState<{ w: number; h: number } | null>(null);
  const [pngUrl, setPngUrl] = useState<string | null>(null);
  const [pngNaturalSize, setPngNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [containerSize, setContainerSize] = useState<{ w: number; h: number } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // ── Zoom / pan state ────────────────────────────────────────────────────────
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  // refs: 이벤트 핸들러에서 stale closure 방지
  const zoomPanRef = useRef({ zoom: 1, pan: { x: 0, y: 0 } });
  zoomPanRef.current = { zoom, pan };
  const dragRef = useRef({ active: false, startX: 0, startY: 0, panX: 0, panY: 0, moved: false });
  const selectedFloorRef = useRef(selectedFloor);
  selectedFloorRef.current = selectedFloor;

  // ── Panel state ─────────────────────────────────────────────────────────────
  const [showPanel, setShowPanel] = useState(true);
  const [selectedQuestIds, setSelectedQuestIds] = useState<Set<number>>(new Set());

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<HTMLDivElement>(null);

  // ── SVG 처리 ────────────────────────────────────────────────────────────────
  const svgHtml = useMemo(
    () => (svgContent ? { __html: svgContent } : undefined),
    [svgContent]
  );

  useEffect(() => {
    if (!svgContent) { setSvgViewBox(null); return; }
    const m = svgContent.match(/viewBox="([^"]+)"/);
    if (m) {
      const parts = m[1].trim().split(/\s+/);
      if (parts.length >= 4) setSvgViewBox({ w: parseFloat(parts[2]), h: parseFloat(parts[3]) });
    }
  }, [svgContent]);

  // currentMap 의존성: loading=true 시 ref가 null이어서 [] deps로는 관찰 미설치
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

  const mapBounds = useMemo(() => {
    const viewSize = svgViewBox ?? pngNaturalSize;
    if (!viewSize || !containerSize) return null;
    const scale = Math.min(containerSize.w / viewSize.w, containerSize.h / viewSize.h);
    const rW = viewSize.w * scale;
    const rH = viewSize.h * scale;
    return {
      left: (containerSize.w - rW) / 2,
      top: (containerSize.h - rH) / 2,
      width: rW,
      height: rH,
    };
  }, [svgViewBox, pngNaturalSize, containerSize]);

  // ── 데이터 로딩 ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!normalizedName) return;
    fetchMapDetail(normalizedName);
    return () => {
      clearCurrentMap();
      setSvgContent(null);
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setSelectedQuestIds(new Set());
    };
  }, [normalizedName, fetchMapDetail, clearCurrentMap]);

  useEffect(() => {
    if (!currentMap) return;
    setSelectedFloor(currentMap.defaultFloor ?? currentMap.floors[0]?.floorId ?? null);
    fetchMarkers(currentMap.id);
    if (currentMap.svgFile) {
      if (currentMap.svgFile.endsWith('.png')) {
        setPngUrl(`/maps/${currentMap.svgFile}`);
        setSvgContent(null);
      } else {
        setPngUrl(null);
        setPngNaturalSize(null);
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
    } else {
      setSvgContent(null);
      setPngUrl(null);
      setPngNaturalSize(null);
    }
  }, [currentMap, fetchMarkers]);

  // ── 층 가시성 (SVG 그룹 직접 조작) ──────────────────────────────────────────
  useEffect(() => {
    if (!svgRef.current || !selectedFloor || !currentMap) return;
    const container = svgRef.current;
    const groundId = currentMap.defaultFloor;
    const isGround = selectedFloor === groundId;
    currentMap.floors.forEach((f) => {
      const el = container.querySelector<SVGGElement>(`#${CSS.escape(f.floorId)}`);
      if (!el) return;
      el.style.transition = 'opacity 0.4s ease, filter 0.4s ease';
      if (f.floorId === selectedFloor) {
        el.style.display = 'inline'; el.style.opacity = '1'; el.style.filter = 'none';
      } else if (f.floorId === groundId && !isGround) {
        el.style.display = 'inline'; el.style.opacity = '0.2'; el.style.filter = 'blur(3px)';
      } else {
        el.style.display = 'none';
      }
    });
  }, [selectedFloor, svgContent, currentMap]);

  // ── 층 헬퍼 ─────────────────────────────────────────────────────────────────
  const floors = currentMap?.floors ?? [];
  const floorIndex = floors.findIndex((f) => f.floorId === selectedFloor);

  const switchFloor = useCallback((id: string) => setSelectedFloor(id), []);

  const changeFloor = useCallback(
    (dir: 'up' | 'down') => {
      const idx = floors.findIndex((f) => f.floorId === selectedFloorRef.current);
      const next = dir === 'up' ? idx + 1 : idx - 1;
      if (next >= 0 && next < floors.length) setSelectedFloor(floors[next].floorId);
    },
    [floors]
  );
  const changeFloorRef = useRef(changeFloor);
  useEffect(() => { changeFloorRef.current = changeFloor; }, [changeFloor]);

  // ── 휠: 줌 + Shift→층 변경 ──────────────────────────────────────────────────
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      if (e.shiftKey) { changeFloorRef.current(e.deltaY < 0 ? 'up' : 'down'); return; }
      const rect = container.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const { zoom: z, pan: p } = zoomPanRef.current;
      const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      const nz = Math.min(Math.max(z * factor, 0.3), 10);
      const wx = (mx - p.x) / z;
      const wy = (my - p.y) / z;
      setZoom(nz);
      setPan({ x: mx - wx * nz, y: my - wy * nz });
    };
    container.addEventListener('wheel', handler, { passive: false });
    return () => container.removeEventListener('wheel', handler);
  }, [currentMap]);

  // ── 드래그 패닝 ─────────────────────────────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    dragRef.current = { active: true, startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y, moved: false };
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragRef.current.moved = true;
    setPan({ x: dragRef.current.panX + dx, y: dragRef.current.panY + dy });
  };

  const handleMouseUp = () => { dragRef.current.active = false; setIsDragging(false); };

  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  // ── 마커 클릭 ───────────────────────────────────────────────────────────────
  const handleMarkerClick = (marker: QuestMapMarker, e: React.MouseEvent) => {
    e.stopPropagation();
    if (dragRef.current.moved) return; // 드래그였으면 팝업 무시
    setPopup((prev) =>
      prev?.marker.objectiveId === marker.objectiveId ? null : { marker }
    );
  };

  // ── 퀘스트 패널 ─────────────────────────────────────────────────────────────
  const toggleQuest = useCallback((questId: number) => {
    setSelectedQuestIds((prev) => {
      const next = new Set(prev);
      next.has(questId) ? next.delete(questId) : next.add(questId);
      return next;
    });
  }, []);

  // ── 파생 값 ─────────────────────────────────────────────────────────────────
  const isCompleted = (questId: number) => questStatuses[String(questId)] === 'COMPLETED';

  const getFloorDistance = (floorId: string | null): number => {
    if (!floorId || !selectedFloor) return 0;
    const a = floors.findIndex((f) => f.floorId === floorId);
    const b = floors.findIndex((f) => f.floorId === selectedFloor);
    return a === -1 || b === -1 ? 0 : Math.abs(a - b);
  };

  const visibleMarkers = useMemo(
    () =>
      markers.filter((m) => {
        if (m.positionX === null || m.positionY === null) return false;
        if (hideCompleted && isCompleted(m.questId)) return false;
        if (kappaOnly && !m.kappaRequired) return false;
        if (selectedQuestIds.size > 0 && !selectedQuestIds.has(m.questId)) return false;
        return true;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [markers, hideCompleted, kappaOnly, selectedQuestIds, questStatuses]
  );

  // 팝업 위치: zoomable 레이어 밖, 화면 좌표로 변환
  const popupScreenPos = useMemo(() => {
    if (!popup || !mapBounds || !containerSize) return null;
    const wx = mapBounds.left + (popup.marker.positionX! / 100) * mapBounds.width;
    const wy = mapBounds.top + (popup.marker.positionY! / 100) * mapBounds.height;
    const sx = pan.x + wx * zoom;
    const sy = pan.y + wy * zoom;
    const POPUP_W = 224;
    return {
      x: Math.min(Math.max(sx, POPUP_W / 2 + 8), containerSize.w - POPUP_W / 2 - 8),
      y: sy,
    };
  }, [popup, mapBounds, pan, zoom, containerSize]);

  // ── Loading / error ──────────────────────────────────────────────────────────
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

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <DebugOverlay id="map-view-page" tag="div" label="MapViewPage" variant="feature">
      <div id="map-view-page" className="flex flex-col h-[calc(100vh-5rem)]">

        {/* Controls */}
        <div className="bg-surface rounded-2xl p-4 mb-4 border border-border">
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/map" className="text-text-muted hover:text-gold transition-colors">
              <ChevronLeft size={18} />
            </Link>
            <h2 className="text-lg font-semibold text-text mr-2">{currentMap.name}</h2>

            <button
              onClick={() => setHideCompleted((v) => !v)}
              className={cn(
                'flex items-center gap-2 text-sm rounded-xl px-4 py-2 transition-colors',
                hideCompleted ? 'bg-gold/20 text-gold' : 'bg-surface-alt text-text-secondary hover:text-text'
              )}
            >
              {hideCompleted ? <EyeOff size={14} /> : <Eye size={14} />}
              완료 숨기기
            </button>

            <button
              onClick={() => setKappaOnly((v) => !v)}
              className={cn(
                'flex items-center gap-2 text-sm rounded-xl px-4 py-2 transition-colors',
                kappaOnly ? 'bg-gold/20 text-gold' : 'bg-surface-alt text-text-secondary hover:text-gold'
              )}
            >
              <Crown size={14} />
              카파 전용
            </button>

            <button
              onClick={() => setShowPanel((v) => !v)}
              className={cn(
                'flex items-center gap-2 text-sm rounded-xl px-4 py-2 transition-colors',
                showPanel ? 'bg-gold/20 text-gold' : 'bg-surface-alt text-text-secondary hover:text-text'
              )}
            >
              <List size={14} />
              퀘스트 목록
            </button>

            <span className="text-xs text-text-muted ml-auto">{visibleMarkers.length}개 마커</span>
          </div>
        </div>

        {/* Map + Panel row */}
        <div className="flex flex-1 gap-4 min-h-0">

          {/* Map container */}
          <div
            ref={mapContainerRef}
            className="flex-1 bg-surface rounded-2xl relative overflow-hidden border border-border min-w-0 select-none"
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={() => { if (!dragRef.current.moved) setPopup(null); }}
          >
            {/* Zoomable layer: SVG + markers */}
            <div
              className="absolute inset-0"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: '0 0',
              }}
            >
              {/* SVG map */}
              {svgHtml && (
                <div
                  ref={svgRef}
                  className="absolute inset-0 [&_svg]:w-full [&_svg]:h-full [&_svg]:max-h-full"
                  dangerouslySetInnerHTML={svgHtml}
                />
              )}

              {/* PNG map */}
              {pngUrl && (
                <img
                  ref={imgRef}
                  src={pngUrl}
                  alt={currentMap.name}
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                  draggable={false}
                  onLoad={() => {
                    if (imgRef.current) {
                      setPngNaturalSize({ w: imgRef.current.naturalWidth, h: imgRef.current.naturalHeight });
                    }
                  }}
                />
              )}

              {!svgHtml && !pngUrl && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <p className="text-6xl font-light text-elevated/20 select-none">{currentMap.name}</p>
                </div>
              )}

              {/* Markers — 모든 층 표시, 거리에 따라 블러 */}
              {mapBounds && visibleMarkers.map((marker) => {
                const dist = getFloorDistance(marker.floorId);
                const ml = mapBounds.left + (marker.positionX! / 100) * mapBounds.width;
                const mt = mapBounds.top + (marker.positionY! / 100) * mapBounds.height;
                return (
                  <div
                    key={marker.objectiveId}
                    className="absolute group cursor-pointer"
                    style={{
                      left: `${ml}px`,
                      top: `${mt}px`,
                      transform: 'translate(-50%, -50%)',
                      opacity: dist === 0 ? 1 : dist === 1 ? 0.4 : 0.2,
                      filter: dist > 0 ? `blur(${Math.min(dist, 2)}px)` : 'none',
                      zIndex: dist === 0 ? 10 : 5,
                      transition: 'opacity 0.3s, filter 0.3s',
                    }}
                    onClick={(e) => handleMarkerClick(marker, e)}
                  >
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full flex items-center justify-center transition-transform group-hover:scale-125',
                        isCompleted(marker.questId) ? 'bg-complete/80' : 'bg-gold'
                      )}
                      style={{
                        boxShadow: isCompleted(marker.questId)
                          ? '0 0 8px rgba(52,211,153,0.5)'
                          : '0 0 8px rgba(230,184,0,0.5)',
                      }}
                    >
                      <AlertCircle size={10} className="text-bg" />
                    </div>
                    {!popup && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap">
                        <div className="bg-bg/90 backdrop-blur-sm text-text text-[10px] px-2 py-1 rounded-lg">
                          {marker.questName}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 층 선택 (zoomable 레이어 밖) */}
            {floors.length > 1 && (
              <div className="absolute top-4 left-4 bg-bg/80 backdrop-blur-sm rounded-xl px-3 py-2.5 z-20">
                <p className="text-[10px] uppercase text-text-muted mb-1.5 tracking-wider">층</p>
                <div className="flex flex-col items-center gap-1">
                  {floors.map((floor, idx) => (
                    <button
                      key={floor.floorId}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => { e.stopPropagation(); switchFloor(floor.floorId); }}
                      className="flex items-center gap-2 w-full"
                    >
                      <div className={cn(
                        'w-2 h-2 rounded-full transition-all',
                        idx === floorIndex ? 'bg-gold scale-125' : 'bg-elevated'
                      )} />
                      <span className={cn(
                        'text-xs transition-colors',
                        idx === floorIndex ? 'text-gold font-semibold' : 'text-text-muted hover:text-text'
                      )}>
                        {floor.floorLabel}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 줌 컨트롤 (bottom-right) */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-1 z-20">
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); setZoom((z) => Math.min(z * 1.3, 10)); }}
                className="w-8 h-8 bg-bg/80 backdrop-blur-sm rounded-lg flex items-center justify-center text-text-muted hover:text-text transition-colors"
              >
                <ZoomIn size={14} />
              </button>
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); resetView(); }}
                title="뷰 초기화"
                className="w-8 h-8 bg-bg/80 backdrop-blur-sm rounded-lg flex items-center justify-center text-text-muted hover:text-text transition-colors"
              >
                <RotateCcw size={12} />
              </button>
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); setZoom((z) => Math.max(z / 1.3, 0.3)); }}
                className="w-8 h-8 bg-bg/80 backdrop-blur-sm rounded-lg flex items-center justify-center text-text-muted hover:text-text transition-colors"
              >
                <ZoomOut size={14} />
              </button>
            </div>

            {/* 팝업 (zoomable 레이어 밖, 화면 좌표) */}
            {popup && popupScreenPos && (
              <div
                className="absolute z-30 pointer-events-none"
                style={{
                  left: `${popupScreenPos.x}px`,
                  top: `${popupScreenPos.y}px`,
                  transform: 'translate(-50%, calc(-100% - 12px))',
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
                      <Crown size={12} className="text-gold shrink-0 mt-0.5" />
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

            {/* 조작 힌트 */}
            <div className="absolute bottom-4 left-4 text-[10px] text-text-muted/50 z-10 pointer-events-none">
              휠 줌 · Shift+휠 층 변경 · 드래그 이동
            </div>
          </div>

          {/* 우측 퀘스트 패널 */}
          {showPanel && (
            <MapQuestPanel
              markers={markers}
              selectedQuestIds={selectedQuestIds}
              onToggleQuest={toggleQuest}
              onClearSelection={() => setSelectedQuestIds(new Set())}
              onClose={() => setShowPanel(false)}
            />
          )}
        </div>
      </div>
    </DebugOverlay>
  );
}
