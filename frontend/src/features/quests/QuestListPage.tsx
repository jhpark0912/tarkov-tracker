import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Crown, ChevronRight, List, GitBranch, ChevronDown, Check, Circle, Loader2, Compass, Network } from 'lucide-react';
import { cn } from '../../utils/cn';
import DebugOverlay from '../../components/debug/DebugOverlay';
import { useQuestStore } from '../../store/questStore';
import { useProgressStore } from '../../store/progressStore';
import { useAuthStore } from '../../store/authStore';
import type { QuestListItem } from '../../types/quest';

/* -- 상태 설정 -- */
const statusConfig: Record<string, { dot: string; text: string; label: string }> = {
  COMPLETED:   { dot: 'bg-complete',  text: 'text-complete',      label: '완료' },
  IN_PROGRESS: { dot: 'bg-progress',  text: 'text-progress',      label: '진행 중' },
  NOT_STARTED: { dot: 'bg-elevated',  text: 'text-text-muted',    label: '미시작' },
  LOCKED:      { dot: 'bg-elevated',  text: 'text-text-muted',    label: '잠김' },
};

/* -- 트리 타입 -- */
interface TreeNode { quest: QuestListItem; children: TreeNode[] }

// TODO: 선행조건 데이터가 API에서 제공되므로 추후 실제 트리 구조로 개선 가능
function buildQuestTree(quests: QuestListItem[]): Map<string, TreeNode[]> {
  const nodeMap = new Map(quests.map(q => [String(q.id), { quest: q, children: [] as TreeNode[] }]));
  const traderMap = new Map<string, TreeNode[]>();
  for (const node of nodeMap.values()) {
    const trader = node.quest.trader?.name ?? '기타';
    if (!traderMap.has(trader)) traderMap.set(trader, []);
    traderMap.get(trader)!.push(node);
  }
  return traderMap;
}

