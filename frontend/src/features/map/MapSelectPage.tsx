import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ChevronRight } from 'lucide-react';
import DebugOverlay from '../../components/debug/DebugOverlay';
import { useMapStore } from '../../store/mapStore';
import { useProgressStore } from '../../store/progressStore';

export default function MapSelectPage() {
  const { maps, loading, error, fetchMaps } = useMapStore();
  const { summary } = useProgressStore();

  useEffect(() => {
    fetchMaps();
  }, [fetchMaps]);

  // byMap 진행률 매칭 (mapName 대소문자 비교)
  const getMapProgress = (mapName: string) => {
    if (!summary?.byMap) return null;
    return summary.byMap.find(
      (m) => m.mapName.toLowerCase() === mapName.toLowerCase()
    ) ?? null;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
        <p className="text-text-muted text-sm">맵 목록 로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
        <p className="text-incomplete text-sm">{error}</p>
      </div>
    );
  }

  return (
    <DebugOverlay id="map-select-page" tag="div" label="MapSelectPage" variant="feature">
      <div id="map-select-page" className="max-w-7xl mx-auto space-y-6">
        <DebugOverlay id="map-grid" tag="div" label="MapGrid" variant="component">
          <div id="map-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {maps.map((map) => {
              const prog = getMapProgress(map.name);
              const questCount = prog?.total ?? 0;
              const completedCount = prog?.completed ?? 0;
              const pct = prog ? prog.percent.toFixed(0) : '0';

              return (
                <Link
                  key={map.normalizedName}
                  to={`/map/${map.normalizedName}`}
                  className="map-card group bg-surface rounded-2xl overflow-hidden no-underline transition-all hover:scale-[1.02] hover:bg-surface-alt border border-border"
                >
                  {/* Map preview */}
                  <div className="h-36 bg-surface-alt relative flex items-center justify-center overflow-hidden">
                    <div className="text-5xl font-light text-elevated select-none">
                      {map.name.charAt(0)}
                    </div>
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-bg/60 backdrop-blur-sm rounded-lg px-2 py-1">
                      <MapPin size={12} className="text-gold" />
                      <span className="text-[10px] text-text-secondary">{questCount}</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-text">{map.name}</h3>
                      <ChevronRight size={14} className="text-text-muted group-hover:text-gold transition-colors" />
                    </div>

                    {/* Progress */}
                    <div className="h-1.5 w-full bg-elevated rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full bg-progress rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase text-text-muted">{pct}% 완료</span>
                      <span className="text-[10px] text-text-secondary">{completedCount}/{questCount}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </DebugOverlay>
      </div>
    </DebugOverlay>
  );
}
