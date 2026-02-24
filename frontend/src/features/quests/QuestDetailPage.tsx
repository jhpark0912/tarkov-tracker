import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Crown, ExternalLink, MapPin, Check, Circle, Package, Loader2 } from 'lucide-react';
import * as Progress from '@radix-ui/react-progress';
import * as Checkbox from '@radix-ui/react-checkbox';
import { cn } from '../../utils/cn';
import DebugOverlay from '../../components/debug/DebugOverlay';
import { useQuestStore } from '../../store/questStore';
import { useProgressStore } from '../../store/progressStore';
import { useAuthStore } from '../../store/authStore';
import type { QuestStatus } from '../../types/progress';

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  COMPLETED:   { bg: 'bg-complete/20',  text: 'text-complete',  label: '완료' },
  IN_PROGRESS: { bg: 'bg-progress/20',  text: 'text-progress',  label: '진행 중' },
  NOT_STARTED: { bg: 'bg-elevated',     text: 'text-text-muted',label: '미시작' },
};

export default function QuestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const questId = Number(id);

  const { currentDetail: quest, loading, error, fetchDetail, clearDetail } = useQuestStore();
  const { questStatuses, itemCounts, updateQuestStatus, updateItemCount, fetchProgress } = useProgressStore();
  const { token } = useAuthStore();

  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    fetchDetail(questId);
    return () => clearDetail();
  }, [questId, fetchDetail, clearDetail]);

  useEffect(() => {
    if (token) fetchProgress();
  }, [token, fetchProgress]);

  const userStatus: QuestStatus = (questStatuses[String(questId)] ?? 'NOT_STARTED') as QuestStatus;
  const statusCfg = statusConfig[userStatus] ?? statusConfig['NOT_STARTED'];

  const handleStatusChange = async (newStatus: QuestStatus) => {
    if (!token || statusUpdating) return;
    setStatusUpdating(true);
    try {
      await updateQuestStatus(questId, newStatus);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleItemCount = async (objectiveId: number, maxCount: number, delta: number) => {
    if (!token) return;
    const current = itemCounts[String(objectiveId)] ?? 0;
    const next = Math.max(0, Math.min(maxCount, current + delta));
    await updateItemCount(objectiveId, next);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={32} className="animate-spin text-text-muted" />
      </div>
    );
  }

  if (error || !quest) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <p className="text-text-muted text-sm">{error ?? '퀘스트를 찾을 수 없습니다.'}</p>
        <Link to="/quests" className="mt-4 inline-block text-sm text-text-secondary hover:text-text no-underline">← 목록으로</Link>
      </div>
    );
  }

  const completedObjectives = quest.objectives.filter(o => {
    // 아이템 목표: itemCounts로 판단, 그 외는 퀘스트 완료 여부로
    if (o.requiredItems.length > 0) {
      const totalRequired = o.requiredItems.reduce((sum, ri) => sum + ri.count, 0);
      return (itemCounts[String(o.id)] ?? 0) >= totalRequired;
    }
    return userStatus === 'COMPLETED';
  });

  return (
    <DebugOverlay id="quest-detail-page" tag="div" label="QuestDetailPage" variant="feature">
      <div id="quest-detail-page" className="max-w-4xl mx-auto space-y-6">

        <Link to="/quests" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text no-underline transition-colors">
          <ArrowLeft size={16} />
          퀘스트 목록으로
        </Link>

        {/* Quest header card */}
        <DebugOverlay id="quest-info" tag="div" label="QuestInfo" variant="component">
          <div id="quest-info" className="bg-surface rounded-2xl p-6 border border-border">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center text-gold text-lg font-semibold">
                  {quest.trader?.name?.charAt(0) ?? '?'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-semibold text-text">{quest.name}</h1>
                    {quest.kappaRequired && <Crown size={16} className="text-gold" />}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-text-secondary mt-1 flex-wrap">
                    <span>{quest.trader?.name}</span>
                    {quest.map && <><span className="w-1 h-1 rounded-full bg-elevated" /><span>{quest.map.name}</span></>}
                    <span className="w-1 h-1 rounded-full bg-elevated" />
                    <span>레벨 {quest.minPlayerLevel}+</span>
                    <span className="w-1 h-1 rounded-full bg-elevated" />
                    <span>+{quest.experience} EXP</span>
                  </div>
                </div>
              </div>

              {/* 상태 변경 버튼 (로그인 시) */}
              {token && (
                <div className="flex flex-col gap-1.5 items-end">
                  <span className={cn('flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg', statusCfg.bg, statusCfg.text)}>
                    <Circle size={8} fill="currentColor" />
                    {statusCfg.label}
                  </span>
                  <div className="flex gap-1">
                    {(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'] as QuestStatus[])
                      .filter(s => s !== userStatus)
                      .map(s => (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(s)}
                          disabled={statusUpdating}
                          className={cn('text-[10px] px-2 py-1 rounded-lg transition-colors cursor-pointer',
                            s === 'COMPLETED' ? 'bg-complete/20 text-complete hover:bg-complete/30' :
                            s === 'IN_PROGRESS' ? 'bg-progress/20 text-progress hover:bg-progress/30' :
                            'bg-elevated text-text-muted hover:bg-elevated/70')}>
                          {statusConfig[s].label}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Progress bar */}
            {quest.objectives.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-text-muted uppercase">목표 진행률</span>
                  <span className="text-xs text-text-secondary">{completedObjectives.length}/{quest.objectives.length}</span>
                </div>
                <Progress.Root className="h-2 w-full bg-elevated rounded-full overflow-hidden">
                  <Progress.Indicator
                    className="h-full bg-complete rounded-full transition-all duration-500"
                    style={{ width: `${(completedObjectives.length / quest.objectives.length) * 100}%` }}
                  />
                </Progress.Root>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
              {quest.wikiLink && (
                <a href={quest.wikiLink} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs bg-surface-alt hover:bg-elevated text-text-secondary px-4 py-2 rounded-xl no-underline transition-colors">
                  <ExternalLink size={14} />위키
                </a>
              )}
              {quest.map && (
                <Link to={`/map/${quest.map.normalizedName}`}
                  className="flex items-center gap-2 text-xs bg-surface-alt hover:bg-elevated text-text-secondary px-4 py-2 rounded-xl no-underline transition-colors">
                  <MapPin size={14} />맵에서 보기
                </Link>
              )}
            </div>
          </div>
        </DebugOverlay>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Objectives */}
          <DebugOverlay id="quest-objectives" tag="div" label="QuestObjectives" variant="component">
            <div id="quest-objectives" className="bg-surface rounded-2xl p-6 border border-border">
              <h2 className="text-base font-semibold text-text mb-4">목표 ({quest.objectives.length})</h2>
              <div className="space-y-3">
                {quest.objectives.map((obj) => {
                  const isItemObj = obj.requiredItems.length > 0;
                  const collected = itemCounts[String(obj.id)] ?? 0;
                  const totalRequired = isItemObj
                    ? obj.requiredItems.reduce((sum, ri) => sum + ri.count, 0)
                    : 1;
                  const isObjDone = isItemObj
                    ? collected >= totalRequired
                    : userStatus === 'COMPLETED';

                  return (
                    <div key={obj.id}
                      className={cn('flex items-start gap-3 p-3 rounded-xl', isObjDone ? 'bg-complete/5' : 'bg-surface-alt')}>
                      <Checkbox.Root
                        checked={isObjDone}
                        onCheckedChange={isItemObj ? undefined : () =>
                          token && handleStatusChange(isObjDone ? 'IN_PROGRESS' : 'COMPLETED')}
                        className={cn('w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors',
                          isObjDone ? 'bg-complete' : 'bg-elevated', !isItemObj && token && 'cursor-pointer')}>
                        <Checkbox.Indicator>
                          <Check size={12} className="text-bg" />
                        </Checkbox.Indicator>
                      </Checkbox.Root>
                      <div className="flex-1">
                        <p className={cn('text-sm', isObjDone ? 'text-text-muted line-through' : 'text-text')}>
                          {obj.description}
                          {obj.optional && <span className="ml-1 text-[10px] text-text-muted">(선택)</span>}
                        </p>

                        {/* 아이템 목표: 수량 컨트롤 */}
                        {isItemObj && (
                          <div className="mt-2 space-y-1">
                            {obj.requiredItems.map(ri => {
                              const itemCollected = itemCounts[String(obj.id)] ?? 0;
                              return (
                                <div key={ri.item.id} className="flex items-center gap-2">
                                  {ri.item.iconUrl
                                    ? <img src={ri.item.iconUrl} alt={ri.item.name} className="w-6 h-6 rounded object-contain bg-elevated" />
                                    : <Package size={16} className="text-text-muted" />}
                                  <span className="text-xs text-text-secondary flex-1 truncate">
                                    {ri.item.name}
                                    {ri.foundInRaid && <span className="ml-1 text-[10px] text-complete">(FIR)</span>}
                                  </span>
                                  {token ? (
                                    <div className="flex items-center gap-1">
                                      <button onClick={() => handleItemCount(obj.id, ri.count, -1)}
                                        className="w-5 h-5 rounded bg-elevated text-text-muted hover:text-text text-xs cursor-pointer">-</button>
                                      <span className="text-xs font-mono text-text-secondary w-10 text-center">
                                        {itemCollected}/{ri.count}
                                      </span>
                                      <button onClick={() => handleItemCount(obj.id, ri.count, 1)}
                                        className="w-5 h-5 rounded bg-elevated text-text-muted hover:text-text text-xs cursor-pointer">+</button>
                                    </div>
                                  ) : (
                                    <span className="text-xs font-mono text-text-muted">×{ri.count}</span>
                                  )}
                                </div>
                              );
                            })}
                            <Progress.Root className="h-1 w-full bg-elevated rounded-full overflow-hidden mt-1">
                              <Progress.Indicator
                                className="h-full bg-complete rounded-full"
                                style={{ width: `${Math.min(100, (collected / totalRequired) * 100)}%` }}
                              />
                            </Progress.Root>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </DebugOverlay>

          <div className="space-y-6">
            {/* Prerequisites */}
            {quest.prerequisites.length > 0 && (
              <DebugOverlay id="quest-prerequisites" tag="div" label="QuestPrerequisites" variant="component">
                <div id="quest-prerequisites" className="bg-surface rounded-2xl p-6 border border-border">
                  <h2 className="text-base font-semibold text-text mb-4">선행 퀘스트</h2>
                  <div className="space-y-2">
                    {quest.prerequisites.map(p => {
                      const preStatus = questStatuses[String(p.id)] ?? 'NOT_STARTED';
                      const isPreDone = preStatus === 'COMPLETED';
                      return (
                        <Link key={p.id} to={`/quests/${p.id}`}
                          className={cn('flex items-center gap-3 p-3 rounded-xl no-underline transition-colors hover:bg-surface-alt',
                            isPreDone ? 'bg-complete/5' : 'bg-surface-alt')}>
                          <div className={cn('w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0',
                            isPreDone ? 'bg-complete' : 'bg-elevated')}>
                            {isPreDone
                              ? <Check size={12} className="text-bg" />
                              : <Circle size={10} className="text-text-muted" />}
                          </div>
                          <span className={cn('text-sm', isPreDone ? 'text-text-muted' : 'text-text')}>{p.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </DebugOverlay>
            )}

            {/* Quest info summary */}
            <div className="bg-surface rounded-2xl p-6 border border-border">
              <h2 className="text-base font-semibold text-text mb-4">퀘스트 정보</h2>
              <div className="space-y-2 text-sm text-text-secondary">
                <div className="flex justify-between"><span className="text-text-muted">목표 수</span><span>{quest.objectives.length}</span></div>
                <div className="flex justify-between"><span className="text-text-muted">아이템 목표 수</span><span>{quest.objectives.filter(o => o.requiredItems.length > 0).length}</span></div>
                <div className="flex justify-between"><span className="text-text-muted">선행 퀘스트</span><span>{quest.prerequisites.length}</span></div>
                <div className="flex justify-between"><span className="text-text-muted">경험치</span><span>+{quest.experience}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DebugOverlay>
  );
}
