import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Clock } from 'lucide-react';
import { cn } from '../../../utils/cn';
import type { StoryNodeData } from '../types';

function StoryTimegateNode({ data, selected }: NodeProps & { data: StoryNodeData }) {
  return (
    <div
      className={cn(
        'px-3 py-2 rounded-lg border min-w-[180px] max-w-[220px] transition-all',
        data.completed
          ? 'border-complete/60 bg-complete/10'
          : 'border-purple-400/60 bg-purple-400/10',
        selected && 'ring-2 ring-accent',
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-purple-400 !w-2 !h-2" />
      <div className="flex items-center gap-1.5">
        <Clock size={12} className="text-purple-400 shrink-0" />
        <p className="text-xs font-medium text-purple-300 leading-tight">{data.label}</p>
      </div>
      {data.duration && (
        <p className="text-[10px] text-purple-400/80 mt-0.5">{data.duration}</p>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-purple-400 !w-2 !h-2" />
    </div>
  );
}

export default memo(StoryTimegateNode);
