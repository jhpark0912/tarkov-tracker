import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Flag } from 'lucide-react';
import { cn } from '../../../utils/cn';
import type { StoryNodeData } from '../types';

function StoryEndingNode({ data, selected }: NodeProps & { data: StoryNodeData }) {
  const colorClass = data.endingColor ?? 'text-text';

  return (
    <div
      className={cn(
        'px-4 py-3 rounded-xl border-2 min-w-[200px] max-w-[240px] transition-all',
        data.completed
          ? 'border-complete bg-complete/10'
          : 'border-border bg-elevated/80',
        selected && 'ring-2 ring-accent',
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-border !w-2 !h-2" />
      <div className="flex items-center gap-2">
        <Flag size={14} className={cn(colorClass, 'shrink-0')} />
        <div>
          <p className={cn('text-sm font-bold', colorClass)}>{data.label}</p>
          {data.description && (
            <p className="text-[10px] text-text-muted mt-0.5">{data.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(StoryEndingNode);
