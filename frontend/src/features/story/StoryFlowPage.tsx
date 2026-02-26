import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  BookOpen, Check, Circle, GitBranch, Star, Play, RotateCcw,
  LogIn, ExternalLink, Lightbulb, Trophy, Target, Swords, Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';
import type { StoryChapter, StoryEnding, StoryProgress, ChapterStatus } from '../../types/story';
import { STORY_CHAPTERS, STORY_ENDINGS, CHAPTER_MAP, ENDING_MAP, predictEnding } from '../../data/storyData';
import { useStoryStore } from '../../store/storyStore';
import { useAuthStore } from '../../store/authStore';

/* ── 레이아웃 상수 ── */
const CELL_W = 220;
const CELL_H = 120;
const NODE_W = 200;
const NODE_H = 80;
const ENDING_H = 60;
const PADDING_X = 40;
const PADDING_Y = 30;

function nodeCenter(col: number, row: number) {
  return {
    x: PADDING_X + col * CELL_W + NODE_W / 2,
    y: PADDING_Y + row * CELL_H + NODE_H / 2,
  };
}

/* ── 엣지 타입 ── */
interface Edge {
  from: { col: number; row: number };
  to: { col: number; row: number };
  label?: string;
  isActive: boolean;
  isBranch: boolean;
}

/* ── SVG 컴포넌트 ── */

function ChapterNode({
  chapter,
  status,
  selected,
  onClick,
}: {
  chapter: StoryChapter;
  status: ChapterStatus;
  selected: boolean;
  onClick: () => void;
}) {
  const x = PADDING_X + chapter.column * CELL_W;
  const y = PADDING_Y + chapter.row * CELL_H;

  const statusStyles: Record<ChapterStatus, string> = {
    locked: 'border-border/40 bg-surface/30 opacity-50',
    available: 'border-accent bg-surface hover:bg-elevated cursor-pointer',
    in_progress: 'border-kappa bg-surface ring-1 ring-kappa/30 cursor-pointer',
    completed: 'border-complete bg-surface cursor-pointer',
  };

  const statusIcon: Record<ChapterStatus, React.ReactNode> = {
    locked: <Circle className="w-3.5 h-3.5 text-text-muted" />,
    available: <Circle className="w-3.5 h-3.5 text-accent" />,
    in_progress: <Star className="w-3.5 h-3.5 text-kappa fill-kappa" />,
    completed: <Check className="w-3.5 h-3.5 text-complete" />,
  };

  return (
    <foreignObject x={x} y={y} width={NODE_W} height={NODE_H}>
      <div
        className={cn(
          'h-full rounded-lg border px-3 py-2 transition-all',
          statusStyles[status],
          selected && 'ring-2 ring-accent',
        )}
        onClick={onClick}
      >
        <div className="flex items-center gap-1.5 mb-1">
          {statusIcon[status]}
          <span className="text-xs font-semibold text-text-primary truncate">{chapter.name}</span>
        </div>
        <p className="text-[10px] text-text-muted leading-tight line-clamp-2">{chapter.description}</p>
      </div>
    </foreignObject>
  );
}

function EndingNode({
  ending,
  selected,
  predicted,
  onClick,
}: {
  ending: StoryEnding;
  selected: boolean;
  predicted: boolean;
  onClick: () => void;
}) {
  const x = PADDING_X + ending.column * CELL_W;
  const y = PADDING_Y + ending.row * CELL_H;

  return (
    <foreignObject x={x} y={y} width={NODE_W} height={ENDING_H}>
      <div
        className={cn(
          'h-full rounded-lg border px-3 py-2 flex flex-col justify-center cursor-pointer transition-all',
          predicted
            ? 'border-kappa bg-kappa/10 ring-1 ring-kappa/40'
            : 'border-border/60 bg-elevated/50',
          selected && 'ring-2 ring-accent',
        )}
        onClick={onClick}
      >
        <div className="flex items-center gap-1.5">
          {predicted && <Target className="w-3 h-3 text-kappa" />}
          <span className={cn('text-xs font-bold', ending.color)}>{ending.name}</span>
        </div>
        <span className="text-[10px] text-text-muted">{ending.subtitle}</span>
      </div>
    </foreignObject>
  );
}