/* -- 트리 노드 -- */
function QuestTreeNode({ node, depth, userStatus }: { node: TreeNode; depth: number; userStatus: string }) {
  const { quest } = node;
  const isCompleted = userStatus === 'COMPLETED';
  const isInProgress = userStatus === 'IN_PROGRESS';
  const status = statusConfig[userStatus] ?? statusConfig['NOT_STARTED'];

  const inner = (
    <div className={cn('flex items-center gap-3 py-2 px-3 rounded-xl transition-colors group hover:bg-surface-alt cursor-pointer')}
      style={{ marginLeft: depth * 28 }}>
      {isCompleted ? (
        <div className="w-5 h-5 rounded-md bg-complete flex items-center justify-center flex-shrink-0"><Check size={12} className="text-bg" /></div>
      ) : isInProgress ? (
        <div className="w-5 h-5 rounded-md bg-progress/20 flex items-center justify-center flex-shrink-0"><Circle size={10} fill="var(--color-progress)" className="text-progress" /></div>
      ) : (
        <div className="w-5 h-5 rounded-md bg-elevated flex items-center justify-center flex-shrink-0"><Circle size={10} className="text-text-muted" /></div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn('text-sm font-medium truncate', isCompleted ? 'text-text-muted line-through' : 'text-text')}>{quest.name}</span>
          {quest.kappaRequired && <Crown size={12} className="text-gold flex-shrink-0" />}
          {quest.lightkeeperRequired && <Compass size={12} className="text-accent flex-shrink-0" />}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {quest.mapName && <span className="text-[10px] text-text-muted">{quest.mapName}</span>}
          <span className="text-[10px] text-text-muted">Lv.{quest.minPlayerLevel}</span>
        </div>
      </div>
      <span className={cn('text-[10px]', status.text)}>{status.label}</span>
    </div>
  );

  return (
    <div>
      <Link to={`/quests/${quest.id}`} className="no-underline">{inner}</Link>
      {node.children.map(c => <QuestTreeNode key={c.quest.id} node={c} depth={depth + 1} userStatus={userStatus} />)}
    </div>
  );
}

/* -- 트레이더 섹션 -- */
function TraderSection({ trader, nodes, questStatuses }: { trader: string; nodes: TreeNode[]; questStatuses: Record<string, string> }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-2">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-surface-alt transition-colors cursor-pointer">
        <div className="w-8 h-8 rounded-lg bg-surface-alt flex items-center justify-center text-text-secondary text-xs font-semibold flex-shrink-0">{trader.charAt(0)}</div>
        <span className="text-sm font-semibold text-text flex-1 text-left">{trader}</span>
        <ChevronDown size={14} className={cn('text-text-muted transition-transform', !open && '-rotate-90')} />
      </button>
      {open && (
        <div className="pl-2 pr-2 pb-2">
          {nodes.map(n => (
            <QuestTreeNode
              key={n.quest.id}
              node={n}
              depth={0}
              userStatus={questStatuses[String(n.quest.id)] ?? 'NOT_STARTED'}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* -- 메인 페이지 -- */
export default function QuestListPage() {
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('list');
  const [search, setSearch] = useState('');
  const [traderFilter, setTraderFilter] = useState('');
  const [mapFilter, setMapFilter] = useState('');
  const [kappaOnly, setKappaOnly] = useState(false);
  const [lightkeeperOnly, setLightkeeperOnly] = useState(false);

  const { quests, loading, error, fetchList } = useQuestStore();
  const { questStatuses, fetchProgress } = useProgressStore();
  const { token } = useAuthStore();

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    if (token) fetchProgress();
  }, [token, fetchProgress]);

  const filtered = useMemo(() => {
    return quests.filter(q => {
      if (search && !q.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (traderFilter && q.trader?.name !== traderFilter) return false;
      if (mapFilter && q.mapName !== mapFilter) return false;
      if (kappaOnly && !q.kappaRequired) return false;
      if (lightkeeperOnly && !q.lightkeeperRequired) return false;
      return true;
    });
  }, [quests, search, traderFilter, mapFilter, kappaOnly, lightkeeperOnly]);

  const traders = useMemo(() => [...new Set(quests.map(q => q.trader?.name).filter(Boolean))].sort(), [quests]);
  const maps = useMemo(() => [...new Set(quests.map(q => q.mapName).filter(Boolean))].sort(), [quests]);

  const traderTree = useMemo(() => buildQuestTree(filtered), [filtered]);

  return (
    <DebugOverlay id="quest-list-page" tag="div" label="QuestListPage" variant="feature">
      <div id="quest-list-page" className="max-w-7xl mx-auto space-y-6">

        {/* 필터 바 */}
        <DebugOverlay id="quest-filter" tag="div" label="QuestFilter" variant="component">
          <div id="quest-filter" className="bg-surface rounded-2xl p-4 border border-border">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-surface-alt rounded-xl px-4 py-2.5 flex-1 min-w-[200px]">
                <Search size={16} className="text-text-muted flex-shrink-0" />
                <input
                  type="text"
                  placeholder="퀘스트 검색..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm text-text placeholder:text-text-muted w-full"
                />
              </div>

              <select
                value={traderFilter}
                onChange={e => setTraderFilter(e.target.value)}
                className="bg-surface-alt text-text-secondary text-sm rounded-xl px-4 py-2.5 border-none outline-none appearance-none cursor-pointer">
                <option value="">전체 트레이더</option>
                {traders.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select
                value={mapFilter}
                onChange={e => setMapFilter(e.target.value)}
                className="bg-surface-alt text-text-secondary text-sm rounded-xl px-4 py-2.5 border-none outline-none appearance-none cursor-pointer">
                <option value="">전체 맵</option>
                {maps.map(m => <option key={m} value={m!}>{m}</option>)}
              </select>
              <button
                onClick={() => setKappaOnly(!kappaOnly)}
                className={cn('flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm transition-colors cursor-pointer',
                  kappaOnly ? 'bg-gold/20 text-gold' : 'bg-surface-alt text-text-secondary hover:text-gold')}>
                <Crown size={14} />카파
              </button>
              <button
                onClick={() => setLightkeeperOnly(!lightkeeperOnly)}
                className={cn('flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm transition-colors cursor-pointer',
                  lightkeeperOnly ? 'bg-accent/20 text-accent' : 'bg-surface-alt text-text-secondary hover:text-accent')}>
                <Compass size={14} />등대지기
              </button>

              <div className="flex items-center bg-surface-alt rounded-xl overflow-hidden">
                <button onClick={() => setViewMode('list')} className={cn('flex items-center gap-1.5 px-3 py-2.5 text-sm transition-colors cursor-pointer', viewMode === 'list' ? 'bg-gold/20 text-gold' : 'text-text-muted hover:text-text')}>
                  <List size={14} />
                </button>
                <button onClick={() => setViewMode('tree')} className={cn('flex items-center gap-1.5 px-3 py-2.5 text-sm transition-colors cursor-pointer', viewMode === 'tree' ? 'bg-gold/20 text-gold' : 'text-text-muted hover:text-text')}>
                  <GitBranch size={14} />
                </button>
              </div>
            </div>
          </div>
        </DebugOverlay>

        {/* 트리 시각화 네비게이션 */}
        <div className="flex gap-3">
          <Link
            to="/quests/tree/kappa"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gold/30 bg-gold/5 text-sm text-gold hover:bg-gold/10 transition-colors no-underline"
          >
            <Crown size={16} />
            카파 퀘스트 트리
          </Link>
          <Link
            to="/quests/tree/lightkeeper"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-accent/30 bg-accent/5 text-sm text-accent hover:bg-accent/10 transition-colors no-underline"
          >
            <Compass size={16} />
            등대지기 퀘스트 트리
          </Link>
          <Link
            to="/quests/tree/full"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface-alt/50 text-sm text-text-secondary hover:bg-surface-alt transition-colors no-underline"
          >
            <Network size={16} />
            전체 의존 트리
          </Link>
        </div>

        {/* 로딩 / 에러 */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-text-muted" />
          </div>
        )}
        {error && <p className="text-center text-sm text-red-400 py-4">{error}</p>}

        {/* 퀘스트 리스트뷰 */}
        {!loading && viewMode === 'list' && (
          <DebugOverlay id="quest-grid" tag="div" label="QuestGrid" variant="component">
            <div id="quest-grid" className="bg-surface rounded-2xl overflow-hidden border border-border">
              <div className="flex items-center justify-between px-6 py-3 border-b border-border">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">퀘스트 목록</h3>
                <span className="text-xs text-text-muted">{filtered.length}개</span>
              </div>
              <div className="grid grid-cols-12 gap-4 px-6 py-3 text-[10px] uppercase text-text-muted tracking-wider">
                <div className="col-span-4">퀘스트</div>
                <div className="col-span-2">트레이더</div>
                <div className="col-span-2">맵</div>
                <div className="col-span-1">레벨</div>
                <div className="col-span-2">상태</div>
                <div className="col-span-1"></div>
              </div>
              {filtered.map((quest, idx) => {
                const rawStatus = questStatuses[String(quest.id)] ?? 'NOT_STARTED';
                const status = statusConfig[rawStatus] ?? statusConfig['NOT_STARTED'];
                return (
                  <Link key={quest.id} to={`/quests/${quest.id}`}
                    className={cn('quest-card grid grid-cols-12 gap-4 px-6 py-4 items-center no-underline transition-colors hover:bg-surface-alt', idx > 0 && 'border-t border-elevated/50')}>
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-surface-alt flex items-center justify-center text-text-secondary text-xs font-semibold flex-shrink-0">
                        {quest.trader?.name?.charAt(0) ?? '?'}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-text">{quest.name}</span>
                        {quest.kappaRequired && <Crown size={12} className="text-gold flex-shrink-0" />}
                        {quest.lightkeeperRequired && <Compass size={12} className="text-accent flex-shrink-0" />}
                      </div>
                    </div>
                    <div className="col-span-2 text-sm text-text-secondary">{quest.trader?.name}</div>
                    <div className="col-span-2 text-sm text-text-secondary">{quest.mapName ?? '-'}</div>
                    <div className="col-span-1 text-sm text-text-muted">{quest.minPlayerLevel}</div>
                    <div className="col-span-2 flex items-center gap-2">
                      <div className={cn('w-1.5 h-1.5 rounded-full', status.dot)} />
                      <span className={cn('text-xs', status.text)}>{status.label}</span>
                    </div>
                    <div className="col-span-1 flex justify-end"><ChevronRight size={16} className="text-text-muted" /></div>
                  </Link>
                );
              })}
            </div>
          </DebugOverlay>
        )}

        {/* 퀘스트 트리뷰 */}
        {!loading && viewMode === 'tree' && (
          <DebugOverlay id="quest-tree" tag="div" label="QuestTree" variant="component">
            <div id="quest-tree" className="bg-surface rounded-2xl p-4 border border-border">
              {Array.from(traderTree.entries()).map(([trader, nodes]) => (
                <TraderSection key={trader} trader={trader} nodes={nodes} questStatuses={questStatuses} />
              ))}
            </div>
          </DebugOverlay>
        )}
      </div>
    </DebugOverlay>
  );
}
