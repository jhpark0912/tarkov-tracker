import { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Maximize2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { STORY_NODES, NODE_CHAPTER_MAP } from '../../data/storyNodes';
import { STORY_EDGES } from '../../data/storyEdges';
import FlowGraph from '../../components/flow/FlowGraph';
import { storyNodeTypes } from '../../components/flow/nodeTypes';
import { flowEdgeTypes } from '../../components/flow/edgeTypes';
import { useAutoLayout } from '../../components/flow/useAutoLayout';
import StoryDetailPanel from './components/StoryDetailPanel';
import StoryLegend from './components/StoryLegend';

const CHAPTERS = [
  '전체',
  'Tour',
  'Falling Skies',
  'The Ticket',
  'They Are Already Here',
  'Batya',
  'Blue Fire',
  'The Labyrinth',
  'Accidental Witness',
  'The Unheard',
  'Ending',
] as const;

type Chapter = (typeof CHAPTERS)[number];

export default function FullMapPage() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [activeChapter, setActiveChapter] = useState<Chapter>('전체');

  const { filteredNodes, filteredEdges } = useMemo(() => {
    if (activeChapter === '전체') {
      return { filteredNodes: STORY_NODES, filteredEdges: STORY_EDGES };
    }
    const nodes = STORY_NODES.filter((n) => NODE_CHAPTER_MAP[n.id] === activeChapter);
    const nodeIdSet = new Set(nodes.map((n) => n.id));
    const edges = STORY_EDGES.filter(
      (e) => nodeIdSet.has(e.source) && nodeIdSet.has(e.target),
    );
    return { filteredNodes: nodes, filteredEdges: edges };
  }, [activeChapter]);

  const { layoutNodes, layoutEdges } = useAutoLayout(filteredNodes, filteredEdges, {
    direction: 'TB',
    rankSep: 70,
    nodeSep: 40,
  });

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      setSelectedNode(nodeId);
    },
    [],
  );

  const handleChapterChange = (chapter: Chapter) => {
    setActiveChapter(chapter);
    setSelectedNode(null);
  };

  const chapterNodeCount = useMemo(() => {
    const counts: Record<string, number> = {};
    STORY_NODES.forEach((n) => {
      const ch = NODE_CHAPTER_MAP[n.id] ?? '기타';
      counts[ch] = (counts[ch] ?? 0) + 1;
    });
    return counts;
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
            <p className="text-sm text-text-muted">
              {filteredNodes.length}개 노드
              {activeChapter !== '전체' && ` · ${activeChapter}`}
              {activeChapter === '전체' && ' · 줌/패닝으로 탐색'}
            </p>
          </div>
        </div>
        <Maximize2 size={16} className="text-text-muted" />
      </div>

      {/* 챕터 탭 */}
      <div className="flex flex-wrap gap-2">
        {CHAPTERS.map((ch) => {
          const count = ch === '전체' ? STORY_NODES.length : (chapterNodeCount[ch] ?? 0);
          return (
            <button
              key={ch}
              onClick={() => handleChapterChange(ch)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer',
                activeChapter === ch
                  ? 'bg-accent text-white'
                  : 'bg-surface-alt text-text-secondary hover:bg-elevated hover:text-text',
              )}
            >
              {ch}
              <span className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-full',
                activeChapter === ch ? 'bg-white/20' : 'bg-elevated text-text-muted',
              )}>
                {count}
              </span>
            </button>
          );
        })}
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
            miniMap={activeChapter === '전체'}
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
