import { useEffect } from 'react';
import { Warehouse, Loader2 } from 'lucide-react';
import { useHideoutStore } from '../../store/hideoutStore';
import { useAuthStore } from '../../store/authStore';
import StationCard from './components/StationCard';

export default function HideoutPage() {
  const { stations, stationLevels, loading, error, fetchStations, fetchProgress } = useHideoutStore();
  const { token } = useAuthStore();

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  useEffect(() => {
    if (token) fetchProgress();
  }, [token, fetchProgress]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <Warehouse size={24} className="text-gold" />
        <div>
          <h1 className="text-xl font-bold text-text">은신처</h1>
          <p className="text-sm text-text-muted">{stations.length}개 스테이션</p>
        </div>
      </div>

      {/* 로딩 / 에러 */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-text-muted" />
        </div>
      )}
      {error && <p className="text-center text-sm text-red-400 py-4">{error}</p>}

      {/* 스테이션 그리드 */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stations.map((station) => (
            <StationCard
              key={station.apiId}
              apiId={station.apiId}
              name={station.name}
              imageLink={station.imageLink}
              maxLevel={station.maxLevel}
              currentLevel={stationLevels[station.apiId] ?? 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
