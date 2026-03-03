import { ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { NODE_CHAPTER_MAP, STORY_NODE_MAP } from '../../../data/storyNodes';
import type { StoryNodeData, StoryNodeType } from '../../../components/flow/types';

const TYPE_LABELS: Record<StoryNodeType, { label: string; color: string }> = {
  step: { label: '퀘스트 스텝', color: 'text-text-secondary' },
  decision: { label: '분기점', color: 'text-kappa' },
  cost: { label: '비용', color: 'text-orange-400' },
  timegate: { label: '대기 시간', color: 'text-purple-400' },
  achievement: { label: '업적', color: 'text-gold' },
  ending: { label: '엔딩', color: 'text-complete' },
};

interface StoryDetailPanelProps {
  nodeId: string | null;
  /** 현재 엔딩 경로의 노드 ID 순서 (진행도 및 네비게이션용) */
  pathNodes?: string[];
  /** 노드 선택 콜백 (이전/다음 버튼용) */
  onNodeSelect?: (nodeId: string) => void;
}

export default function StoryDetailPanel({ nodeId, pathNodes, onNodeSelect }: StoryDetailPanelProps) {
  if (!nodeId) {
    return (
      <div className="bg-surface border border-border rounded-xl p-5 text-center text-sm text-text-muted">
        노드를 클릭하면 상세 정보를 확인할 수 있습니다
      </div>
    );
  }

  const node = STORY_NODE_MAP.get(nodeId);
  if (!node) return null;

  const data = node.data as StoryNodeData;
  const chapter = NODE_CHAPTER_MAP[nodeId];
  const typeInfo = TYPE_LABELS[data.type];

  const position = pathNodes ? pathNodes.indexOf(nodeId) : -1;
  const hasPrev = position > 0;
  const hasNext = pathNodes ? position < pathNodes.length - 1 : false;

  return (
    <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
      {/* 진행도 + 네비게이션 */}
      {pathNodes && position >= 0 && (
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-text-muted font-mono">
            {position + 1} / {pathNodes.length} 스텝
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => hasPrev && onNodeSelect?.(pathNodes[position - 1])}
              disabled={!hasPrev}
              className={cn(
                'p-1 rounded-lg transition-colors',
                hasPrev ? 'text-text-secondary hover:text-text hover:bg-elevated cursor-pointer' : 'text-text-muted cursor-not-allowed opacity-40'
              )}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => hasNext && onNodeSelect?.(pathNodes[position + 1])}
              disabled={!hasNext}
              className={cn(
                'p-1 rounded-lg transition-colors',
                hasNext ? 'text-text-secondary hover:text-text hover:bg-elevated cursor-pointer' : 'text-text-muted cursor-not-allowed opacity-40'
              )}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-bold text-text">{data.label}</h3>
        <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border border-border whitespace-nowrap', typeInfo.color)}>
          {typeInfo.label}
        </span>
      </div>

      {/* 챕터 */}
      {chapter && (
        <div className="text-[11px] text-text-muted">
          챕터: <span className="text-text-secondary font-medium">{chapter}</span>
        </div>
      )}

      {/* 설명 */}
      {data.description && (
        <p className="text-xs text-text-secondary leading-relaxed">{data.description}</p>
      )}

      {/* 비용 */}
      {data.cost && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-400/10 border border-orange-400/20">
          <span className="text-sm">💰</span>
          <span className="text-xs text-orange-300 font-mono">{data.cost}</span>
        </div>
      )}

      {/* 대기 시간 */}
      {data.duration && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-400/10 border border-purple-400/20">
          <span className="text-sm">⏳</span>
          <span className="text-xs text-purple-300">{data.duration}</span>
        </div>
      )}

      {/* 업적 */}
      {data.achievement && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-gold/10 border border-gold/20">
          <span className="text-sm">🏆</span>
          <span className="text-xs text-gold font-medium">{data.achievement}</span>
        </div>
      )}

      {/* 위키 */}
      {data.wikiUrl && (
        <a
          href={data.wikiUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border text-xs text-text-muted hover:text-text hover:bg-elevated transition-all no-underline"
        >
          <ExternalLink size={12} />
          위키에서 자세히 보기
        </a>
      )}
    </div>
  );
}
