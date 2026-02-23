import { Link } from 'react-router-dom';
import { MapPin, ChevronRight } from 'lucide-react';
import DebugOverlay from '../../components/debug/DebugOverlay';

const sampleMaps = [
  { name: 'Customs', normalizedName: 'customs', questCount: 35, completedCount: 12 },
  { name: 'Interchange', normalizedName: 'interchange', questCount: 22, completedCount: 5 },
  { name: 'Reserve', normalizedName: 'reserve', questCount: 18, completedCount: 4 },
  { name: 'Woods', normalizedName: 'woods', questCount: 20, completedCount: 8 },
  { name: 'Shoreline', normalizedName: 'shoreline', questCount: 25, completedCount: 6 },
  { name: 'Factory', normalizedName: 'factory', questCount: 10, completedCount: 3 },
  { name: 'The Lab', normalizedName: 'the-lab', questCount: 12, completedCount: 2 },
  { name: 'Lighthouse', normalizedName: 'lighthouse', questCount: 15, completedCount: 3 },
  { name: 'Streets of Tarkov', normalizedName: 'streets-of-tarkov', questCount: 20, completedCount: 2 },
  { name: 'Ground Zero', normalizedName: 'ground-zero', questCount: 8, completedCount: 3 },
];

export default function MapSelectPage() {
  return (
    <DebugOverlay id="map-select-page" tag="div" label="MapSelectPage" variant="feature">
      <div id="map-select-page" className="max-w-7xl mx-auto space-y-6">
        <DebugOverlay id="map-grid" tag="div" label="MapGrid" variant="component">
          <div id="map-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sampleMaps.map((map) => {
              const pct = ((map.completedCount / map.questCount) * 100).toFixed(0);
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
                      <span className="text-[10px] text-text-secondary">{map.questCount}</span>
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
                      <span className="text-[10px] text-text-secondary">{map.completedCount}/{map.questCount}</span>
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
