import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Eye, EyeOff, Crown, ChevronLeft, List, ZoomIn, ZoomOut, RotateCcw, LogOut, Lock, AlertCircle, Package, Check, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import DebugOverlay from '../../components/debug/DebugOverlay';
import { useMapStore } from '../../store/mapStore';
import { useProgressStore } from '../../store/progressStore';
import MapQuestPanel from './components/MapQuestPanel';
import MapMarkerLayer from './components/MapMarkerLayer';
import MapMarkerPopup from './components/MapMarkerPopup';
import { MARKER_CONFIG } from './constants/markerConfig';
import { getContainerConfig } from './constants/containerConfig';
import type { MarkerCategory } from '../../types/map';
import type { PopupData } from './components/MapMarkerPopup';

const CATEGORY_ICONS: Record<MarkerCategory, typeof AlertCircle> = {
  quests: AlertCircle,
  extracts: LogOut,
  locks: Lock,
  lootContainers: Package,
};

export default function MapViewPage() {
  const { normalizedName } = useParams<{ normalizedName: string }>();
  const {
    currentMap, markers, positions, markerVisibility, lootContainerFilter, loading, error,
    fetchMapDetail, fetchMarkers, fetchPositions, toggleMarkerCategory,
    toggleLootContainerType, toggleAllLootContainers, clearCurrentMap,
  } = useMapStore();
  const { questStatuses } = useProgressStore();

  // ── Map / filter state ──────────────────────────────────────────────────────
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [kappaOnly, setKappaOnly] = useState(false);
  const [popup, setPopup] = useState<PopupData | null>(null);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [svgViewBox, setSvgViewBox] = useState<{ w: number; h: number } | null>(null);
  const [pngUrl, setPngUrl] = useState<string | null>(null);
  const [pngNaturalSize, setPngNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [containerSize, setContainerSize] = useState<{ w: number; h: number } | null>(null);
  const [showContainerFilter, setShowContainerFilter] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerFilterRef = useRef<HTMLDivElement>(null);

  // ── Zoom / pan state ────────────────────────────────────────────────────────
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
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

  // ── 컨테이너 필터 외부 클릭 닫기 ────────────────────────────────────────────
  useEffect(() => {
    if (!showContainerFilter) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerFilterRef.current && !containerFilterRef.current.contains(e.target as Node)) {
        setShowContainerFilter(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showContainerFilter]);

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
    fetchPositions(normalizedName);
    return () => {
      clearCurrentMap();
      setSvgContent(null);
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setSelectedQuestIds(new Set());
    };
  }, [normalizedName, fetchMapDetail, fetchPositions, clearCurrentMap]);

  // 맵에 층별 이미지가 있는지 확인
  const hasFloorImages = useMemo(
    () => currentMap?.floors.some((f) => f.floorImage) ?? false,
    [currentMap]
  );

  useEffect(() => {
    if (!currentMap) return;
    setSelectedFloor(currentMap.defaultFloor ?? currentMap.floors[0]?.floorId ?? null);
    fetchMarkers(currentMap.id);

    // floorImage가 있는 맵(Lab 등)은 층 전환 effect에서 pngUrl 관리
    const floorImagesExist = currentMap.floors.some((f) => f.floorImage);

    if (currentMap.svgFile) {
      if (currentMap.svgFile.endsWith('.png')) {
        if (!floorImagesExist) {
          setPngUrl(`/maps/${currentMap.svgFile}`);
        }
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

  // 층별 이미지 전환 (Lab 등 floorImage가 있는 맵)
  useEffect(() => {
    if (!hasFloorImages || !selectedFloor || !currentMap) return;
    const floor = currentMap.floors.find((f) => f.floorId === selectedFloor);
    if (floor?.floorImage) {
      const nextUrl = `/maps/${floor.floorImage}`;
      setPngNaturalSize(null);
      setPngUrl(nextUrl);
    }
  }, [selectedFloor, hasFloorImages, currentMap]);

  // ── SVG 그룹 합침 설정 (여러 SVG 그룹을 하나의 논리 층으로 통합) ────────────
  // Ground Zero: Ground_Level + First_Floor → 1층
  const SVG_GROUP_MERGE: Record<string, Record<string, string[]>> = {
    'ground-zero': { 'Ground_Level': ['Ground_Level', 'First_Floor'] },
  };

  // ── 층 가시성 (SVG 그룹 직접 조작) ──────────────────────────────────────────
  useEffect(() => {
    if (!svgRef.current || !selectedFloor || !currentMap) return;
    const container = svgRef.current;
    const groundId = currentMap.defaultFloor;
    const isGround = selectedFloor === groundId;
    const mergeMap = SVG_GROUP_MERGE[currentMap.normalizedName] ?? {};

    // 이 맵에서 논리 층에 매핑된 모든 SVG 그룹 ID 수집
    const floorToGroups = new Map<string, string[]>();
    const allManagedGroups = new Set<string>();
    currentMap.floors.forEach((f) => {
      const groups = mergeMap[f.floorId] ?? [f.floorId];
      floorToGroups.set(f.floorId, groups);
      groups.forEach((g) => allManagedGroups.add(g));
    });

    // 각 SVG 그룹의 가시성 설정
    allManagedGroups.forEach((groupId) => {
      const el = container.querySelector<SVGGElement>(`#${CSS.escape(groupId)}`);
      if (!el) return;
      el.style.transition = 'opacity 0.4s ease, filter 0.4s ease';

      const selectedGroups = floorToGroups.get(selectedFloor) ?? [];
      const groundGroups = floorToGroups.get(groundId ?? '') ?? [];

      if (selectedGroups.includes(groupId)) {
        el.style.display = 'inline'; el.style.opacity = '1'; el.style.filter = 'none';
      } else if (groundGroups.includes(groupId) && !isGround) {
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
  const handleMarkerClick = useCallback((popupData: PopupData, e: React.MouseEvent) => {
    e.stopPropagation();
    if (dragRef.current.moved) return;
    setPopup((prev) => {
      if (!prev) return popupData;
      // 같은 마커 클릭 시 닫기
      if (prev.type === popupData.type) {
        if (prev.type === 'quest' && popupData.type === 'quest' && prev.data.objectiveId === popupData.data.objectiveId) return null;
        if (prev.type !== 'quest' && popupData.type !== 'quest' && prev.data === popupData.data) return null;
      }
      return popupData;
    });
  }, []);

  // ── 퀘스트 패널 ─────────────────────────────────────────────────────────────
  const toggleQuest = useCallback((questId: number) => {
    setSelectedQuestIds((prev) => {
      const next = new Set(prev);
      next.has(questId) ? next.delete(questId) : next.add(questId);
      return next;
    });
  }, []);

  // ── 파생 값 ─────────────────────────────────────────────────────────────────
  const isCompleted = useCallback(
    (questId: number) => questStatuses[String(questId)] === 'COMPLETED',
    [questStatuses]
  );

  const getFloorDistance = useCallback(
    (floorId: string | null): number => {
      if (!floorId || !selectedFloor) return 0;
      const a = floors.findIndex((f) => f.floorId === floorId);
      const b = floors.findIndex((f) => f.floorId === selectedFloor);
      return a === -1 || b === -1 ? 0 : Math.abs(a - b);
    },
    [floors, selectedFloor]
  );

  // 퀘스트 마커 필터링
  const visibleQuestMarkers = useMemo(
    () => {
      if (!markerVisibility.quests) return [];
      return markers.filter((m) => {
        if (m.positionX === null || m.positionY === null) return false;
        if (hideCompleted && isCompleted(m.questId)) return false;
        if (kappaOnly && !m.kappaRequired) return false;
        if (selectedQuestIds.size > 0 && !selectedQuestIds.has(m.questId)) return false;
        return true;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [markers, hideCompleted, kappaOnly, selectedQuestIds, questStatuses, markerVisibility.quests]
  );

  // 탈출구/잠금 마커 필터링 (좌표 있는 것만)
  const visibleExtracts = useMemo(
    () => markerVisibility.extracts && positions?.extracts
      ? positions.extracts.filter((m) => m.positionX !== null && m.positionY !== null)
      : [],
    [positions, markerVisibility.extracts]
  );

  const visibleLocks = useMemo(
    () => markerVisibility.locks && positions?.locks
      ? positions.locks.filter((m) => m.positionX !== null && m.positionY !== null)
      : [],
    [positions, markerVisibility.locks]
  );

  // 루팅 컨테이너 마커 필터링 (카테고리 토글 + 타입별 필터)
  const visibleLootContainers = useMemo(
    () => {
      if (!markerVisibility.lootContainers || !positions?.lootContainers) return [];
      return positions.lootContainers.filter((m) =>
        m.positionX !== null && m.positionY !== null && lootContainerFilter.has(m.normalizedName)
      );
    },
    [positions, markerVisibility.lootContainers, lootContainerFilter]
  );

  // 컨테이너 타입별 카운트 (필터 드롭다운용)
  const containerTypeCounts = useMemo(() => {
    if (!positions?.lootContainers) return [];
    const countMap = new Map<string, { name: string; normalizedName: string; count: number }>();
    for (const c of positions.lootContainers) {
      if (c.positionX === null || c.positionY === null) continue;
      const existing = countMap.get(c.normalizedName);
      if (existing) {
        existing.count++;
      } else {
        countMap.set(c.normalizedName, { name: c.containerName, normalizedName: c.normalizedName, count: 1 });
      }
    }
    return Array.from(countMap.values()).sort((a, b) => b.count - a.count);
  }, [positions]);

  const allContainerTypes = useMemo(
    () => containerTypeCounts.map((c) => c.normalizedName),
    [containerTypeCounts]
  );

  const totalVisibleMarkers = visibleQuestMarkers.length + visibleExtracts.length + visibleLocks.length + visibleLootContainers.length;

  // 팝업 위치 계산
  const popupScreenPos = useMemo(() => {
    if (!popup || !mapBounds || !containerSize) return null;
    let posX: number | null = null;
    let posY: number | null = null;
    if (popup.type === 'quest') {
      posX = popup.data.positionX;
      posY = popup.data.positionY;
    } else {
      posX = popup.data.positionX;
      posY = popup.data.positionY;
    }
    if (posX === null || posY === null) return null;
    const wx = mapBounds.left + (posX / 100) * mapBounds.width;
    const wy = mapBounds.top + (posY / 100) * mapBounds.height;
    return { x: pan.x + wx * zoom, y: pan.y + wy * zoom };
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

            {/* 카테고리 토글 버튼 */}
            {(Object.keys(MARKER_CONFIG) as MarkerCategory[]).map((cat) => {
              const config = MARKER_CONFIG[cat];
              const Icon = CATEGORY_ICONS[cat];
              const isActive = markerVisibility[cat];
              return (
                <div key={cat} className="relative">
                  <button
                    onClick={() => {
                      toggleMarkerCategory(cat);
                      if (cat === 'lootContainers' && !isActive) {
                        setShowContainerFilter(true);
                      } else if (cat === 'lootContainers' && isActive) {
                        setShowContainerFilter(false);
                      }
                    }}
                    className={cn(
                      'flex items-center gap-2 text-sm rounded-xl px-4 py-2 transition-colors',
                      isActive ? config.activeColor : 'bg-surface-alt text-text-secondary hover:text-text'
                    )}
                  >
                    <Icon size={14} />
                    {config.label}
                    {cat === 'lootContainers' && isActive && (
                      <span className="text-[10px] text-text-muted ml-1">
                        ({visibleLootContainers.length})
                      </span>
                    )}
                  </button>

                  {/* 루팅 컨테이너 타입별 필터 드롭다운 */}
                  {cat === 'lootContainers' && isActive && showContainerFilter && containerTypeCounts.length > 0 && (
                    <div
                      ref={containerFilterRef}
                      className="absolute top-full left-0 mt-2 w-64 bg-surface border border-border rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto"
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                        <span className="text-xs font-semibold text-text">컨테이너 타입 필터</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleAllLootContainers(allContainerTypes)}
                            className="text-[10px] text-text-muted hover:text-gold transition-colors px-1.5 py-0.5 rounded"
                          >
                            {allContainerTypes.every((t) => lootContainerFilter.has(t)) ? '전체 해제' : '전체 선택'}
                          </button>
                          <button
                            onClick={() => setShowContainerFilter(false)}
                            className="w-5 h-5 flex items-center justify-center rounded text-text-muted hover:text-text"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                      <div className="py-1">
                        {containerTypeCounts.map((ct) => {
                          const cfg = getContainerConfig(ct.normalizedName);
                          const checked = lootContainerFilter.has(ct.normalizedName);
                          return (
                            <button
                              key={ct.normalizedName}
                              onClick={() => toggleLootContainerType(ct.normalizedName)}
                              className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-surface-alt transition-colors text-left"
                            >
                              <div className={cn('w-3 h-3 rounded-sm flex items-center justify-center', checked ? cfg.bgColor : 'bg-elevated')}>
                                {checked && <Check size={8} className="text-white" />}
                              </div>
                              <span className="text-xs text-text flex-1 truncate">{ct.name}</span>
                              <span className="text-[10px] text-text-muted">{ct.count}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="h-5 w-px bg-border mx-1" />

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

            <span className="text-xs text-text-muted ml-auto">{totalVisibleMarkers}개 마커</span>
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
            {/* Zoomable layer */}
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

              {/* 마커 레이어 */}
              {mapBounds && (
                <MapMarkerLayer
                  mapBounds={mapBounds}
                  questMarkers={visibleQuestMarkers}
                  extractMarkers={visibleExtracts}
                  lockMarkers={visibleLocks}
                  lootContainerMarkers={visibleLootContainers}
                  getFloorDistance={getFloorDistance}
                  isCompleted={isCompleted}
                  onMarkerClick={handleMarkerClick}
                  activePopup={popup}
                />
              )}
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

            {/* 줌 컨트롤 */}
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

            {/* 팝업 */}
            {popup && popupScreenPos && containerSize && (
              <MapMarkerPopup
                popup={popup}
                screenPos={popupScreenPos}
                containerWidth={containerSize.w}
              />
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
