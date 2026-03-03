import * as Progress from '@radix-ui/react-progress';
import * as Checkbox from '@radix-ui/react-checkbox';
import { Check, Package } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useProgressStore } from '../../../store/progressStore';
import { useAuthStore } from '../../../store/authStore';
import type { QuestObjectiveDto, RequiredItem } from '../../../types/quest';

/** 복합 키 생성: `${objectiveId}_${itemId}` */
function itemKey(objectiveId: number, itemId: number): string {
  return `${objectiveId}_${itemId}`;
}

/**
 * 총 수집량에서 각 아이템별 체크 상태 유도 (초기 로드 fallback용).
 * 복합 키가 없는 경우에만 사용.
 */
function deriveItemStatesFromTotal(requiredItems: RequiredItem[], totalCollected: number): boolean[] {
  let remaining = totalCollected;
  return requiredItems.map((ri) => {
    if (remaining >= ri.count) {
      remaining -= ri.count;
      return true;
    }
    return false;
  });
}

function getItemChecked(
  objectiveId: number,
  ri: RequiredItem,
  idx: number,
  allItems: RequiredItem[],
  itemCounts: Record<string, number>,
): boolean {
  const cKey = itemKey(objectiveId, ri.item.id);
  if (cKey in itemCounts) return (itemCounts[cKey] ?? 0) >= ri.count;
  const total = itemCounts[String(objectiveId)] ?? 0;
  return deriveItemStatesFromTotal(allItems, total)[idx];
}

interface QuestObjectiveListProps {
  objectives: QuestObjectiveDto[];
}

export default function QuestObjectiveList({ objectives }: QuestObjectiveListProps) {
  const { itemCounts, updateItemCount, updateIndividualItemCount } = useProgressStore();
  const { token } = useAuthStore();

  return (
    <div className="space-y-3">
      {objectives.map((obj) => {
        const isItemObj = obj.requiredItems.length > 0;
        const collected = itemCounts[String(obj.id)] ?? 0;
        const totalRequired = isItemObj
          ? obj.requiredItems.reduce((sum, ri) => sum + ri.count, 0)
          : 1;
        const isObjDone = collected >= totalRequired;

        return (
          <div
            key={obj.id}
            className={cn('flex items-start gap-3 p-3 rounded-xl', isObjDone ? 'bg-complete/5' : 'bg-surface-alt')}
          >
            <Checkbox.Root
              checked={isObjDone}
              onCheckedChange={
                isItemObj ? undefined : () => token && updateItemCount(obj.id, isObjDone ? 0 : 1)
              }
              className={cn(
                'w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors',
                isObjDone ? 'bg-complete' : 'bg-elevated',
                !isItemObj && token && 'cursor-pointer',
              )}
            >
              <Checkbox.Indicator>
                <Check size={12} className="text-bg" />
              </Checkbox.Indicator>
            </Checkbox.Root>

            <div className="flex-1">
              <p className={cn('text-sm', isObjDone ? 'text-text-muted line-through' : 'text-text')}>
                {obj.description}
                {obj.optional && <span className="ml-1 text-[10px] text-text-muted">(선택)</span>}
              </p>

              {/* 아이템 목표: 아이템별 독립 체크박스 */}
              {isItemObj && (
                <div className="mt-2 space-y-1">
                  {obj.requiredItems.map((ri, idx) => {
                    const isItemChecked = getItemChecked(obj.id, ri, idx, obj.requiredItems, itemCounts);
                    return (
                      <div key={ri.item.id} className="flex items-center gap-2">
                        {token && (
                          <Checkbox.Root
                            checked={isItemChecked}
                            onCheckedChange={() => {
                              const currentTotal = itemCounts[String(obj.id)] ?? 0;
                              const fallback = deriveItemStatesFromTotal(obj.requiredItems, currentTotal);
                              const updates: Record<string, number> = {};
                              obj.requiredItems.forEach((item, i) => {
                                const k = itemKey(obj.id, item.item.id);
                                updates[k] = k in itemCounts ? (itemCounts[k] ?? 0) : (fallback[i] ? item.count : 0);
                              });
                              const cKey = itemKey(obj.id, ri.item.id);
                              updates[cKey] = isItemChecked ? 0 : ri.count;
                              const newTotal = obj.requiredItems.reduce(
                                (sum, item) => sum + (updates[itemKey(obj.id, item.item.id)] ?? 0),
                                0,
                              );
                              updateIndividualItemCount(obj.id, updates, newTotal);
                            }}
                            className={cn(
                              'w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer',
                              isItemChecked ? 'bg-complete' : 'bg-elevated',
                            )}
                          >
                            <Checkbox.Indicator>
                              <Check size={10} className="text-bg" />
                            </Checkbox.Indicator>
                          </Checkbox.Root>
                        )}
                        {ri.item.iconUrl ? (
                          <img src={ri.item.iconUrl} alt={ri.item.name} className="w-6 h-6 rounded object-contain bg-elevated" />
                        ) : (
                          <Package size={16} className="text-text-muted" />
                        )}
                        <span className={cn('text-xs flex-1 truncate', isItemChecked ? 'text-text-muted line-through' : 'text-text-secondary')}>
                          {ri.item.name}
                          {ri.foundInRaid && <span className="ml-1 text-[10px] text-complete">(FIR)</span>}
                        </span>
                        <span className={cn('text-xs font-mono', isItemChecked ? 'text-complete' : 'text-text-muted')}>
                          ×{ri.count}
                        </span>
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
  );
}
