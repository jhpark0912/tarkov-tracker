import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Maximize2 } from 'lucide-react';
import { STORY_NODES } from '../../data/storyNodes';
import { STORY_EDGES } from '../../data/storyEdges';
import FlowGraph from '../../components/flow/FlowGraph';
import { storyNodeTypes } from '../../components/flow/nodeTypes';
import { flowEdgeTypes } from '../../components/flow/edgeTypes';
import { useAutoLayout } from '../../components/flow/useAutoLayout';
import StoryDetailPanel from './components/StoryDetailPanel';
import StoryLegend from './components/StoryLegend';

export default function FullMapPage() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const { layoutNodes, layoutEdges } = useAutoLayout(STORY_NODES, STORY_EDGES, {
    direction: 'TB',
    rankSep: 70,
    nodeSep: 40,
  });

  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNode(nodeId);
  }, []);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/story">
            <ArrowLeft size={20} className="text-text-muted hover:text-text transition-colors" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-text">전체 스토리 플로우차트</h1>
            <p className="text-sm text-text-muted">{STORY_NODES.length}개 노드 · 줌/패닝으로 탐색</p>
          </div>
        </div>
        <Maximize2 size={16} className="text-text-muted" />
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
            miniMap
            className="w-full h-[700px]"
          />
        </div>
        <div className="w-full xl:w-80 xl:shrink-0">
          <StoryDetailPanel nodeId={selectedNode} />
        </div>
      </div>
    </div>
  );
}
