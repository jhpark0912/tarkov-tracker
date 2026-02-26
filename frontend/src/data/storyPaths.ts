/** 엔딩별 경로 정의 — 어떤 노드와 엣지가 해당 경로에 포함되는지 */

export interface StoryEndingMeta {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  color: string;
  reward?: string;
  /** 이 경로에 포함되는 노드 ID */
  nodeIds: string[];
  /** 비용 요약 */
  estimatedCost: string;
  /** 스텝 수 */
  stepCount: number;
}

/** 공통 시작 구간 (Tour + Falling Skies + The Ticket 공통) */
const COMMON_START = [
  'tour_01', 'tour_02', 'tour_03', 'tour_04', 'tour_05',
  'tour_06', 'tour_07', 'tour_08', 'tour_09', 'tour_10',
  'fs_01', 'fs_02', 'fs_03', 'fs_04', 'fs_05',
  'fs_06', 'fs_07', 'fs_08', 'fs_09', 'fs_10',
  'tt_01', 'tt_02', 'tt_03', 'tt_04', 'tt_05',
  'tt_06', 'tt_07', 'tt_08', 'tt_09', 'tt_10',
];

/** Kerman 루트 공통 (They Are Already Here + Blue Fire) */
const KERMAN_ROUTE = [
  'ta_01', 'ta_02', 'ta_03', 'ta_04', 'ta_05',
  'ta_06', 'ta_07', 'ta_08', 'ta_09', 'ta_10', 'ta_11',
  'bf_01', 'bf_02', 'bf_03', 'bf_04', 'bf_05',
  'bf_06', 'bf_07', 'bf_08', 'bf_09',
];

/** Prapor 루트 공통 (Batya + The Labyrinth) */
const PRAPOR_ROUTE = [
  'bt_01', 'bt_02', 'bt_03', 'bt_04', 'bt_05',
  'bt_06', 'bt_07', 'bt_08', 'bt_09', 'bt_10', 'bt_11', 'bt_12',
  'lb_01', 'lb_02', 'lb_03', 'lb_04', 'lb_05',
  'lb_06', 'lb_07', 'lb_08', 'lb_09', 'lb_10', 'lb_11',
];

/** Accidental Witness 공통 */
const ACCIDENTAL_WITNESS = [
  'aw_01', 'aw_02', 'aw_03', 'aw_04', 'aw_05',
  'aw_06', 'aw_07', 'aw_08',
];

/** The Unheard 공통 */
const THE_UNHEARD = [
  'tu_01', 'tu_02', 'tu_03', 'tu_04', 'tu_05',
  'tu_06', 'tu_07', 'tu_08', 'tu_09', 'tu_10', 'tu_11', 'tu_12',
];

export const STORY_ENDINGS: StoryEndingMeta[] = [
  {
    id: 'savior',
    name: 'Savior',
    subtitle: '인류를 위한 탈출',
    description: 'Kerman을 신뢰하고, 증거를 공개하며, Kerman에게 최종 증거를 전달하는 최선의 결말. TerraGroup의 진실이 세상에 알려진다.',
    color: 'text-complete',
    reward: 'TerraGroup Labs 영구 키카드, 특수 탈출 장비, "Savior" 업적',
    nodeIds: [...COMMON_START, ...KERMAN_ROUTE, ...ACCIDENTAL_WITNESS, 'ending_savior'],
    estimatedCost: '~300M₽ + 40 BTC + $20,000',
    stepCount: 59,
  },
  {
    id: 'survivor',
    name: 'Survivor',
    subtitle: '생존자의 탈출',
    description: 'Kerman 또는 Prapor 루트를 통해 Accidental Witness에 도달한 뒤, Prapor에게 증거를 넘기는 차선의 결말.',
    color: 'text-kappa',
    reward: '군용 탈출 장비, 고급 무기 세트, "Survivor" 업적',
    nodeIds: [...COMMON_START, ...KERMAN_ROUTE, ...ACCIDENTAL_WITNESS, 'ending_survivor'],
    estimatedCost: '~300M₽ + 40 BTC + $20,000',
    stepCount: 59,
  },
  {
    id: 'debtor',
    name: 'Debtor',
    subtitle: '빚진 자',
    description: '증거 공개를 망설이거나 Prapor 루트에서 거부하여 The Unheard 경로에 진입, 마지막에 후회하며 발버둥치는 결말.',
    color: 'text-orange-400',
    reward: '기본 탈출 장비, "Debtor" 업적',
    nodeIds: [...COMMON_START, ...PRAPOR_ROUTE, ...THE_UNHEARD, 'ending_debtor'],
    estimatedCost: '~800M₽ + 40 BTC + $20,000',
    stepCount: 65,
  },
  {
    id: 'fallen',
    name: 'Fallen',
    subtitle: '어둠 속으로',
    description: 'The Unheard 경로에서 모든 것을 포기하는 최악의 결말. 타르코프와 함께 무너진다.',
    color: 'text-incomplete',
    reward: '"Fallen" 업적',
    nodeIds: [...COMMON_START, ...PRAPOR_ROUTE, ...THE_UNHEARD, 'ending_fallen'],
    estimatedCost: '~800M₽ + 40 BTC + $20,000',
    stepCount: 65,
  },
];

/** 엔딩 ID로 빠른 조회 */
export const ENDING_META_MAP = new Map(STORY_ENDINGS.map((e) => [e.id, e]));
