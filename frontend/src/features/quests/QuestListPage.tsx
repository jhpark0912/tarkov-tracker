import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Crown, ChevronRight, List, GitBranch, ChevronDown, Check, Circle, BookOpen, Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import DebugOverlay from '../../components/debug/DebugOverlay';
import { useQuestStore } from '../../store/questStore';
import { useProgressStore } from '../../store/progressStore';
import { useAuthStore } from '../../store/authStore';
import type { QuestListItem } from '../../types/quest';

/* ── 상태 설정 ── */
const statusConfig: Record<string, { dot: string; text: string; label: string }> = {
  COMPLETED:   { dot: 'bg-complete',  text: 'text-complete',      label: '완료' },
  IN_PROGRESS: { dot: 'bg-progress',  text: 'text-progress',      label: '진행 중' },
  NOT_STARTED: { dot: 'bg-elevated',  text: 'text-text-muted',    label: '미시작' },
  LOCKED:      { dot: 'bg-elevated',  text: 'text-text-muted',    label: '잠김' },
};

/* ── 메인 스토리 챕터 (고정 데이터) ── */
interface StoryChapter {
  id: string; chapter: number; name: string; nameKo: string;
  map: string; giver: string; description: string; status: string; prerequisiteIds: string[];
}

const storyChapters: StoryChapter[] = [
  { id: 's1', chapter: 1, name: 'Tour',                    nameKo: '투어',             map: 'Ground Zero', giver: 'Mechanic',    description: 'BEAR 특수부대의 TerraGroup 사옥 강습 직후 Ground Zero를 탐색하며 스토리를 시작한다.',                status: 'COMPLETED',   prerequisiteIds: [] },
  { id: 's2', chapter: 2, name: 'Falling Skies',           nameKo: '추락하는 하늘',    map: 'Woods',       giver: 'Mechanic',    description: 'Mechanic의 의뢰로 Woods에 추락한 의문의 항공기를 조사하고 블랙박스를 회수한다.',                    status: 'COMPLETED',   prerequisiteIds: ['s1'] },
  { id: 's3', chapter: 3, name: 'Batya',                   nameKo: '바탸',             map: 'Customs',     giver: 'Prapor',      description: 'BEAR 지휘관 "바탸"의 행적을 추적하며 타르코프에 남겨진 흔적을 수집한다.',                            status: 'IN_PROGRESS', prerequisiteIds: ['s2'] },
  { id: 's4', chapter: 4, name: 'The Unheard',             nameKo: '들리지 않는 것들', map: 'Lighthouse',  giver: 'Lightkeeper', description: 'Lightkeeper의 지시로 Lighthouse 일대에서 TerraGroup의 비밀 통신 장비를 추적한다.',                  status: 'LOCKED',      prerequisiteIds: ['s3'] },
  { id: 's5', chapter: 5, name: 'Blue Fire',               nameKo: '파란 불꽃',        map: 'Shoreline',   giver: 'Therapist',   description: 'Shoreline 연구시설에서 목격된 파란 불꽃의 정체와 TerraGroup 실험의 진실에 접근한다.',                status: 'LOCKED',      prerequisiteIds: ['s4'] },
  { id: 's6', chapter: 6, name: 'They Are Already Here',   nameKo: '그들은 이미 여기', map: 'Streets',     giver: 'Peacekeeper', description: 'Streets of Tarkov에서 외부 세력의 침투를 저지하고 도시 내 작전을 수행한다.',                         status: 'LOCKED',      prerequisiteIds: ['s5'] },
  { id: 's7', chapter: 7, name: 'Accidental Witness',      nameKo: '우연한 목격자',    map: 'Reserve',     giver: 'Mechanic',    description: 'Reserve 기지에서 TerraGroup의 실험을 목격한 증인의 흔적을 찾아 진실을 파헤친다.',                   status: 'LOCKED',      prerequisiteIds: ['s6'] },
  { id: 's8', chapter: 8, name: 'The Labyrinth',           nameKo: '미로',             map: 'The Lab',     giver: 'Skier',       description: 'The Lab 깊숙한 곳에서 TerraGroup가 개발한 자극제 실험과 인체 실험의 진상을 밝힌다.',                status: 'LOCKED',      prerequisiteIds: ['s7'] },
  { id: 's9', chapter: 9, name: 'The Ticket',              nameKo: '탈출구',           map: 'Terminal',    giver: 'Prapor',      description: '타르코프 탈출의 열쇠인 "티켓"을 찾아 최후의 선택을 하라. 4가지 결말이 기다린다.',                   status: 'LOCKED',      prerequisiteIds: ['s8'] },
];

/* ── 트리 타입 ── */
interface TreeNode { quest: QuestListItem; children: TreeNode[] }

function buildQuestTree(quests: QuestListItem[]): Map<string, TreeNode[]> {
  const nodeMap = new Map(quests.map(q => [String(q.id), { quest: q, children: [] as TreeNode[] }]));
  // 트리 빌드는 선행 조건 정보가 없으므로 트레이더별 flat 목록으로 표시
  const traderMap = new Map<string, TreeNode[]>();
  for (const node of nodeMap.values()) {
    const trader = node.quest.trader?.name ?? '기타';
    if (!traderMap.has(trader)) traderMap.set(trader, []);
    traderMap.get(trader)!.push(node);
  }
  return traderMap;
}

/* ── 트리 노드 ── */
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

/* ── 트레이더 섹션 ── */
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

