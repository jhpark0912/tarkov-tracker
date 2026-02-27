import { useState } from 'react';
import { Check, CheckCheck } from 'lucide-react';
import { cn } from '../../../utils/cn';
import type { HideoutItemReq } from '../../../types/hideout';

interface ItemChecklistProps {
  items: HideoutItemReq[];
  itemCounts: Record<string, number>;
  onCountChange: (reqId: number, count: number) => void;
  isLoggedIn: boolean;
}

export default function ItemChecklist({ items, itemCounts, onCountChange, isLoggedIn }: ItemChecklistProps) {
  const allComplete = items.every((item) => (itemCounts[String(item.requirementId)] ?? 0) >= item.count);

  const handleCompleteAll = () => {
    const targetCount = allComplete ? 0 : -1; // -1 means set to max
    items.forEach((item) => {
      const newCount = targetCount === -1 ? item.count : 0;
      onCountChange(item.requirementId, newCount);
    });
  };

  return (
    <div className="space-y-2">
      {/* 전체 완료 버튼 */}
      {isLoggedIn && items.length > 1 && (
        <button
          onClick={handleCompleteAll}
          className={cn(
            'flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md transition-colors cursor-pointer mb-1',
            allComplete
              ? 'text-complete bg-complete/10 hover:bg-complete/20'
              : 'text-text-muted bg-surface-alt hover:text-text',
          )}
        >
          <CheckCheck size={12} />
          {allComplete ? '전체 초기화' : '전체 완료'}
        </button>
      )}

      {items.map((item) => {
        const collected = itemCounts[String(item.requirementId)] ?? 0;
        const isComplete = collected >= item.count;

        return (
          <ItemRow
            key={item.requirementId}
            item={item}
            collected={collected}
            isComplete={isComplete}
            isLoggedIn={isLoggedIn}
            onCountChange={onCountChange}
          />
        );
      })}
    </div>
  );
}

interface ItemRowProps {
  item: HideoutItemReq;
  collected: number;
  isComplete: boolean;
  isLoggedIn: boolean;
  onCountChange: (reqId: number, count: number) => void;
}

function ItemRow({ item, collected, isComplete, isLoggedIn, onCountChange }: ItemRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const handleStartEdit = () => {
    setEditValue(String(collected));
    setIsEditing(true);
  };

  const handleConfirmEdit = () => {
    const parsed = parseInt(editValue, 10);
    if (!isNaN(parsed)) {
      const clamped = Math.max(0, Math.min(item.count, parsed));
      onCountChange(item.requirementId, clamped);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleConfirmEdit();
    if (e.key === 'Escape') setIsEditing(false);
  };

  const handleToggleComplete = () => {
    onCountChange(item.requirementId, isComplete ? 0 : item.count);
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 bg-surface-alt rounded-lg px-3 py-2',
        isComplete && 'opacity-60',
      )}
    >
      {/* 완료 토글 체크박스 */}
      {isLoggedIn && (
        <button
          onClick={handleToggleComplete}
          className={cn(
            'w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer',
            isComplete
              ? 'bg-complete/20 border-complete text-complete'
              : 'border-border text-transparent hover:border-text-muted',
          )}
        >
          <Check size={12} />
        </button>
      )}

      {/* 아이콘 */}
      <div className="w-8 h-8 rounded bg-elevated flex items-center justify-center flex-shrink-0 overflow-hidden">
        {item.itemIconUrl ? (
          <img src={item.itemIconUrl} alt={item.itemName} className="w-7 h-7 object-contain" />
        ) : (
          <span className="text-[10px] text-text-muted">?</span>
        )}
      </div>

      {/* 이름 */}
      <div className="flex-1 min-w-0">
        <span className={cn('text-sm text-text truncate block', isComplete && 'line-through')}>
          {item.itemName}
        </span>
        {item.itemShortName && (
          <span className="text-[10px] text-text-muted">{item.itemShortName}</span>
        )}
      </div>

      {/* 카운터 */}
      {isLoggedIn ? (
        <div className="flex items-center gap-1">
          {isEditing ? (
            <input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleConfirmEdit}
              onKeyDown={handleKeyDown}
              min={0}
              max={item.count}
              autoFocus
              className="w-16 h-7 rounded bg-elevated border border-accent text-sm text-text text-center
                         [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                         focus:outline-none"
            />
          ) : (
            <button
              onClick={handleStartEdit}
              className={cn(
                'text-sm font-medium min-w-[3.5rem] text-center px-1.5 py-0.5 rounded',
                'hover:bg-elevated transition-colors cursor-pointer',
                isComplete ? 'text-complete' : 'text-text',
              )}
              title="클릭하여 수량 직접 입력"
            >
              {collected.toLocaleString()}/{item.count.toLocaleString()}
            </button>
          )}
        </div>
      ) : (
        <span className="text-sm text-text-muted">x{item.count.toLocaleString()}</span>
      )}
    </div>
  );
}
