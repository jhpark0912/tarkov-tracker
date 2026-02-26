import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { cn } from '../../../utils/cn';
import type { StoryNodeData } from '../types';

function StoryCostNode({ data, selected }: NodeProps & { data: StoryNodeData }) {
  return (
    <div
      className={cn(
        'px-3 py-2 rounded-lg border min-w-[180px] max-w-[220px] transition-all',
        data.completed
          ? 'border-complete/60 bg-complete/10'
          : 'border-orange-400/60 bg-orange-400/10',
        selected && 'ring-2 ring-accent',
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-orange-400 !w-2 !h-2" />
      <div className="flex items-center gap-1.5">
        <span className="text-sm">💰</span>
        <p className="text-xs font-medium text-orange-300 leading-tight">{data.label}</p>
      </div>
      {data.cost && (
        <p className="text-[10px] text-orange-400/80 mt-0.5 font-mono">{data.cost}</p>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-orange-400 !w-2 !h-2" />
    </div>
  );
}

export default memo(StoryCostNode);
