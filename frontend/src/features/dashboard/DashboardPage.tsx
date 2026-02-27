import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  Target,
  MapPin,
  Crown,
  ChevronUp,
} from 'lucide-react';
import * as Progress from '@radix-ui/react-progress';
import { cn } from '../../utils/cn';
import DebugOverlay from '../../components/debug/DebugOverlay';
import { useProgressStore } from '../../store/progressStore';
import { useAuthStore } from '../../store/authStore';

function ProgressBar({ value, max, color = 'bg-complete' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <Progress.Root className="h-1.5 w-full bg-elevated rounded-full overflow-hidden">
      <Progress.Indicator
        className={cn('h-full rounded-full transition-all duration-500', color)}
        style={{ width: `${pct}%` }}
      />
    </Progress.Root>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div className="bg-surface rounded-2xl p-5 flex flex-col gap-4 border border-border">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', color)}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-3xl font-light text-text tracking-tight">{value}</p>
        <p className="text-xs uppercase text-text-muted mt-1">{label}</p>
      </div>
      <p className="text-xs text-text-secondary">{sub}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { summary, fetchSummary, questStatuses, fetchProgress } = useProgressStore();
  const { token } = useAuthStore();

  useEffect(() => {
    if (token) {
      fetchSummary();
      fetchProgress();
    }
  }, [token, fetchSummary, fetchProgress]);

  const totalQuests = summary?.totalQuests ?? 0;
  const completedQuests = summary?.completedQuests ?? 0;
  const kappaTotal = summary?.kappaQuests.total ?? 0;
  const kappaCompleted = summary?.kappaQuests.completed ?? 0;
  const totalPct = (summary?.totalProgressPercent ?? 0).toFixed(1);
  const kappaPct = (summary?.kappaQuests.percent ?? 0).toFixed(1);
  const traderProgress = summary?.byTrader ?? [];
  const mapProgress = summary?.byMap ?? [];
  const inProgressCount = Object.values(questStatuses).filter(s => s === 'IN_PROGRESS').length;

  const topMap = useMemo(() => {
    if (!mapProgress.length) return '-';
    const sorted = [...mapProgress].sort((a, b) => b.completed - a.completed);
    if (sorted[0].completed === 0) return '-';
    return sorted[0].mapName;
  }, [mapProgress]);

  return (
    <DebugOverlay id="dashboard-page" tag="div" label="DashboardPage" variant="feature">
      <div id="dashboard-page" className="space-y-6 max-w-7xl mx-auto">

        {/* Stats row */}
        <DebugOverlay id="progress-stats" tag="div" label="StatsRow" variant="component">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Target}
              label="전체 진행률"
              value={`${totalPct}%`}
              sub={`${completedQuests} / ${totalQuests} 퀘스트`}
              color="bg-complete/20 text-complete"
            />
            <StatCard
              icon={Crown}
              label="카파 진행률"
              value={`${kappaPct}%`}
              sub={`${kappaCompleted} / ${kappaTotal} 퀘스트`}
              color="bg-gold/20 text-gold"
            />
            <StatCard
              icon={Zap}
              label="진행 중"
              value={String(inProgressCount)}
              sub="퀘스트 진행 중"
              color="bg-progress/20 text-progress"
            />
            <StatCard
              icon={MapPin}
              label="주요 맵"
              value={topMap}
              sub="퀘스트 활동 최다"
              color="bg-incomplete/20 text-incomplete"
            />
          </div>
        </DebugOverlay>

        {/* Main grid: Traders + Overall progress */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

          {/* Overall progress card */}
          <DebugOverlay id="progress-total" tag="div" label="OverallProgress" variant="component">
            <div className="xl:col-span-4 bg-surface rounded-2xl p-6 border border-border">
              <h2 className="text-lg font-semibold text-text mb-1">전체 진행 현황</h2>
              <p className="text-xs text-text-muted mb-6">퀘스트 완료 상태</p>

              {/* Big circle / visual */}
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-40 h-40">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-surface-alt)" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="42" fill="none"
                      stroke="var(--color-complete)" strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={`${totalQuests > 0 ? (completedQuests / totalQuests) * 264 : 0} 264`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-light text-text">{totalPct}%</span>
                    <span className="text-[10px] uppercase text-text-muted">완료</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">완료</span>
                  <span className="text-sm font-medium text-complete">{completedQuests}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">진행 중</span>
                  <span className="text-sm font-medium text-progress">{inProgressCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">미시작</span>
                  <span className="text-sm font-medium text-text-muted">{Math.max(0, totalQuests - completedQuests - inProgressCount)}</span>
                </div>
              </div>
            </div>
          </DebugOverlay>

          {/* Trader progress */}
          <DebugOverlay id="progress-by-trader" tag="div" label="TraderProgress" variant="component">
            <div className="xl:col-span-8 bg-surface rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-text">트레이더 진행률</h2>
                  <p className="text-xs text-text-muted">트레이더별 퀘스트 완료 현황</p>
                </div>
                <Link to="/quests" className="text-xs text-gold hover:text-gold-dim transition-colors no-underline">
                  전체 보기
                </Link>
              </div>

              <div className="space-y-4">
                {traderProgress.length === 0 && (
                  <p className="text-xs text-text-muted text-center py-4">로그인 후 진행 상태를 확인하세요.</p>
                )}
                {traderProgress.map((trader) => (
                  <div key={trader.traderName} className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl bg-surface-alt flex items-center justify-center text-text-secondary text-xs font-semibold flex-shrink-0">
                      {trader.traderName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-text">{trader.traderName}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-text-muted">{trader.completed}/{trader.total}</span>
                          <span className="flex items-center text-[10px] text-complete">
                            <ChevronUp size={12} />
                            {trader.percent.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <ProgressBar value={trader.completed} max={trader.total} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DebugOverlay>
        </div>

        {/* Map progress */}
        <DebugOverlay id="progress-by-map" tag="div" label="MapProgress" variant="component">
          <div className="bg-surface rounded-2xl p-6 border border-border">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-text">맵별 진행률</h2>
                <p className="text-xs text-text-muted">맵 위치별 퀘스트 현황</p>
              </div>
              <Link to="/map" className="text-xs text-gold hover:text-gold-dim transition-colors no-underline">
                전체 보기
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mapProgress.length === 0 && (
                <p className="text-xs text-text-muted py-4 col-span-3 text-center">로그인 후 진행 상태를 확인하세요.</p>
              )}
              {mapProgress.map((m) => (
                <Link
                  key={m.mapName}
                  to={`/map/${m.mapName.toLowerCase().replace(/\s+/g, '-')}`}
                  className="bg-surface-alt rounded-xl p-4 hover:bg-elevated/50 transition-colors cursor-pointer no-underline"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-text">{m.mapName}</span>
                    <span className="text-xs text-text-muted">{m.percent.toFixed(0)}%</span>
                  </div>
                  <ProgressBar value={m.completed} max={m.total} color="bg-progress" />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] uppercase text-text-muted">{m.total} quests</span>
                    <span className="text-xs text-text-secondary">{m.completed} done</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </DebugOverlay>
      </div>
    </DebugOverlay>
  );
}
