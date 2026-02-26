import { useState, useCallback } from 'react';
import { BookOpen, Check, Circle, GitBranch, Star } from 'lucide-react';
import { cn } from '../../utils/cn';

/* ── 샘플 스토리 데이터 (추후 JSON/API 분리) ── */

type ChapterStatus = 'locked' | 'available' | 'in_progress' | 'completed';

interface StoryChoice {
  id: string;
  label: string;
  description: string;
  nextChapterId: string;
}

interface StoryChapter {
  id: string;
  name: string;
  description: string;
  maps: string[];
  choices?: StoryChoice[];
  nextChapterId?: string; // 선형 진행일 때
  endingId?: string;      // 엔딩으로 연결될 때
  column: number;         // 플로우차트 X 위치 (0-based)
  row: number;            // 플로우차트 Y 위치 (0-based)
}

interface StoryEnding {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  color: string;
  column: number;
  row: number;
}

const SAMPLE_CHAPTERS: StoryChapter[] = [
  {
    id: 'tour',
    name: 'Tour',
    description: '타르코프 입문. 각 맵을 순회하며 딜러를 해금하고 기본 생존법을 익힌다.',
    maps: ['Ground Zero', 'Streets', 'Interchange', 'Customs', 'Factory', 'Woods', 'Shoreline', 'Lighthouse', 'Reserve', 'The Lab'],
    nextChapterId: 'falling_skies',
    column: 1,
    row: 0,
  },
  {
    id: 'falling_skies',
    name: 'Falling Skies',
    description: '추락한 비행기를 조사하고 블랙박스를 회수한다. 프라포르에게 증거를 전달할지 결정.',
    maps: ['Woods', 'Shoreline'],
    nextChapterId: 'the_ticket',
    column: 1,
    row: 1,
  },
  {
    id: 'the_ticket',
    name: 'The Ticket',
    description: '탈출 티켓을 확보하기 위한 여정. Kerman과의 첫 접촉.',
    maps: ['Customs', 'Interchange'],
    choices: [
      { id: 'trust_kerman', label: 'Kerman을 신뢰', description: 'Kerman과 협력하여 TerraGroup의 비밀을 폭로하는 길', nextChapterId: 'they_are_already_here' },
      { id: 'trust_prapor', label: 'Prapor를 신뢰', description: 'Prapor에게 증거를 넘기고 무력 탈출을 준비하는 길', nextChapterId: 'batya' },
    ],
    column: 1,
    row: 2,
  },
  {
    id: 'they_are_already_here',
    name: 'They Are Already Here',
    description: '컬티스트 활동을 조사하며 TerraGroup의 진실에 접근한다.',
    maps: ['Lighthouse', 'Woods', 'Shoreline', 'Customs', 'Interchange'],
    nextChapterId: 'blue_fire',
    column: 0,
    row: 3,
  },
  {
    id: 'batya',
    name: 'Batya',
    description: 'BEAR 전초기지를 조사하고 군사적 탈출 루트를 개척한다.',
    maps: ['Customs', 'Reserve'],
    nextChapterId: 'the_labyrinth',
    column: 2,
    row: 3,
  },
  {
    id: 'blue_fire',
    name: 'Blue Fire',
    description: 'TerraGroup 연구시설 깊숙이 침투. 결정적 증거를 확보.',
    maps: ['The Lab', 'Streets'],
    choices: [
      { id: 'expose', label: '증거 공개 결심', description: 'Kerman과 함께 세상에 진실을 폭로하기로 결심한다', nextChapterId: 'accidental_witness' },
      { id: 'hesitate', label: '망설임', description: '두려움에 멈추고, Kerman의 신뢰를 잃는다', nextChapterId: 'the_unheard' },
    ],
    column: 0,
    row: 4,
  },
  {
    id: 'the_labyrinth',
    name: 'The Labyrinth',
    description: '미궁 같은 지하 시설을 탐험하며 탈출 루트를 찾는다.',
    maps: ['Reserve', 'The Lab'],
    choices: [
      { id: 'pay_prapor', label: 'Prapor에게 5억 루블 지불', description: '터미널 접근권을 돈으로 산다', nextChapterId: 'accidental_witness' },
      { id: 'refuse', label: '거부', description: 'Prapor의 제안을 거부하고 홀로 길을 찾는다', nextChapterId: 'the_unheard' },
    ],
    column: 2,
    row: 4,
  },
  {
    id: 'accidental_witness',
    name: 'Accidental Witness',
    description: '터미널 최종 미션. 모든 것이 결정되는 순간.',
    maps: ['Terminal'],
    choices: [
      { id: 'hand_kerman', label: 'Kerman에게 증거 전달', description: '인류를 위한 탈출 - 최선의 결말', nextChapterId: 'ending_savior' },
      { id: 'hand_prapor_final', label: 'Prapor에게 증거 전달', description: '생존만을 위한 탈출', nextChapterId: 'ending_survivor' },
    ],
    column: 1,
    row: 5,
  },
  {
    id: 'the_unheard',
    name: 'The Unheard',
    description: '진실을 외면한 대가. 어둠 속으로 빠져든다.',
    maps: ['Streets'],
    choices: [
      { id: 'regret', label: '후회하며 발버둥', description: '늦었지만 무언가를 하려 한다', nextChapterId: 'ending_debtor' },
      { id: 'surrender', label: '포기', description: '모든 것을 놓아버린다', nextChapterId: 'ending_fallen' },
    ],
    column: 2,
    row: 5,
  },
];