/* ── 스토리 섹션 ── */
function StorySection() {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-4">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-violet-500/10 transition-colors cursor-pointer">
        <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0"><BookOpen size={14} className="text-violet-400" /></div>
        <span className="text-sm font-semibold text-violet-300 flex-1 text-left">메인 스토리</span>
        <span className="text-[10px] text-violet-400 mr-2">{storyChapters.filter(c => c.status === 'COMPLETED').length}/{storyChapters.length} 완료</span>
        <ChevronDown size={14} className={cn('text-text-muted transition-transform', !open && '-rotate-90')} />
      </button>
      {open && (
        <div className="pl-2 pr-2 pb-2 space-y-0.5">
          {storyChapters.map((ch) => {
            const isLocked = ch.status === 'LOCKED';
            const isCompleted = ch.status === 'COMPLETED';
            const isInProgress = ch.status === 'IN_PROGRESS';
            const status = statusConfig[ch.status];
            return (
              <div key={ch.id} className={cn('flex items-center gap-3 py-2.5 px-3 rounded-xl transition-colors', isLocked ? 'opacity-50' : 'hover:bg-violet-500/5 cursor-pointer')}>
                <div className={cn('w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 text-[10px] font-bold',
                  isCompleted ? 'bg-complete text-bg' : isInProgress ? 'bg-violet-500/30 text-violet-300' : 'bg-elevated text-text-muted')}>
                  {isCompleted ? <Check size={12} className="text-bg" /> : <span>{ch.chapter}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn('text-sm font-medium', isCompleted ? 'text-text-muted line-through' : isLocked ? 'text-text-muted' : 'text-text')}>{ch.name}</span>
                    <span className="text-[10px] text-violet-400/70">({ch.nameKo})</span>
                  </div>
                  <p className="text-[10px] text-text-muted mt-0.5 line-clamp-1">{ch.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-text-muted">{ch.map}</span>
                    <span className="text-[10px] text-text-muted">· {ch.giver}</span>
                  </div>
                </div>
                <span className={cn('text-[10px] flex-shrink-0', status.text)}>{status.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── 메인 페이지 ── */
export default function QuestListPage() {
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('list');
  const [questType, setQuestType] = useState<'all' | 'story' | 'trader'>('all');
  const [search, setSearch] = useState('');
  const [traderFilter, setTraderFilter] = useState('');
  const [mapFilter, setMapFilter] = useState('');
  const [kappaOnly, setKappaOnly] = useState(false);

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
      return true;
    });
  }, [quests, search, traderFilter, mapFilter, kappaOnly]);

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

              {/* 퀘스트 유형 탭 */}
              <div className="flex items-center bg-surface-alt rounded-xl overflow-hidden">
                {([['all', '전체'], ['story', '스토리'], ['trader', '트레이더']] as const).map(([val, label]) => (
                  <button key={val} onClick={() => setQuestType(val)}
                    className={cn('px-3 py-2.5 text-xs font-medium transition-colors cursor-pointer',
                      questType === val ? 'bg-gold/20 text-gold' : 'text-text-muted hover:text-text')}>
                    {label}
                  </button>
                ))}
              </div>

              {questType !== 'story' && (
                <>
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
                </>
              )}

              {questType !== 'story' && (
                <div className="flex items-center bg-surface-alt rounded-xl overflow-hidden">
                  <button onClick={() => setViewMode('list')} className={cn('flex items-center gap-1.5 px-3 py-2.5 text-sm transition-colors cursor-pointer', viewMode === 'list' ? 'bg-gold/20 text-gold' : 'text-text-muted hover:text-text')}>
                    <List size={14} />
                  </button>
                  <button onClick={() => setViewMode('tree')} className={cn('flex items-center gap-1.5 px-3 py-2.5 text-sm transition-colors cursor-pointer', viewMode === 'tree' ? 'bg-gold/20 text-gold' : 'text-text-muted hover:text-text')}>
                    <GitBranch size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </DebugOverlay>

        {/* 로딩 / 에러 */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-text-muted" />
          </div>
        )}
        {error && <p className="text-center text-sm text-red-400 py-4">{error}</p>}

        {/* 스토리 퀘스트 뷰 */}
        {!loading && (questType === 'all' || questType === 'story') && (
          <DebugOverlay id="story-section" tag="div" label="StorySection" variant="component">
            <div id="story-section" className="bg-surface rounded-2xl p-4 border border-border border-violet-500/10">
              {questType === 'all' && (
                <div className="flex items-center gap-2 mb-3 px-2">
                  <BookOpen size={14} className="text-violet-400" />
                  <h3 className="text-xs font-semibold text-violet-300 uppercase tracking-wider">메인 스토리 챕터</h3>
                </div>
              )}
              <StorySection />
            </div>
          </DebugOverlay>
        )}

        {/* 트레이더 퀘스트: 리스트뷰 */}
        {!loading && (questType === 'all' || questType === 'trader') && viewMode === 'list' && (
          <DebugOverlay id="quest-grid" tag="div" label="QuestGrid" variant="component">
            <div id="quest-grid" className="bg-surface rounded-2xl overflow-hidden border border-border">
              {questType === 'all' && (
                <div className="flex items-center justify-between px-6 py-3 border-b border-border">
                  <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">트레이더 퀘스트</h3>
                  <span className="text-xs text-text-muted">{filtered.length}개</span>
                </div>
              )}
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

        {/* 트레이더 퀘스트: 트리뷰 */}
        {!loading && (questType === 'all' || questType === 'trader') && viewMode === 'tree' && (
          <DebugOverlay id="quest-tree" tag="div" label="QuestTree" variant="component">
            <div id="quest-tree" className="bg-surface rounded-2xl p-4 border border-border">
              {questType === 'all' && (
                <div className="flex items-center gap-2 mb-3 px-2">
                  <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">트레이더 퀘스트</h3>
                </div>
              )}
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
