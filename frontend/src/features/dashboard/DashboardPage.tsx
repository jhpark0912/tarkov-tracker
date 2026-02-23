import {
  Zap,
  Target,
  MapPin,
  Crown,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import * as Progress from '@radix-ui/react-progress';
import { cn } from '../../utils/cn';
import DebugOverlay from '../../components/debug/DebugOverlay';

const traderProgress = [
  { name: 'Prapor', total: 28, completed: 8, trend: 'up' as const },
  { name: 'Therapist', total: 22, completed: 6, trend: 'up' as const },
  { name: 'Skier', total: 24, completed: 5, trend: 'down' as const },
  { name: 'Peacekeeper', total: 18, completed: 3, trend: 'up' as const },
  { name: 'Mechanic', total: 20, completed: 7, trend: 'up' as const },
  { name: 'Ragman', total: 16, completed: 4, trend: 'down' as const },
  { name: 'Jaeger', total: 32, completed: 6, trend: 'up' as const },
  { name: 'Fence', total: 6, completed: 2, trend: 'up' as const },
  { name: 'Lightkeeper', total: 8, completed: 1, trend: 'down' as const },
];

const mapProgress = [
  { name: 'Customs', quests: 35, completed: 12 },
  { name: 'Interchange', quests: 22, completed: 5 },
  { name: 'Reserve', quests: 18, completed: 4 },
  { name: 'Woods', quests: 20, completed: 8 },
  { name: 'Shoreline', quests: 25, completed: 6 },
  { name: 'Factory', quests: 10, completed: 3 },
];

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
  const totalQuests = 200;
  const completedQuests = 45;
  const kappaTotal = 140;
  const kappaCompleted = 30;
  const totalPct = ((completedQuests / totalQuests) * 100).toFixed(1);
  const kappaPct = ((kappaCompleted / kappaTotal) * 100).toFixed(1);

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
              label="이번 주"
              value="+12"
              sub="퀘스트 완료"
              color="bg-progress/20 text-progress"
            />
            <StatCard
              icon={MapPin}
              label="주요 맵"
              value="Customs"
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
                      strokeDasharray={`${(completedQuests / totalQuests) * 264} 264`}
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
                  <span className="text-sm font-medium text-progress">18</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">미시작</span>
                  <span className="text-sm font-medium text-text-muted">{totalQuests - completedQuests - 18}</span>
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
                <button className="text-xs text-gold hover:text-gold-dim transition-colors">
                  전체 보기
                </button>
              </div>

              <div className="space-y-4">
                {traderProgress.map((trader) => {
                  const pct = ((trader.completed / trader.total) * 100).toFixed(0);
                  return (
                    <div key={trader.name} className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-xl bg-surface-alt flex items-center justify-center text-text-secondary text-xs font-semibold flex-shrink-0">
                        {trader.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm text-text">{trader.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-text-muted">{trader.completed}/{trader.total}</span>
                            <span className={cn(
                              'flex items-center text-[10px]',
                              trader.trend === 'up' ? 'text-complete' : 'text-incomplete'
                            )}>
                              {trader.trend === 'up' ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                              {pct}%
                            </span>
                          </div>
                        </div>
                        <ProgressBar value={trader.completed} max={trader.total} />
                      </div>
                    </div>
                  );
                })}
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
              <button className="text-xs text-gold hover:text-gold-dim transition-colors">
                See all
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mapProgress.map((m) => {
                const pct = ((m.completed / m.quests) * 100).toFixed(0);
                return (
                  <div
                    key={m.name}
                    className="bg-surface-alt rounded-xl p-4 hover:bg-elevated/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-text">{m.name}</span>
                      <span className="text-xs text-text-muted">{pct}%</span>
                    </div>
                    <ProgressBar value={m.completed} max={m.quests} color="bg-progress" />
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] uppercase text-text-muted">{m.quests} quests</span>
                      <span className="text-xs text-text-secondary">{m.completed} done</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </DebugOverlay>
      </div>
    </DebugOverlay>
  );
}
