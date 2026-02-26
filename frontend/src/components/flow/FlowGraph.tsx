import { useCallback, type ComponentType } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type NodeMouseHandler,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { FLOW_COLORS } from './flowTheme';

interface FlowGraphProps {
  nodes: Node[];
  edges: Edge[];
  nodeTypes: Record<string, ComponentType<any>>;
  edgeTypes?: Record<string, ComponentType<any>>;
  onNodeClick?: (nodeId: string) => void;
  miniMap?: boolean;
  layoutDirection?: 'TB' | 'LR';
  className?: string;
}

export default function FlowGraph({
  nodes,
  edges,
  nodeTypes,
  edgeTypes,
  onNodeClick,
  miniMap = false,
  className,
}: FlowGraphProps) {
  const handleNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      onNodeClick?.(node.id);
    },
    [onNodeClick],
  );

  return (
    <div className={className ?? 'w-full h-[600px]'}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={handleNodeClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ type: 'smoothstep' }}
      >
        <Background variant={BackgroundVariant.Dots} color={FLOW_COLORS.border} gap={20} size={1} />
        <Controls
          position="bottom-right"
          className="!bg-surface !border-border !rounded-lg [&>button]:!bg-surface [&>button]:!border-border [&>button]:!text-text-muted [&>button:hover]:!bg-elevated"
        />
        {miniMap && (
          <MiniMap
            position="top-right"
            nodeColor={FLOW_COLORS.elevated}
            maskColor="rgba(26, 26, 46, 0.8)"
            className="!bg-surface !border-border !rounded-lg"
          />
        )}
      </ReactFlow>
    </div>
  );
}
