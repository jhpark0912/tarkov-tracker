import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Crown, Compass, Check, Circle } from 'lucide-react';
import { cn } from '../../../utils/cn';
import type { QuestNodeData } from '../types';

function QuestNode({ data, selected }: NodeProps & { data: QuestNodeData }) {
  const isCompleted = data.status === 'COMPLETED';
  const isInProgress = data.status === 'IN_PROGRESS';

  return (
    <div
      className={cn(
        'px-3 py-2 rounded-lg border min-w-[180px] max-w-[220px] transition-all',
        isCompleted
          ? 'border-complete/60 bg-complete/10'
          : isInProgress
            ? 'border-progress/60 bg-progress/10'
            : 'border-border bg-surface',
        selected && 'ring-2 ring-accent',
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-border !w-2 !h-2" />
      <div className="flex items-center gap-1.5 mb-0.5">
        {isCompleted ? (
          <div className="w-4 h-4 rounded bg-complete flex items-center justify-center shrink-0">
            <Check size={10} className="text-bg" />
          </div>
        ) : isInProgress ? (
          <Circle size={12} fill="var(--color-progress)" className="text-progress shrink-0" />
        ) : (
          <Circle size={12} className="text-text-muted shrink-0" />
        )}
        <p className={cn('text-xs font-medium leading-tight truncate', isCompleted && 'text-text-muted line-through')}>
          {data.label}
        </p>
      </div>
      <div className="flex items-center gap-2 text-[10px] text-text-muted">
        {data.traderName && <span>{data.traderName}</span>}
        <span>Lv.{data.minPlayerLevel}</span>
        {data.kappaRequired && <Crown size={10} className="text-gold" />}
        {data.lightkeeperRequired && <Compass size={10} className="text-accent" />}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-border !w-2 !h-2" />
    </div>
  );
}

export default memo(QuestNode);
