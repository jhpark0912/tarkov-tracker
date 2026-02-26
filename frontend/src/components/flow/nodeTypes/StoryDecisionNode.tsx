import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { GitBranch } from 'lucide-react';
import { cn } from '../../../utils/cn';
import type { StoryNodeData } from '../types';

function StoryDecisionNode({ data, selected }: NodeProps & { data: StoryNodeData }) {
  return (
    <div
      className={cn(
        'px-3 py-2 rounded-lg border-2 border-dashed min-w-[180px] max-w-[220px] transition-all',
        data.completed
          ? 'border-complete/60 bg-complete/10'
          : data.active
            ? 'border-kappa bg-kappa/10'
            : 'border-kappa/40 bg-surface',
        selected && 'ring-2 ring-accent',
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-kappa !w-2 !h-2" />
      <div className="flex items-center gap-1.5">
        <GitBranch size={12} className="text-kappa shrink-0" />
        <p className="text-xs font-semibold text-kappa leading-tight">{data.label}</p>
      </div>
      {data.description && (
        <p className="text-[10px] text-text-muted mt-0.5 line-clamp-2">{data.description}</p>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-kappa !w-2 !h-2" />
    </div>
  );
}

export default memo(StoryDecisionNode);
