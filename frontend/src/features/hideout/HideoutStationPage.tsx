import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Warehouse, ChevronDown, Loader2, Check } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useHideoutStore } from '../../store/hideoutStore';
import { useAuthStore } from '../../store/authStore';
import LevelRequirements from './components/LevelRequirements';

export default function HideoutStationPage() {
  const { apiId } = useParams<{ apiId: string }>();
  const {
    currentDetail: detail,
    stationLevels,
    itemCounts,
    loading,
    error,
    fetchDetail,
    fetchProgress,
    updateStationLevel,
    updateItemProgress,
    clearDetail,
  } = useHideoutStore();
  const { token } = useAuthStore();

  const [expandedLevels, setExpandedLevels] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (apiId) fetchDetail(apiId);
    if (token) fetchProgress();
    return () => clearDetail();
  }, [apiId, token, fetchDetail, fetchProgress, clearDetail]);

  // 현재 레벨 기준으로 다음 레벨 자동 열기
  useEffect(() => {
    if (detail && apiId) {
      const currentLevel = stationLevels[apiId] ?? 0;
      const nextLevel = currentLevel + 1;
      const nextLevelData = detail.levels.find((l) => l.level === nextLevel);
      if (nextLevelData) {
        setExpandedLevels(new Set([nextLevel]));
      }
    }
  }, [detail, apiId, stationLevels]);

  const toggleLevel = (level: number) => {
    setExpandedLevels((prev) => {
      const next = new Set(prev);
      if (next.has(level)) {
        next.delete(level);
      } else {
        next.add(level);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={32} className="animate-spin text-text-muted" />
      </div>
    );
  }

  if (error) return <p className="text-center text-sm text-red-400 py-4">{error}</p>;
  if (!detail || !apiId) return null;

  const currentLevel = stationLevels[apiId] ?? 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <Link to="/hideout">
          <ArrowLeft size={20} className="text-text-muted hover:text-text transition-colors" />
        </Link>
        <div className="w-14 h-14 rounded-lg bg-surface-alt flex items-center justify-center overflow-hidden">
          {detail.imageLink ? (
            <img src={detail.imageLink} alt={detail.name} className="w-12 h-12 object-contain" />
          ) : (
            <Warehouse size={24} className="text-text-muted" />
          )}
        </div>
        <div>
          <h1 className="text-xl font-bold text-text">{detail.name}</h1>
          <p className="text-sm text-text-muted">
            현재 레벨: {currentLevel} / {detail.levels.length > 0 ? Math.max(...detail.levels.map((l) => l.level)) : 0}
          </p>
        </div>
      </div>

      {/* 레벨 업데이트 (로그인 시) */}
      {token && (
        <div className="bg-surface rounded-xl border border-border p-4">
          <label className="text-xs text-text-muted block mb-2">스테이션 레벨 설정</label>
          <div className="flex items-center gap-2">
            {detail.levels.map((l) => (
              <button
                key={l.level}
                onClick={() => updateStationLevel(apiId, l.level)}
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors cursor-pointer',
                  currentLevel >= l.level
                    ? 'bg-complete/20 text-complete'
                    : 'bg-surface-alt text-text-muted hover:text-text',
                )}
              >
                {l.level}
              </button>
            ))}
            {currentLevel > 0 && (
              <button
                onClick={() => updateStationLevel(apiId, 0)}
                className="ml-2 text-xs text-text-muted hover:text-danger transition-colors cursor-pointer"
              >
                초기화
              </button>
            )}
          </div>
        </div>
      )}

      {/* 레벨별 아코디언 */}
      <div className="space-y-3">
        {detail.levels.map((level) => {
          const isExpanded = expandedLevels.has(level.level);
          const isCompleted = currentLevel >= level.level;
          const hasRequirements = level.itemRequirements.length > 0
            || level.stationRequirements.length > 0
            || level.skillRequirements.length > 0
            || level.traderRequirements.length > 0;

          return (
            <div key={level.level} className="bg-surface rounded-xl border border-border overflow-hidden">
              <button
                onClick={() => toggleLevel(level.level)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-alt/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {isCompleted ? (
                    <div className="w-7 h-7 rounded-lg bg-complete/20 flex items-center justify-center">
                      <Check size={14} className="text-complete" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-surface-alt flex items-center justify-center">
                      <span className="text-sm font-semibold text-text-muted">{level.level}</span>
                    </div>
                  )}
                  <span className={cn(
                    'text-sm font-medium',
                    isCompleted ? 'text-text-muted' : 'text-text',
                  )}>
                    레벨 {level.level}
                  </span>
                </div>
                <ChevronDown
                  size={16}
                  className={cn('text-text-muted transition-transform', isExpanded && 'rotate-180')}
                />
              </button>

              {isExpanded && hasRequirements && (
                <div className="px-5 pb-5 border-t border-border/50 pt-4">
                  <LevelRequirements
                    level={level}
                    itemCounts={itemCounts}
                    stationLevels={stationLevels}
                    onItemCountChange={updateItemProgress}
                    isLoggedIn={!!token}
                  />
                </div>
              )}

              {isExpanded && !hasRequirements && (
                <div className="px-5 pb-5 border-t border-border/50 pt-4">
                  <p className="text-sm text-text-muted">요구사항 없음</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