function EdgeLine({ from, to, label, isActive, isBranch }: Edge) {
  const start = nodeCenter(from.col, from.row);
  const end = nodeCenter(to.col, to.row);
  start.y += NODE_H / 2;
  end.y -= NODE_H / 2;

  const midY = (start.y + end.y) / 2;
  const d = `M ${start.x} ${start.y} C ${start.x} ${midY}, ${end.x} ${midY}, ${end.x} ${end.y}`;

  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke={isActive ? '#4ecca3' : isBranch ? '#e6b800' : '#334155'}
        strokeWidth={isActive ? 2.5 : 1.5}
        strokeDasharray={isBranch && !isActive ? '6 3' : undefined}
        className="transition-all duration-300"
      />
      <circle cx={end.x} cy={end.y} r={3} fill={isActive ? '#4ecca3' : '#334155'} />
      {label && (
        <text
          x={(start.x + end.x) / 2 + (end.x > start.x ? 10 : -10)}
          y={midY - 4}
          textAnchor="middle"
          className={cn('text-[9px] fill-current', isActive ? 'text-complete' : 'text-text-muted')}
        >
          {label}
        </text>
      )}
    </g>
  );
}

/* ── 상세 패널 컴포넌트 ── */

const STATUS_TRANSITIONS: Record<ChapterStatus, ChapterStatus | null> = {
  locked: null,
  available: 'in_progress',
  in_progress: 'completed',
  completed: null,
};

const STATUS_BUTTON_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  in_progress: { label: '진행 시작', icon: Play, color: 'bg-kappa/20 text-kappa hover:bg-kappa/30 border-kappa/30' },
  completed: { label: '완료 처리', icon: Check, color: 'bg-complete/20 text-complete hover:bg-complete/30 border-complete/30' },
};

