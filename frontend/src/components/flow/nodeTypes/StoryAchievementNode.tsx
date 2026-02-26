import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Trophy } from 'lucide-react';
import { cn } from '../../../utils/cn';
import type { StoryNodeData } from '../types';

function StoryAchievementNode({ data, selected }: NodeProps & { data: StoryNodeData }) {
  return (
    <div
      className={cn(
        'px-3 py-2 rounded-lg border min-w-[180px] max-w-[220px] transition-all',
        data.completed
          ? 'border-complete/60 bg-complete/10'
          : 'border-gold/60 bg-gold/10',
        selected && 'ring-2 ring-accent',
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-gold !w-2 !h-2" />
      <div className="flex items-center gap-1.5">
        <Trophy size={12} className="text-gold shrink-0" />
        <p className="text-xs font-semibold text-gold leading-tight">{data.label}</p>
      </div>
      {data.achievement && (
        <p className="text-[10px] text-gold/70 mt-0.5">{data.achievement}</p>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-gold !w-2 !h-2" />
    </div>
  );
}

export default memo(StoryAchievementNode);