const SAMPLE_ENDINGS: StoryEnding[] = [
  { id: 'ending_savior', name: 'Savior', subtitle: '인류를 위한 탈출', description: 'TerraGroup의 진실을 세상에 알리고 탈출에 성공한다.', color: 'text-complete', column: 0, row: 6 },
  { id: 'ending_survivor', name: 'Survivor', subtitle: '생존자의 탈출', description: '살아남았지만, 타르코프를 파괴한 사슬의 일부가 되었다.', color: 'text-kappa', column: 1, row: 6 },
  { id: 'ending_debtor', name: 'Debtor', subtitle: '빚진 자', description: '진실에 거의 닿았지만, 두려움 앞에 멈춰 섰다.', color: 'text-orange-400', column: 2, row: 6 },
  { id: 'ending_fallen', name: 'Fallen', subtitle: '어둠 속으로', description: '타르코프는 무너졌고, 당신도 함께 무너졌다.', color: 'text-incomplete', column: 3, row: 6 },
];

/* ── 샘플 유저 진행 상태 ── */
const SAMPLE_PROGRESS: Record<string, { status: ChapterStatus; choiceId?: string }> = {
  tour: { status: 'completed' },
  falling_skies: { status: 'completed' },
  the_ticket: { status: 'completed', choiceId: 'trust_kerman' },
  they_are_already_here: { status: 'in_progress' },
};

/* ── 유틸 ── */
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

/* ── 컴포넌트 ── */

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

function EndingNode({ ending }: { ending: StoryEnding }) {
  const x = PADDING_X + ending.column * CELL_W;
  const y = PADDING_Y + ending.row * CELL_H;

  return (
    <foreignObject x={x} y={y} width={NODE_W} height={ENDING_H}>
      <div className="h-full rounded-lg border border-border/60 bg-elevated/50 px-3 py-2 flex flex-col justify-center">
        <span className={cn('text-xs font-bold', ending.color)}>{ending.name}</span>
        <span className="text-[10px] text-text-muted">{ending.subtitle}</span>
      </div>
    </foreignObject>
  );
}

