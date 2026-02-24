import { useMemo, useState } from 'react';
import { Crown, X } from 'lucide-react';
import { cn } from '../../../utils/cn';
import type { QuestMapMarker } from '../../../types/map';

interface QuestEntry {
  questId: number;
  questName: string;
  traderName: string | null;
  kappaRequired: boolean;
  markerCount: number;
}

interface Props {
  markers: QuestMapMarker[];
  selectedQuestIds: Set<number>;
  onToggleQuest: (questId: number) => void;
  onClearSelection: () => void;
  onClose: () => void;
}

export default function MapQuestPanel({
  markers,
  selectedQuestIds,
  onToggleQuest,
  onClearSelection,
  onClose,
}: Props) {
  const [kappaOnly, setKappaOnly] = useState(false);

  const quests = useMemo<QuestEntry[]>(() => {
    const map = new Map<number, QuestEntry>();
    markers.forEach((m) => {
      if (!map.has(m.questId)) {
        map.set(m.questId, {
          questId: m.questId,
          questName: m.questName,
          traderName: m.traderName ?? null,
          kappaRequired: m.kappaRequired,
          markerCount: 0,
        });
      }
      map.get(m.questId)!.markerCount++;
    });
    return Array.from(map.values())
      .filter((q) => !kappaOnly || q.kappaRequired)
      .sort((a, b) => a.questName.localeCompare(b.questName));
  }, [markers, kappaOnly]);

  return (
    <div className="w-60 bg-surface border border-border rounded-2xl flex flex-col shrink-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border shrink-0">
        <span className="text-xs font-semibold text-text">퀘스트 {quests.length}개</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setKappaOnly((v) => !v)}
            title="카파 전용"
            className={cn(
              'p-1 rounded-lg transition-colors',
              kappaOnly ? 'bg-gold/20 text-gold' : 'text-text-muted hover:text-gold'
            )}
          >
            <Crown size={13} />
          </button>
          {selectedQuestIds.size > 0 && (
            <button
              onClick={onClearSelection}
              className="text-[10px] px-1.5 py-0.5 rounded bg-surface-alt text-text-muted hover:text-text transition-colors"
            >
              초기화
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-text-muted hover:text-text transition-colors"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Quest list */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {quests.length === 0 ? (
          <p className="text-center text-[11px] text-text-muted py-8">
            {kappaOnly ? '카파 퀘스트 없음' : '퀘스트 없음'}
          </p>
        ) : (
          quests.map((q) => {
            const selected = selectedQuestIds.has(q.questId);
            return (
              <button
                key={q.questId}
                onClick={() => onToggleQuest(q.questId)}
                className={cn(
                  'w-full flex items-start gap-2 px-3 py-2 text-left border-b border-border/40 transition-colors',
                  selected ? 'bg-gold/10' : 'hover:bg-surface-alt'
                )}
              >
                <div
                  className={cn(
                    'mt-0.5 w-3 h-3 rounded shrink-0 border transition-colors',
                    selected ? 'bg-gold border-gold' : 'border-elevated'
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p className={cn('text-[11px] leading-tight', selected ? 'text-gold' : 'text-text')}>
                    {q.questName}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {q.traderName && (
                      <span className="text-[9px] text-text-muted truncate">{q.traderName}</span>
                    )}
                    {q.kappaRequired && <Crown size={8} className="text-gold shrink-0" />}
                    <span className="text-[9px] text-elevated ml-auto shrink-0">{q.markerCount}</span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Footer */}
      {selectedQuestIds.size > 0 && (
        <div className="px-3 py-2 border-t border-border shrink-0">
          <p className="text-[10px] text-gold">{selectedQuestIds.size}개 퀘스트 선택됨</p>
        </div>
      )}
    </div>
  );
}
