import { useMemo, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Flag } from 'lucide-react';
import type { Node, Edge } from '@xyflow/react';
import { cn } from '../../utils/cn';
import { STORY_NODES } from '../../data/storyNodes';
import { STORY_EDGES } from '../../data/storyEdges';
import { ENDING_META_MAP } from '../../data/storyPaths';
import FlowGraph from '../../components/flow/FlowGraph';
import { storyNodeTypes } from '../../components/flow/nodeTypes';
import { flowEdgeTypes } from '../../components/flow/edgeTypes';
import { useAutoLayout } from '../../components/flow/useAutoLayout';
import StoryDetailPanel from './components/StoryDetailPanel';
import StoryLegend from './components/StoryLegend';
import type { StoryNodeData } from '../../components/flow/types';

export default function EndingPathPage() {
  const { endingId } = useParams<{ endingId: string }>();
  const ending = ENDING_META_MAP.get(endingId ?? '');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // 해당 경로의 노드/엣지만 필터
  const { filteredNodes, filteredEdges } = useMemo(() => {
    if (!ending) return { filteredNodes: [], filteredEdges: [] };

    const nodeIdSet = new Set(ending.nodeIds);
    const nodes = STORY_NODES.filter((n) => nodeIdSet.has(n.id));
    const edges = STORY_EDGES.filter(
      (e) => nodeIdSet.has(e.source) && nodeIdSet.has(e.target),
    );

    return { filteredNodes: nodes, filteredEdges: edges };
  }, [ending]);

  const { layoutNodes, layoutEdges } = useAutoLayout(filteredNodes, filteredEdges, {
    direction: 'TB',
    rankSep: 60,
    nodeSep: 30,
  });

  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNode(nodeId);
  }, []);

  if (!ending) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <p className="text-text-muted text-sm">존재하지 않는 엔딩입니다.</p>
        <Link to="/story" className="mt-4 inline-block text-sm text-text-secondary hover:text-text no-underline">← 스토리 목록으로</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-start gap-4">
        <Link to="/story" className="mt-1">
          <ArrowLeft size={20} className="text-text-muted hover:text-text transition-colors" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Flag size={20} className={cn(ending.color)} />
            <h1 className={cn('text-xl font-bold', ending.color)}>{ending.name}</h1>
            <span className="text-sm text-text-muted">— {ending.subtitle}</span>
          </div>
          <p className="text-xs text-text-secondary mt-1">{ending.stepCount} 스텝 · {ending.estimatedCost}</p>
        </div>
      </div>

      <StoryLegend />

      {/* 플로우 + 사이드 패널 */}
      <div className="flex flex-col xl:flex-row gap-6 items-start">
        <div className="w-full xl:flex-1 xl:min-w-0 bg-surface/50 border border-border rounded-xl overflow-hidden">
          <FlowGraph
            nodes={layoutNodes}
            edges={layoutEdges}
            nodeTypes={storyNodeTypes as any}
            edgeTypes={flowEdgeTypes as any}
            onNodeClick={handleNodeClick}
            className="w-full h-[600px]"
          />
        </div>
        <div className="w-full xl:w-80 xl:shrink-0">
          <StoryDetailPanel nodeId={selectedNode} />
        </div>
      </div>
    </div>
  );
}