function ChapterDetail({
  chapter,
  status,
  progress,
  isLoggedIn,
  onStatusChange,
  onChoiceSelect,
  loading,
}: {
  chapter: StoryChapter;
  status: ChapterStatus;
  progress?: StoryProgress;
  isLoggedIn: boolean;
  onStatusChange: (chapterId: string, newStatus: ChapterStatus) => void;
  onChoiceSelect: (chapterId: string, choiceId: string) => void;
  loading: boolean;
}) {
  const statusLabels: Record<ChapterStatus, { text: string; color: string }> = {
    locked: { text: '잠김', color: 'text-text-muted' },
    available: { text: '진행 가능', color: 'text-accent' },
    in_progress: { text: '진행 중', color: 'text-kappa' },
    completed: { text: '완료', color: 'text-complete' },
  };

  const sl = statusLabels[status];
  const nextStatus = STATUS_TRANSITIONS[status];
  const btnConfig = nextStatus ? STATUS_BUTTON_CONFIG[nextStatus] : null;

  return (
    <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-text-primary">{chapter.name}</h3>
        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full border', sl.color)}>
          {sl.text}
        </span>
      </div>

      <p className="text-sm text-text-secondary leading-relaxed">{chapter.description}</p>

      {/* 관련 맵 */}
      <div>
        <span className="text-xs font-medium text-text-muted">관련 맵</span>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {chapter.maps.map((m) => (
            <span key={m} className="text-[11px] px-2 py-0.5 rounded bg-elevated text-text-secondary border border-border/50">
              {m}
            </span>
          ))}
        </div>
      </div>

      {/* 관련 딜러 */}
      {chapter.dealers && chapter.dealers.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Users className="w-3.5 h-3.5 text-text-muted" />
            <span className="text-xs font-medium text-text-muted">관련 딜러</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {chapter.dealers.map((d) => (
              <span key={d} className="text-[11px] px-2 py-0.5 rounded bg-accent/10 text-accent border border-accent/20">
                {d}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 퀘스트 목록 */}
      {chapter.quests && chapter.quests.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Swords className="w-3.5 h-3.5 text-text-muted" />
            <span className="text-xs font-medium text-text-muted">퀘스트 목록 ({chapter.quests.length}개)</span>
          </div>
          <ol className="space-y-1 pl-1">
            {chapter.quests.map((quest, idx) => (
              <li key={idx} className="flex gap-2 text-[11px] leading-relaxed">
                <span className="text-text-muted shrink-0 w-4 text-right">{idx + 1}.</span>
                <span className="text-text-secondary">{quest}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* 팁 */}
      {chapter.tip && (
        <div className="flex gap-2 p-3 rounded-lg bg-kappa/5 border border-kappa/20">
          <Lightbulb className="w-4 h-4 text-kappa shrink-0 mt-0.5" />
          <p className="text-xs text-text-secondary leading-relaxed">{chapter.tip}</p>
        </div>
      )}

      {/* 분기 선택 */}
      {chapter.choices && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <GitBranch className="w-3.5 h-3.5 text-kappa" />
            <span className="text-xs font-medium text-kappa">분기 선택</span>
          </div>
          <div className="space-y-2">
            {chapter.choices.map((choice) => {
              const isChosen = progress?.choiceId === choice.id;
              const canChoose = isLoggedIn && (status === 'in_progress' || status === 'completed') && !progress?.choiceId;
              return (
                <div
                  key={choice.id}
                  className={cn(
                    'rounded-lg border p-3 transition-all',
                    isChosen
                      ? 'border-complete bg-complete/10'
                      : canChoose
                        ? 'border-kappa/50 bg-elevated/50 hover:border-kappa cursor-pointer'
                        : 'border-border/50 bg-elevated/50',
                  )}
                  onClick={() => {
                    if (canChoose) onChoiceSelect(chapter.id, choice.id);
                  }}
                >
                  <div className="flex items-center gap-2">
                    {isChosen && <Check className="w-3.5 h-3.5 text-complete" />}
                    <span className="text-xs font-semibold text-text-primary">{choice.label}</span>
                    {canChoose && !isChosen && (
                      <span className="text-[10px] text-kappa ml-auto">클릭하여 선택</span>
                    )}
                  </div>
                  <p className="text-[11px] text-text-muted mt-1">{choice.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 상태 변경 버튼 */}
      {isLoggedIn && btnConfig && nextStatus && (
        <button
          onClick={() => onStatusChange(chapter.id, nextStatus)}
          disabled={loading}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all cursor-pointer',
            btnConfig.color,
            loading && 'opacity-50 cursor-not-allowed',
          )}
        >
          <btnConfig.icon className="w-4 h-4" />
          {loading ? '처리 중...' : btnConfig.label}
        </button>
      )}

      {/* 위키 링크 */}
      {chapter.wikiUrl && (
        <a
          href={chapter.wikiUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border text-xs text-text-muted hover:text-text hover:bg-elevated transition-all no-underline"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          위키에서 자세히 보기
        </a>
      )}

      {/* 비로그인 안내 */}
      {!isLoggedIn && status !== 'locked' && (
        <Link
          to="/login"
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-text-secondary hover:text-text hover:bg-elevated transition-all no-underline"
        >
          <LogIn className="w-4 h-4" />
          로그인하여 진행 상태 기록
        </Link>
      )}
    </div>
  );
}

function EndingDetail({ ending, predicted }: { ending: StoryEnding; predicted: boolean }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className={cn('text-lg font-bold', ending.color)}>{ending.name}</h3>
        <div className="flex items-center gap-2">
          {predicted && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-kappa/40 text-kappa bg-kappa/10">
              예상 엔딩
            </span>
          )}
          <span className="text-xs font-medium px-2 py-0.5 rounded-full border border-border text-text-muted">
            엔딩
          </span>
        </div>
      </div>
      <p className="text-sm text-text-secondary font-medium">{ending.subtitle}</p>
      <p className="text-sm text-text-secondary leading-relaxed">{ending.description}</p>

      {/* 보상 */}
      {ending.reward && (
        <div className="flex gap-2 p-3 rounded-lg bg-elevated border border-border/50">
          <Trophy className="w-4 h-4 text-kappa shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-medium text-text-muted">엔딩 보상</span>
            <p className="text-xs text-text-secondary mt-0.5">{ending.reward}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── 엔딩 예측 배너 ── */
function EndingPredictionBanner({
  predictedEndingId,
  onClick,
}: {
  predictedEndingId: string;
  onClick: () => void;
}) {
  const ending = ENDING_MAP.get(predictedEndingId);
  if (!ending) return null;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-kappa/30 bg-kappa/5 hover:bg-kappa/10 transition-all cursor-pointer w-full text-left"
    >
      <Target className="w-5 h-5 text-kappa shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="text-xs text-text-muted">현재 경로의 예상 엔딩</span>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={cn('text-sm font-bold', ending.color)}>{ending.name}</span>
          <span className="text-xs text-text-muted">— {ending.subtitle}</span>
        </div>
      </div>
    </button>
  );
}

/* ── 메인 페이지 ── */

export default function StoryFlowPage() {
  const [selectedId, setSelectedId] = useState<string | null>('tour');

  const { user } = useAuthStore();
  const {
    progress,
    progressLoaded,
    loading,
    fetchProgress,
    updateChapterStatus,
    resetProgress,
  } = useStoryStore();

  const isLoggedIn = !!user;

  useEffect(() => {
    if (isLoggedIn && !progressLoaded) {
      fetchProgress();
    }
  }, [isLoggedIn, progressLoaded, fetchProgress]);

  const effectiveGetStatus = useCallback((chapterId: string): ChapterStatus => {
    if (!isLoggedIn) return 'available';
    const hasAnyProgress = Object.keys(progress).length > 0;
    if (!hasAnyProgress && chapterId === 'tour') return 'available';
    return progress[chapterId]?.status ?? 'locked';
  }, [isLoggedIn, progress]);

  const selectedChapter = CHAPTER_MAP.get(selectedId ?? '');
  const selectedEnding = ENDING_MAP.get(selectedId ?? '');

  // 엔딩 예측
  const predictedEndingId = useMemo(() => {
    if (!isLoggedIn || Object.keys(progress).length === 0) return null;
    return predictEnding(progress);
  }, [isLoggedIn, progress]);

  const edges = useMemo(() => {
    const result: Edge[] = [];

    for (const ch of STORY_CHAPTERS) {
      const chStatus = effectiveGetStatus(ch.id);
      const chProgress = progress[ch.id];

      if (ch.nextChapterId) {
        const target = CHAPTER_MAP.get(ch.nextChapterId) ?? ENDING_MAP.get(ch.nextChapterId);
        if (target) {
          result.push({
            from: { col: ch.column, row: ch.row },
            to: { col: target.column, row: target.row },
            isActive: chStatus === 'completed',
            isBranch: false,
          });
        }
      }

      if (ch.choices) {
        for (const choice of ch.choices) {
          const target = CHAPTER_MAP.get(choice.nextChapterId) ?? ENDING_MAP.get(choice.nextChapterId);
          if (target) {
            const isChosen = chProgress?.choiceId === choice.id;
            result.push({
              from: { col: ch.column, row: ch.row },
              to: { col: target.column, row: target.row },
              label: choice.label,
              isActive: isChosen,
              isBranch: true,
            });
          }
        }
      }
    }

    return result;
  }, [effectiveGetStatus, progress]);

  const handleStatusChange = useCallback(async (chapterId: string, newStatus: ChapterStatus) => {
    await updateChapterStatus(chapterId, newStatus);
  }, [updateChapterStatus]);

  const handleChoiceSelect = useCallback(async (chapterId: string, choiceId: string) => {
    const currentStatus = effectiveGetStatus(chapterId);
    await updateChapterStatus(chapterId, currentStatus, choiceId);
  }, [effectiveGetStatus, updateChapterStatus]);

  const handleReset = useCallback(async () => {
    if (confirm('스토리 진행 상태를 초기화하시겠습니까?')) {
      await resetProgress();
    }
  }, [resetProgress]);

  const maxCol = Math.max(...STORY_CHAPTERS.map((c) => c.column), ...STORY_ENDINGS.map((e) => e.column));
  const maxRow = Math.max(...STORY_CHAPTERS.map((c) => c.row), ...STORY_ENDINGS.map((e) => e.row));
  const svgW = PADDING_X * 2 + (maxCol + 1) * CELL_W;
  const svgH = PADDING_Y * 2 + (maxRow + 1) * CELL_H;

  const completedCount = Object.values(progress).filter((p) => p.status === 'completed').length;
  const totalChapters = STORY_CHAPTERS.length;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-kappa" />
          <div>
            <h1 className="text-xl font-bold text-text-primary">메인 스토리</h1>
            <p className="text-sm text-text-muted">챕터를 클릭하면 상세 정보를 확인할 수 있습니다</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isLoggedIn && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-text-muted">진행</span>
              <span className="font-semibold text-complete">{completedCount}</span>
              <span className="text-text-muted">/</span>
              <span className="text-text-secondary">{totalChapters}</span>
            </div>
          )}

          {isLoggedIn && completedCount > 0 && (
            <button
              onClick={handleReset}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-text-muted hover:text-incomplete hover:border-incomplete/50 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              초기화
            </button>
          )}
        </div>
      </div>

      {/* 엔딩 예측 배너 */}
      {predictedEndingId && (
        <EndingPredictionBanner
          predictedEndingId={predictedEndingId}
          onClick={() => setSelectedId(predictedEndingId)}
        />
      )}

      {/* 범례 */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px]">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full border border-border/40 bg-surface/30 opacity-50" /> 잠김</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full border border-accent" /> 진행 가능</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full border border-kappa bg-kappa/20" /> 진행 중</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full border border-complete bg-complete/20" /> 완료</span>
        <span className="flex items-center gap-1.5"><span className="w-6 border-t border-dashed border-kappa" /> 분기</span>
        <span className="flex items-center gap-1.5"><span className="w-6 border-t-2 border-complete" /> 선택된 경로</span>
        {predictedEndingId && (
          <span className="flex items-center gap-1.5"><Target className="w-2.5 h-2.5 text-kappa" /> 예상 엔딩</span>
        )}
      </div>

      {/* 플로우차트 + 사이드 패널 (반응형) */}
      <div className="flex flex-col xl:flex-row gap-6 items-start">
        {/* 플로우차트 */}
        <div className="w-full xl:flex-1 xl:min-w-0 overflow-x-auto bg-surface/50 border border-border rounded-xl p-4">
          <svg
            width={svgW}
            height={svgH}
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="block"
          >
            {edges.map((edge, i) => (
              <EdgeLine key={i} {...edge} />
            ))}

            {STORY_CHAPTERS.map((ch) => (
              <ChapterNode
                key={ch.id}
                chapter={ch}
                status={effectiveGetStatus(ch.id)}
                selected={selectedId === ch.id}
                onClick={() => setSelectedId(ch.id)}
              />
            ))}

            {STORY_ENDINGS.map((ending) => (
              <EndingNode
                key={ending.id}
                ending={ending}
                selected={selectedId === ending.id}
                predicted={predictedEndingId === ending.id}
                onClick={() => setSelectedId(ending.id)}
              />
            ))}
          </svg>
        </div>

        {/* 사이드 패널 */}
        <div className="w-full xl:w-80 xl:shrink-0">
          {selectedChapter ? (
            <ChapterDetail
              chapter={selectedChapter}
              status={effectiveGetStatus(selectedChapter.id)}
              progress={progress[selectedChapter.id]}
              isLoggedIn={isLoggedIn}
              onStatusChange={handleStatusChange}
              onChoiceSelect={handleChoiceSelect}
              loading={loading}
            />
          ) : selectedEnding ? (
            <EndingDetail
              ending={selectedEnding}
              predicted={predictedEndingId === selectedEnding.id}
            />
          ) : (
            <div className="bg-surface border border-border rounded-xl p-5 text-center text-sm text-text-muted">
              챕터를 선택하세요
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
