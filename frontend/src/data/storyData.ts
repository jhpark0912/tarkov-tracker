import type { StoryChapter, StoryEnding, StoryProgress } from '../types/story';

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 'tour',
    name: 'Tour',
    description: '타르코프 입문. 각 맵을 순회하며 딜러를 해금하고 기본 생존법을 익힌다.',
    maps: ['Ground Zero', 'Streets', 'Interchange', 'Customs', 'Factory', 'Woods', 'Shoreline', 'Lighthouse', 'Reserve', 'The Lab'],
    nextChapterId: 'falling_skies',
    column: 1,
    row: 0,
    wikiUrl: 'https://escapefromtarkov.fandom.com/wiki/Tour',
    tip: '각 맵에서 특정 딜러의 퀘스트를 완료해야 합니다. Ground Zero에서 시작하세요.',
  },
  {
    id: 'falling_skies',
    name: 'Falling Skies',
    description: '추락한 비행기를 조사하고 블랙박스를 회수한다. 프라포르에게 증거를 전달할지 결정.',
    maps: ['Woods', 'Shoreline'],
    nextChapterId: 'the_ticket',
    column: 1,
    row: 1,
    wikiUrl: 'https://escapefromtarkov.fandom.com/wiki/Falling_Skies',
    tip: 'Woods와 Shoreline에서 추락 지점을 찾아야 합니다.',
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
    wikiUrl: 'https://escapefromtarkov.fandom.com/wiki/The_Ticket',
    tip: '첫 번째 분기점입니다. 선택에 따라 스토리 경로가 완전히 달라집니다.',
  },
  {
    id: 'they_are_already_here',
    name: 'They Are Already Here',
    description: '컬티스트 활동을 조사하며 TerraGroup의 진실에 접근한다.',
    maps: ['Lighthouse', 'Woods', 'Shoreline', 'Customs', 'Interchange'],
    nextChapterId: 'blue_fire',
    column: 0,
    row: 3,
    wikiUrl: 'https://escapefromtarkov.fandom.com/wiki/They_Are_Already_Here',
    tip: 'Kerman 루트. 여러 맵을 돌며 컬티스트 단서를 수집합니다.',
  },
  {
    id: 'batya',
    name: 'Batya',
    description: 'BEAR 전초기지를 조사하고 군사적 탈출 루트를 개척한다.',
    maps: ['Customs', 'Reserve'],
    nextChapterId: 'the_labyrinth',
    column: 2,
    row: 3,
    wikiUrl: 'https://escapefromtarkov.fandom.com/wiki/Batya',
    tip: 'Prapor 루트. Reserve 지하 벙커 탐험이 핵심입니다.',
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
    wikiUrl: 'https://escapefromtarkov.fandom.com/wiki/Blue_Fire',
    tip: '두 번째 분기점. "증거 공개"를 선택하면 좋은 엔딩으로 갈 수 있습니다.',
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
    wikiUrl: 'https://escapefromtarkov.fandom.com/wiki/The_Labyrinth',
    tip: '두 번째 분기점. 5억 루블이 필요하지만 더 나은 엔딩으로 이어집니다.',
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
    wikiUrl: 'https://escapefromtarkov.fandom.com/wiki/Accidental_Witness',
    tip: '최종 엔딩 분기. Kerman 전달 = Savior (최선), Prapor 전달 = Survivor.',
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
    wikiUrl: 'https://escapefromtarkov.fandom.com/wiki/The_Unheard',
    tip: '나쁜 엔딩 경로. Debtor가 Fallen보다는 나은 결말입니다.',
  },
];

export const STORY_ENDINGS: StoryEnding[] = [
  {
    id: 'ending_savior',
    name: 'Savior',
    subtitle: '인류를 위한 탈출',
    description: 'TerraGroup의 진실을 세상에 알리고 탈출에 성공한다.',
    color: 'text-complete',
    column: 0,
    row: 6,
    reward: 'TerraGroup Labs 열쇠카드 (영구), 특수 탈출 장비',
  },
  {
    id: 'ending_survivor',
    name: 'Survivor',
    subtitle: '생존자의 탈출',
    description: '살아남았지만, 타르코프를 파괴한 사슬의 일부가 되었다.',
    color: 'text-kappa',
    column: 1,
    row: 6,
    reward: '군용 탈출 장비, 고급 무기 세트',
  },
  {
    id: 'ending_debtor',
    name: 'Debtor',
    subtitle: '빚진 자',
    description: '진실에 거의 닿았지만, 두려움 앞에 멈춰 섰다.',
    color: 'text-orange-400',
    column: 2,
    row: 6,
    reward: '기본 탈출 장비',
  },
  {
    id: 'ending_fallen',
    name: 'Fallen',
    subtitle: '어둠 속으로',
    description: '타르코프는 무너졌고, 당신도 함께 무너졌다.',
    color: 'text-incomplete',
    column: 3,
    row: 6,
    reward: '없음',
  },
];

/** 챕터 ID로 빠르게 조회하기 위한 맵 */
export const CHAPTER_MAP = new Map(STORY_CHAPTERS.map((c) => [c.id, c]));

/** 엔딩 ID로 빠르게 조회하기 위한 맵 */
export const ENDING_MAP = new Map(STORY_ENDINGS.map((e) => [e.id, e]));

/**
 * 사용자의 분기 선택 기반 엔딩 예측.
 * 선택된 경로를 따라가며 도달 가능한 엔딩 ID를 반환한다.
 */
export function predictEnding(progress: Record<string, StoryProgress>): string | null {
  // 선택지를 역순으로 추적: 마지막 분기 챕터부터 확인
  const branchChapters = ['accidental_witness', 'the_unheard', 'the_labyrinth', 'blue_fire', 'the_ticket'];

  for (const chId of branchChapters) {
    const p = progress[chId];
    if (!p?.choiceId) continue;

    const chapter = CHAPTER_MAP.get(chId);
    if (!chapter?.choices) continue;

    const choice = chapter.choices.find((c) => c.id === p.choiceId);
    if (!choice) continue;

    // 엔딩으로 직접 연결되면 반환
    if (choice.nextChapterId.startsWith('ending_')) {
      return choice.nextChapterId;
    }

    // 다음 챕터가 엔딩 직전 챕터면, 재귀적으로 해당 챕터의 선택을 확인
    // (이미 branchChapters 순서로 확인하므로 자연스럽게 처리됨)
  }

  return null;
}
