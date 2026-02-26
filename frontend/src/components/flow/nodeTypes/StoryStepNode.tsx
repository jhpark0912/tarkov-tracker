import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { cn } from '../../../utils/cn';
import type { StoryNodeData } from '../types';

function StoryStepNode({ data, selected }: NodeProps & { data: StoryNodeData }) {
  return (
    <div
      className={cn(
        'px-3 py-2 rounded-lg border min-w-[180px] max-w-[220px] transition-all',
        data.completed
          ? 'border-complete/60 bg-complete/10'
          : data.active
            ? 'border-kappa bg-kappa/10 ring-1 ring-kappa/30'
            : 'border-border bg-surface',
        selected && 'ring-2 ring-accent',
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-border !w-2 !h-2" />
      <p className={cn('text-xs font-medium leading-tight', data.completed ? 'text-complete' : 'text-text')}>
        {data.label}
      </p>
      {data.description && (
        <p className="text-[10px] text-text-muted mt-0.5 line-clamp-2">{data.description}</p>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-border !w-2 !h-2" />
    </div>
  );
}

export default memo(StoryStepNode);
