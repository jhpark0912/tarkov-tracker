import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Eye, EyeOff, Crown, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import DebugOverlay from '../../components/debug/DebugOverlay';

const floors = ['Basement', 'Ground', '1F', '2F'];

const sampleMarkers = [
  { id: 'm1', name: 'Debut - Kill Scavs', x: 30, y: 40, floor: 'Ground', status: 'active' },
  { id: 'm2', name: 'Checking - Find Package', x: 55, y: 25, floor: 'Ground', status: 'active' },
  { id: 'm3', name: 'Pharmacist - Container', x: 70, y: 60, floor: '1F', status: 'completed' },
  { id: 'm4', name: 'Delivery - Pickup', x: 40, y: 55, floor: 'Ground', status: 'active' },
];

export default function MapViewPage() {
  const { normalizedName } = useParams<{ normalizedName: string }>();
  const [selectedFloor, setSelectedFloor] = useState('Ground');
  const [hideCompleted, setHideCompleted] = useState(false);
  const [toast, setToast] = useState<{ text: string; visible: boolean } | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const mapName = normalizedName
    ? normalizedName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'Unknown';

  const visibleMarkers = sampleMarkers.filter(
    (m) => m.floor === selectedFloor && !(hideCompleted && m.status === 'completed')
  );

  const floorIndex = floors.indexOf(selectedFloor);

  const showToast = useCallback((text: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ text, visible: true });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(prev => prev ? { ...prev, visible: false } : null);
      setTimeout(() => setToast(null), 300);
    }, 1200);
  }, []);

  const changeFloor = useCallback((direction: 'up' | 'down') => {
    setSelectedFloor(prev => {
      const idx = floors.indexOf(prev);
      const nextIdx = direction === 'up' ? idx + 1 : idx - 1;
      if (nextIdx < 0 || nextIdx >= floors.length) return prev;
      const nextFloor = floors[nextIdx];
      showToast(nextFloor);
      return nextFloor;
    });
  }, [showToast]);

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    function handleWheel(e: WheelEvent) {
      if (!e.shiftKey) return;
      e.preventDefault();
      if (e.deltaY < 0) {
        changeFloor('up');
      } else if (e.deltaY > 0) {
        changeFloor('down');
      }
    }

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [changeFloor]);

  return (
    <DebugOverlay id="map-view-page" tag="div" label="MapViewPage" variant="feature">
      <div id="map-view-page" className="flex flex-col h-[calc(100vh-5rem)]">

        {/* Controls */}
        <DebugOverlay id="map-controls" tag="div" label="MapControls" variant="component">
          <div id="map-controls" className="bg-surface rounded-2xl p-4 mb-4 border border-border">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-semibold text-text mr-4">{mapName}</h2>

              <select
                className="bg-surface-alt text-text-secondary text-sm rounded-xl px-4 py-2 border-none outline-none appearance-none cursor-pointer"
                value={normalizedName}
                onChange={() => {}}
              >
                <option value="customs">Customs</option>
                <option value="interchange">Interchange</option>
                <option value="reserve">Reserve</option>
                <option value="woods">Woods</option>
                <option value="shoreline">Shoreline</option>
                <option value="factory">Factory</option>
              </select>

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

              <button className="flex items-center gap-2 bg-surface-alt text-text-secondary hover:text-gold text-sm rounded-xl px-4 py-2 transition-colors">
                <Crown size={14} />
                카파 전용
              </button>
            </div>
          </div>
        </DebugOverlay>

        {/* Map container (full width, no floor selector sidebar) */}
        <DebugOverlay id="map-container" tag="div" label="MapContainer" variant="component">
          <div
            ref={mapContainerRef}
            id="map-container"
            className="flex-1 bg-surface rounded-2xl relative overflow-hidden border border-border"
          >
            {/* Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-4xl font-light text-elevated mb-2">{mapName}</p>
                <p className="text-xs text-text-muted uppercase">{selectedFloor} 층</p>
                <p className="text-[10px] text-text-muted mt-4">Leaflet 맵이 여기에 렌더링됩니다</p>
              </div>
            </div>

            {/* Floor indicator overlay (top-left) */}
            <div className="absolute top-4 left-4 bg-bg/70 backdrop-blur-sm rounded-xl px-3 py-2.5 z-10">
              <p className="text-[10px] uppercase text-text-muted mb-1.5 tracking-wider">층</p>
              <div className="flex flex-col items-center gap-1">
                {floors.map((floor, idx) => (
                  <div key={floor} className="flex items-center gap-2">
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full transition-all',
                        idx === floorIndex ? 'bg-gold scale-125' : 'bg-elevated'
                      )}
                    />
                    <span
                      className={cn(
                        'text-xs transition-colors',
                        idx === floorIndex ? 'text-gold font-semibold' : 'text-text-muted'
                      )}
                    >
                      {floor}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Markers */}
            {visibleMarkers.map((marker) => (
              <div
                key={marker.id}
                className="absolute group cursor-pointer"
                style={{
                  left: `${marker.x}%`,
                  top: `${marker.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center transition-transform group-hover:scale-125',
                  marker.status === 'completed' ? 'bg-complete/80' : 'bg-gold'
                )}
                  style={{
                    boxShadow: marker.status === 'completed'
                      ? '0 0 12px rgba(52,211,153,0.4)'
                      : '0 0 12px rgba(230,184,0,0.4)',
                  }}
                >
                  <AlertCircle size={12} className="text-bg" />
                </div>

                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-bg/90 backdrop-blur-sm text-text text-[10px] px-2 py-1 rounded-lg whitespace-nowrap">
                    {marker.name}
                  </div>
                </div>
              </div>
            ))}

            {/* Marker count badge */}
            <div className="absolute top-4 right-4 bg-bg/60 backdrop-blur-sm rounded-xl px-3 py-2 text-xs text-text-secondary">
              {visibleMarkers.length}개 마커
            </div>

            {/* Floor change toast */}
            {toast && (
              <div
                className={cn(
                  'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg/80 backdrop-blur-md rounded-2xl px-6 py-4 z-20 pointer-events-none',
                  toast.visible ? 'animate-fade-in-up' : 'animate-fade-out-down'
                )}
              >
                <p className="text-2xl font-semibold text-gold text-center">{toast.text}</p>
                <p className="text-[10px] text-text-muted text-center mt-1 uppercase">층</p>
              </div>
            )}

            {/* Shift+Scroll hint (bottom-left) */}
            <div className="absolute bottom-4 left-4 text-[10px] text-text-muted/60">
              Shift + 스크롤로 층 변경
            </div>
          </div>
        </DebugOverlay>
      </div>
    </DebugOverlay>
  );
}