function EdgeLine({
  from,
  to,
  label,
  isActive,
  isBranch,
}: {
  from: { col: number; row: number };
  to: { col: number; row: number };
  label?: string;
  isActive: boolean;
  isBranch: boolean;
}) {
  const start = nodeCenter(from.col, from.row);
  const end = nodeCenter(to.col, to.row);
  start.y += NODE_H / 2;
  end.y -= NODE_H / 2;

  // 베지어 커브
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
      {/* 화살표 */}
      <circle cx={end.x} cy={end.y} r={3} fill={isActive ? '#4ecca3' : '#334155'} />
      {/* 분기 라벨 */}
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

function ChapterDetail({
  chapter,
  status,
  progress,
}: {
  chapter: StoryChapter;
  status: ChapterStatus;
  progress?: { choiceId?: string };
}) {
  const statusLabels: Record<ChapterStatus, { text: string; color: string }> = {
    locked: { text: '잠김', color: 'text-text-muted' },
    available: { text: '진행 가능', color: 'text-accent' },
    in_progress: { text: '진행 중', color: 'text-kappa' },
    completed: { text: '완료', color: 'text-complete' },
  };

  const sl = statusLabels[status];

  return (
    <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-text-primary">{chapter.name}</h3>
        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full border', sl.color)}>
          {sl.text}
        </span>
      </div>

      <p className="text-sm text-text-secondary leading-relaxed">{chapter.description}</p>

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

      {chapter.choices && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <GitBranch className="w-3.5 h-3.5 text-kappa" />
            <span className="text-xs font-medium text-kappa">분기 선택</span>
          </div>
          <div className="space-y-2">
            {chapter.choices.map((choice) => {
              const isChosen = progress?.choiceId === choice.id;
              return (
                <div
                  key={choice.id}
                  className={cn(
                    'rounded-lg border p-3 transition-all',
                    isChosen
                      ? 'border-complete bg-complete/10'
                      : 'border-border/50 bg-elevated/50',
                  )}
                >
                  <div className="flex items-center gap-2">
                    {isChosen && <Check className="w-3.5 h-3.5 text-complete" />}
                    <span className="text-xs font-semibold text-text-primary">{choice.label}</span>
                  </div>
                  <p className="text-[11px] text-text-muted mt-1">{choice.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function StoryFlowPage() {
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>('the_ticket');

  const getStatus = useCallback((chapterId: string): ChapterStatus => {
    return SAMPLE_PROGRESS[chapterId]?.status ?? 'locked';
  }, []);

  const selectedChapter = SAMPLE_CHAPTERS.find((c) => c.id === selectedChapterId);

  // 엣지 데이터 생성
  const edges: { from: { col: number; row: number }; to: { col: number; row: number }; label?: string; isActive: boolean; isBranch: boolean }[] = [];

  for (const ch of SAMPLE_CHAPTERS) {
    const chStatus = getStatus(ch.id);
    const chProgress = SAMPLE_PROGRESS[ch.id];

    if (ch.nextChapterId) {
      const target = SAMPLE_CHAPTERS.find((t) => t.id === ch.nextChapterId)
        ?? SAMPLE_ENDINGS.find((e) => e.id === ch.nextChapterId);
      if (target) {
        edges.push({
          from: { col: ch.column, row: ch.row },
          to: { col: target.column, row: target.row },
          isActive: chStatus === 'completed',
          isBranch: false,
        });
      }
    }

    if (ch.choices) {
      for (const choice of ch.choices) {
        const target = SAMPLE_CHAPTERS.find((t) => t.id === choice.nextChapterId)
          ?? SAMPLE_ENDINGS.find((e) => e.id === choice.nextChapterId);
        if (target) {
          const isChosen = chProgress?.choiceId === choice.id;
          edges.push({
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

  const maxCol = Math.max(...SAMPLE_CHAPTERS.map((c) => c.column), ...SAMPLE_ENDINGS.map((e) => e.column));
  const maxRow = Math.max(...SAMPLE_CHAPTERS.map((c) => c.row), ...SAMPLE_ENDINGS.map((e) => e.row));
  const svgW = PADDING_X * 2 + (maxCol + 1) * CELL_W;
  const svgH = PADDING_Y * 2 + (maxRow + 1) * CELL_H;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <BookOpen className="w-6 h-6 text-kappa" />
        <div>
          <h1 className="text-xl font-bold text-text-primary">메인 스토리</h1>
          <p className="text-sm text-text-muted">챕터를 클릭하면 상세 정보를 확인할 수 있습니다</p>
        </div>
      </div>

      {/* 범례 */}
      <div className="flex flex-wrap gap-4 text-[11px]">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full border border-border/40 bg-surface/30 opacity-50" /> 잠김</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full border border-accent" /> 진행 가능</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full border border-kappa bg-kappa/20" /> 진행 중</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full border border-complete bg-complete/20" /> 완료</span>
        <span className="flex items-center gap-1.5"><span className="w-6 border-t border-dashed border-kappa" /> 분기</span>
        <span className="flex items-center gap-1.5"><span className="w-6 border-t-2 border-complete" /> 선택된 경로</span>
      </div>

      <div className="flex gap-6 items-start">
        {/* 플로우차트 */}
        <div className="flex-1 overflow-x-auto bg-surface/50 border border-border rounded-xl p-2">
          <svg width={svgW} height={svgH} className="min-w-full">
            {/* 엣지 먼저 렌더 */}
            {edges.map((edge, i) => (
              <EdgeLine key={i} {...edge} />
            ))}

            {/* 챕터 노드 */}
            {SAMPLE_CHAPTERS.map((ch) => (
              <ChapterNode
                key={ch.id}
                chapter={ch}
                status={getStatus(ch.id)}
                selected={selectedChapterId === ch.id}
                onClick={() => setSelectedChapterId(ch.id)}
              />
            ))}

            {/* 엔딩 노드 */}
            {SAMPLE_ENDINGS.map((ending) => (
              <EndingNode key={ending.id} ending={ending} />
            ))}
          </svg>
        </div>

        {/* 사이드 패널 - 선택된 챕터 상세 */}
        <div className="w-80 shrink-0">
          {selectedChapter ? (
            <ChapterDetail
              chapter={selectedChapter}
              status={getStatus(selectedChapter.id)}
              progress={SAMPLE_PROGRESS[selectedChapter.id]}
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
