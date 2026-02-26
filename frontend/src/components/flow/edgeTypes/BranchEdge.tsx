import { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from '@xyflow/react';

interface BranchEdgeData {
  label?: string;
  isBranch?: boolean;
  isActive?: boolean;
}

function BranchEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {},
}: EdgeProps & { data?: BranchEdgeData }) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const isActive = data?.isActive ?? false;
  const isBranch = data?.isBranch ?? false;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: isActive ? '#4ecca3' : isBranch ? '#e6b800' : '#334155',
          strokeWidth: isActive ? 2.5 : 1.5,
          strokeDasharray: isBranch && !isActive ? '6 3' : undefined,
          ...style,
        }}
      />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            className="absolute text-[9px] px-1.5 py-0.5 rounded bg-surface/90 border border-border/50 pointer-events-none"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              color: isActive ? '#4ecca3' : '#94a3b8',
            }}
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default memo(BranchEdge);
