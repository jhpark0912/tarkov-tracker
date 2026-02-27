import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Crown, Compass, Loader2, GitBranch } from 'lucide-react';
import type { Node, Edge } from '@xyflow/react';
import { questTreeApi } from '../../api/questTreeApi';
import { questApi } from '../../api/questApi';
import FlowGraph from '../../components/flow/FlowGraph';
import { questNodeTypes } from '../../components/flow/nodeTypes';
import { useAutoLayout } from '../../components/flow/useAutoLayout';
import { useProgressStore } from '../../store/progressStore';
import type { QuestTreeResponse } from '../../types/questTree';
import TreeFilterBar from './components/TreeFilterBar';

export default function QuestTreePage() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const isKappa = type === 'kappa';
  const isFull = type === 'full';

  const [data, setData] = useState<QuestTreeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { questStatuses } = useProgressStore();

  // full 트리 필터 상태
  const [traderFilter, setTraderFilter] = useState('');
  const [kappaOnly, setKappaOnly] = useState(false);
  const [lightkeeperOnly, setLightkeeperOnly] = useState(false);
  const [traders, setTraders] = useState<string[]>([]);

  // 트레이더 목록 로드 (full 모드)
  useEffect(() => {
    if (!isFull) return;
    questApi.getList().then((list) => {
      const names = [...new Set(list.map((q) => q.trader?.name).filter(Boolean))] as string[];
      setTraders(names.sort());
    });
  }, [isFull]);

  // 트리 데이터 로드
  useEffect(() => {
    setLoading(true);
    setError(null);

    let fetchPromise: Promise<QuestTreeResponse>;
    if (isFull) {
      fetchPromise = questTreeApi.getFullTree({
        trader: traderFilter || undefined,
        kappa: kappaOnly || undefined,
        lightkeeper: lightkeeperOnly || undefined,
      });
    } else if (isKappa) {
      fetchPromise = questTreeApi.getKappaTree();
    } else {
      fetchPromise = questTreeApi.getLightkeeperTree();
    }

    fetchPromise
      .then(setData)
      .catch(() => setError('트리 데이터를 불러오는데 실패했습니다.'))
      .finally(() => setLoading(false));
  }, [isKappa, isFull, traderFilter, kappaOnly, lightkeeperOnly]);

  const { nodes, edges } = useMemo(() => {
    if (!data) return { nodes: [], edges: [] };

    const flowNodes: Node[] = data.nodes.map((n) => ({
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
        status: questStatuses[String(n.id)] ?? 'NOT_STARTED',
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
    rankSep: 70,
    nodeSep: 40,
  });

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      navigate(`/quests/${nodeId}`);
    },
    [navigate],
  );

  const title = isFull
    ? '전체 퀘스트 의존 트리'
    : isKappa
      ? '카파 퀘스트 트리'
      : '등대지기 퀘스트 트리';

  const titleIcon = isFull
    ? <GitBranch size={20} className="text-text-secondary" />
    : isKappa
      ? <Crown size={20} className="text-gold" />
      : <Compass size={20} className="text-accent" />;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/quests">
            <ArrowLeft size={20} className="text-text-muted hover:text-text transition-colors" />
          </Link>
          <div className="flex items-center gap-2">
            {titleIcon}
            <div>
              <h1 className="text-xl font-bold text-text">{title}</h1>
              {data && (
                <p className="text-sm text-text-muted">{data.nodes.length}개 퀘스트 · {data.edges.length}개 의존관계</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 필터 바 (full 모드) */}
      {isFull && (
        <TreeFilterBar
          traders={traders}
          selectedTrader={traderFilter}
          onTraderChange={setTraderFilter}
          kappaOnly={kappaOnly}
          onKappaToggle={() => setKappaOnly(!kappaOnly)}
          lightkeeperOnly={lightkeeperOnly}
          onLightkeeperToggle={() => setLightkeeperOnly(!lightkeeperOnly)}
        />
      )}

      {/* 로딩/에러 */}
      {loading && (
        <div className="flex items-center justify-center py-32">
          <Loader2 size={32} className="animate-spin text-text-muted" />
        </div>
      )}
      {error && <p className="text-center text-sm text-red-400 py-4">{error}</p>}

      {/* 트리 */}
      {!loading && data && (
        <div className="bg-surface/50 border border-border rounded-xl overflow-hidden">
          <FlowGraph
            nodes={layoutNodes}
            edges={layoutEdges}
            nodeTypes={questNodeTypes as any}
            onNodeClick={handleNodeClick}
            miniMap
            className="w-full h-[700px]"
          />
        </div>
      )}

      {/* 범례 */}
      {!loading && data && (
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-text-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded border border-complete/60 bg-complete/10" /> 완료
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded border border-progress/60 bg-progress/10" /> 진행 중
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded border border-border bg-surface" /> 미시작
          </span>
          <span className="flex items-center gap-1.5">
            <Crown size={10} className="text-gold" /> 카파
          </span>
          <span className="flex items-center gap-1.5">
            <Compass size={10} className="text-accent" /> 등대지기
          </span>
        </div>
      )}
    </div>
  );
}
