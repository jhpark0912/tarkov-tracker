import { useEffect, useState, useMemo, useCallback } from 'react';
import type { Node, Edge } from '@xyflow/react';
import { Loader2 } from 'lucide-react';
import { questTreeApi } from '../../../api/questTreeApi';
import FlowGraph from '../../../components/flow/FlowGraph';
import { questNodeTypes } from '../../../components/flow/nodeTypes';
import { useAutoLayout } from '../../../components/flow/useAutoLayout';
import type { QuestTreeResponse } from '../../../types/questTree';
import type { QuestNodeData } from '../../../components/flow/types';
import { useProgressStore } from '../../../store/progressStore';

interface QuestPrereqTreeProps {
  questId: number;
  onNodeClick?: (questId: number) => void;
}

export default function QuestPrereqTree({ questId, onNodeClick }: QuestPrereqTreeProps) {
  const [data, setData] = useState<QuestTreeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { questStatuses } = useProgressStore();

  useEffect(() => {
    setLoading(true);
    questTreeApi.getQuestTree(questId)
      .then(setData)
      .finally(() => setLoading(false));
  }, [questId]);

  const { nodes, edges } = useMemo(() => {
    if (!data) return { nodes: [], edges: [] };

    const flowNodes: Node<QuestNodeData>[] = data.nodes.map((n) => ({
      id: String(n.id),
      type: 'quest',
      position: { x: 0, y: 0 },
      data: {
        questId: n.id,
        label: n.name,
        traderName: n.traderName ?? undefined,
        traderImageUrl: n.traderImageUrl ?? undefined,
        mapName: n.mapName ?? undefined,
        minPlayerLevel: n.minPlayerLevel,
        kappaRequired: n.kappaRequired,
        lightkeeperRequired: n.lightkeeperRequired,
        status: (questStatuses[String(n.id)] ?? 'NOT_STARTED') as QuestNodeData['status'],
      },
    }));

    const flowEdges: Edge[] = data.edges.map((e) => ({
      id: `${e.source}->${e.target}`,
      source: String(e.source),
      target: String(e.target),
      type: 'smoothstep',
    }));

    return { nodes: flowNodes, edges: flowEdges };
  }, [data, questStatuses]);

  const { layoutNodes, layoutEdges } = useAutoLayout(nodes, edges, {
    direction: 'TB',
    rankSep: 60,
    nodeSep: 30,
  });

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      onNodeClick?.(Number(nodeId));
    },
    [onNodeClick],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 size={20} className="animate-spin text-text-muted" />
      </div>
    );
  }

  if (!data || data.nodes.length <= 1) {
    return (
      <p className="text-xs text-text-muted text-center py-4">선행 퀘스트가 없습니다</p>
    );
  }

  return (
    <FlowGraph
      nodes={layoutNodes}
      edges={layoutEdges}
      nodeTypes={questNodeTypes as any}
      onNodeClick={handleNodeClick}
      className="w-full h-[300px]"
    />
  );
}
