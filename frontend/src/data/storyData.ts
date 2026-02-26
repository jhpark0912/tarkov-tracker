import type { StoryChapter, StoryEnding, StoryProgress } from '../types/story';

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 'tour',
    name: 'Tour',
    description: 'TerraGroup 폭발 이후 Ground Zero에서 탈출하며 타르코프를 탐험한다. 각 맵을 순회하며 딜러를 해금하고, 최종적으로 The Lab에 도달하여 탈출 경로를 발견하는 입문 챕터.',
    maps: ['Ground Zero', 'Streets of Tarkov', 'Interchange', 'Customs', 'Factory', 'Woods', 'Shoreline', 'Lighthouse', 'Reserve', 'The Lab'],
    nextChapterId: 'falling_skies',
    column: 1,
    row: 0,
    wikiUrl: 'https://escapefromtarkov.fandom.com/wiki/Tour',
    tip: '게임 시작 시 자동으로 활성화됩니다. Ground Zero 튜토리얼 → Therapist에게 25만 루블 지불(Streets 해금) → Ragman(Interchange) → Skier(Customs) → Mechanic(Factory) → Skier(Woods) → Shoreline 초소 인터콤 → Mechanic에게 $20,000(Lighthouse) → Prapor에게 PMC 인식표 5개(Reserve) → The Lab 순으로 진행.',
    quests: [
      'Ground Zero 탈출 (튜토리얼)',
      'Therapist - Streets of Tarkov 해금 (250,000₽)',
      'Ragman - Interchange 정찰 생존',
      'Skier - Customs 건축 자재 5개 납품 (FIR)',
      'Mechanic - Factory 무기 2개 납품 (FIR)',
      'Skier - Woods 적 3명 처치 후 탈출',
      'Shoreline 감시탑 인터콤 접촉',
      'Mechanic - Lighthouse 해금 ($20,000)',
      'Prapor - PMC 인식표 5개 납품 (FIR) + Shoreline 탈출',
      'The Lab - 경영진 사무실(O21) 수색 → 서버실 수색 → 배수 시스템 탈출 경로 발견',
    ],
    dealers: ['Therapist', 'Ragman', 'Skier', 'Mechanic', 'Prapor', 'Peacekeeper'],
  },
  {
    id: 'falling_skies',
    name: 'Falling Skies',
    description: 'Woods에 추락한 비행기를 조사하고 블랙박스를 회수한다. 비행 기록 장치, 승무원 녹취록, Elektronik의 플래시 드라이브를 수집하여 사건의 진실을 밝힌다. 최종적으로 장갑 케이스를 Prapor에게 전달할지 선택.',
    maps: ['Woods', 'Shoreline'],
    nextChapterId: 'the_ticket',
    column: 1,
    row: 1,
    wikiUrl: 'https://escapefromtarkov.fandom.com/wiki/Falling_Skies',
    tip: 'Tour 진행 중 Mechanic에게 추락 비행기에 대해 물어야 활성화됩니다. Shoreline의 G-Wagon에서 플래시 드라이브를 회수하고, 비행 기록 장치를 찾아 분석을 의뢰하세요. 최종 장갑 케이스 선택: 보관(Prapor 평판 -0.3) / Prapor 전달(150만₽) / 거짓말(100만₽).',
    quests: [
      'Woods 동쪽 추락 비행기 위치 확인',
      'Prapor에게 사건 보고 + 5개 딜러에게 정보 문의',
      'Shoreline G-Wagon SUV에서 플래시 드라이브 회수',
      'Prapor에게 전달 → 1시간 대기',
      '추락기 우측에서 비행 기록 장치 회수',
      'Shoreline 섬 집 파괴된 방에 기록 장치 은닉',
      'Prapor에게 충전지 3개 + PCB 5개 + 도구 세트 2개 납품 (FIR)',
      '3~5시간 대기 후 분석 완료',
      'Shoreline 의장실에서 승무원 녹취록 + Elektronik 플래시 드라이브 회수',
      '추락기 조종석에서 장갑 케이스 회수 → 선택: 보관/Prapor 전달/거짓말',
    ],
    dealers: ['Prapor', 'Mechanic', 'Therapist'],
  },
  {
    id: 'the_ticket',
    name: 'The Ticket',
    description: 'Mr. Kerman과의 첫 접촉. Lighthouse에서 Prapor 캠프를 조사하고, Lightkeeper와 접촉하며, Terminal 진입을 위한 준비를 한다. Kerman의 제안을 수락할지 여부에 따라 5가지 경로로 분기되는 핵심 분기점.',
    maps: ['Lighthouse', 'Interchange', 'Terminal'],
    choices: [
      { id: 'trust_kerman', label: 'Kerman을 신뢰', description: 'Kerman의 제안을 수락하고 TerraGroup 증거를 수집하여 진실을 폭로하는 길. They Are Already Here로 진행.', nextChapterId: 'they_are_already_here' },
      { id: 'trust_prapor', label: 'Prapor를 신뢰', description: 'Kerman의 제안을 거부하고 군사적 탈출 루트를 준비하는 길. Batya로 진행.', nextChapterId: 'batya' },
    ],
    column: 1,
    row: 2,
    wikiUrl: 'https://escapefromtarkov.fandom.com/wiki/The_Ticket',
    tip: '인텔리전스 센터 Lv.1 필요. Lighthouse에서 Prapor 캠프 조사 → Lightkeeper 평판 획득 → TerraGroup "Blue Folders" 3개 수집 → Interchange 단일 레이드 15킬 → Lab 마스터 패스 + RFID 암호화 장치 + 물리적 비트코인 40개 → Terminal 진입.',
    quests: [
      '인텔리전스 센터 Lv.1 확보',
      'Lighthouse에서 Prapor 캠프 조사',
      'Lightkeeper 평판 획득',
      'TerraGroup "Blue Folders" 자료 3개 수집',
      'Interchange 단일 레이드에서 15명 처치',
      'Lab 마스터 패스 확보',
      'RFID 카드 암호화 장치 확보',
      '물리적 비트코인 40개 수집',
      'Terminal 진입',
    ],
    dealers: ['Mechanic', 'Lightkeeper', 'Prapor'],
  },
  {
    id: 'they_are_already_here',
    name: 'They Are Already Here',
    description: '컬티스트 조직 "세상의 눈(Eye of the World)"을 조사한다. 4개 맵의 표시된 장소에서 단서를 수집하고, Interchange 지하 비밀 시설에 침투하여 서버 데이터를 추출한다. Kerman 루트의 핵심 탐사 챕터.',
    maps: ['Customs', 'Reserve', 'Woods', 'Shoreline', 'Lighthouse', 'Streets of Tarkov', 'Interchange'],
    nextChapterId: 'blue_fire',
    column: 0,
    row: 3,
    wikiUrl: 'https://escapefromtarkov.fandom.com/wiki/They_Are_Already_Here',
    tip: '4개 맵 중 하나의 표시된 방(Customs 3층 기숙사, Reserve RB-BK/VO/PKPM, Woods 마을, Shoreline 섬 집)에서 "세상의 눈" 메모를 찾아야 시작됩니다. Lighthouse 고문실 → Streets 아파트 → 컬티스트 성직자 2명 처치 → 4개 맵 순회 조사 → Interchange 비밀 시설 침투(키카드 복원, 전원·냉각 복구, 플래시 드라이브 설치·회수).',
    quests: [
      '4개 맵 중 하나에서 "세상의 눈" 메모 발견',
      'Lighthouse 고문실에서 음성 증거 회수',
      'Streets of Tarkov 피해자 아파트 조사 (문서 + 녹음 수집)',
      'Mechanic에게 "세상의 눈" 심볼 문의',
      '컬티스트 성직자 2명 처치',
      'Lighthouse: 약탈된 샬레 침실 조사',
      'Woods: 컬티스트 집 신문 증거 수집',
      'Shoreline: 라디오 타워 오두막 수리 (도구 세트 필요)',
      'Interchange: 손상된 키카드 복원 → 발전소 지하 비밀 시설 침투',
      '시설 전원 복구 → 서버실 냉각 시스템 활성화 → 플래시 드라이브 설치/회수',
      'Mechanic에게 완성된 플래시 드라이브 전달',
    ],
    dealers: ['Mechanic'],
  },
  {
    id: 'batya',
    name: 'Batya',
    description: 'BEAR 특수작전 분대 "보가티르(Bogatyr)"의 흔적을 추적한다. Woods·Interchange의 전초기지를 조사하고, Lightkeeper와 접촉하여 배신자를 밝힌다. 전투 도전 과제(15킬 연속, PMC 4킬 등)를 완료해야 하는 Prapor 루트의 전투 중심 챕터.',
    maps: ['Customs', 'Reserve', 'Shoreline', 'Woods', 'Interchange', 'Lighthouse'],
    nextChapterId: 'the_labyrinth',
    column: 2,
    row: 3,
    wikiUrl: 'https://escapefromtarkov.fandom.com/wiki/Batya',
    tip: '4개 맵 중 하나(Customs Scav 기지, Reserve 레이돔, Shoreline 벙커, Woods USEC 캠프)에서 Bogatyr 패치를 찾아야 시작. Jaeger에게 문의 → Woods Ryabina + Interchange Carousel/Gnezdo 전초기지 조사 → Moreman 전화기 회수(Woods ZB-016 근처) → 인텔리전스 센터 Lv.3 필요 → Lightkeeper 접촉(주파수 35.70, 코드 27.893.2000).',
    quests: [
      '4개 맵 중 하나에서 Bogatyr 패치 발견',
      'Jaeger에게 패치 문의',
      'Woods: Ryabina 전초기지 조사 (Strelets 부적 + 철수 보고서)',
      'Interchange: Carousel 전초기지 (Taran 엽서 + Voevoda 녹음기 + 개인 파일)',
      'Interchange: Gnezdo 전초기지 (Moreman 개인 파일 + 작전 보고서 + 코드 메모)',
      'Woods: Moreman 전화기 + 인식표 + 코드 메모 회수 (ZB-016 근처 매복지)',
      '작업대 Lv.1에서 전화기 음성 테이프 제작',
      '인텔리전스 센터 Lv.3 → Voevoda 연락 (주파수 35.70)',
      'Lightkeeper에게 5개 아이템 전달',
      '전투 도전: 15킬 연속 / PMC 4킬 / 돌격소총 Lv.10 / 경기관총 Lv.5 / 스트레스 저항 Lv.10 / 근력 Lv.15',
      'BEAR 캠프 조사 → 배신자(Prapor + "장군") 식별',
      'Lightkeeper 압박 → 비밀 요원 문서 획득 (24시간 대기)',
    ],
    dealers: ['Jaeger', 'Lightkeeper', 'Prapor'],
  },
  {
    id: 'blue_fire',
    name: 'Blue Fire',
    description: 'EMP 무기(Item #1156)를 조사한다. 도시 전역의 전자장비를 무력화시킨 전자기 펄스의 원인을 추적하며, TerraGroup 연구시설에서 장치 파편을 회수하고 The Lab 서버실에 해킹 장치를 설치한다.',
    maps: ['Streets of Tarkov', 'The Lab', 'Ground Zero', 'Lighthouse'],
    choices: [
      { id: 'expose', label: '증거 공개 결심', description: '장치 파편을 Mechanic에게 전달하고 전체 조사를 완료한다. Accidental Witness로 진행.', nextChapterId: 'accidental_witness' },
      { id: 'hesitate', label: '망설임', description: '장치 파편을 보관하고 조사를 중단한다. The Unheard로 진행.', nextChapterId: 'the_unheard' },
    ],
    column: 0,
    row: 4,
    wikiUrl: 'https://escapefromtarkov.fandom.com/wiki/Blue_Fire',
    tip: 'EMERCOM 전단지 또는 Item #1156 메모를 찾아야 시작 (Woods EMERCOM 캠프 / Interchange 텐트 / The Lab). Mechanic에게 EMP 폭발 문의 → 장치 파편 회수(LexOs 딜러십 또는 Chekannaya 13) → The Lab 서버실에 해킹 장치 설치. 장치 파편을 Mechanic에게 넘기면 150만₽ + 좋은 엔딩 경로.',
    quests: [
      'EMERCOM 전단지 또는 Item #1156 메모 발견',
      'Mechanic에게 EMP 폭발 문의',
      '미지의 장치 파편 회수 (LexOs 딜러십 또는 Chekannaya 13 표시된 방)',
      'Mechanic에게 파편 전달',
      'The Lab 서버실(1층)에 로컬 네트워크 해킹 장치 설치',
      '선택: 파편 보관(Just Business 업적) / Mechanic 전달(150만₽)',
      'Item 1156 관련 메모 찾기 (Ground Zero, Lighthouse, The Lab)',
      'Rus Post 사무실 조사 (음성 테이프 3개 수집)',
      'Rus Post 차량에서 Item 1156 설계도 확보',
    ],
    dealers: ['Mechanic'],
  },
  {
    id: 'the_labyrinth',
    name: 'The Labyrinth',
    description: 'Shoreline Health Resort 서쪽 동 지하에 위치한 Knossos LLC 시설 "The Labyrinth"를 탐험한다. BEAR 분대 "Leshy"의 흔적을 추적하고, 5구의 연구원 시신을 조사하며, 관찰실에서 결정적 증거(과학자 음성 테이프)를 회수한다.',
    maps: ['Shoreline', 'The Labyrinth'],
    choices: [
      { id: 'pay_prapor', label: 'Prapor에게 5억 루블 지불', description: '음성 테이프를 Jaeger에게 전달하고 Terminal 접근권을 확보한다. Accidental Witness로 진행.', nextChapterId: 'accidental_witness' },
      { id: 'refuse', label: '거부', description: '독자적으로 탈출 경로를 찾는다. The Unheard로 진행.', nextChapterId: 'the_unheard' },
    ],
    column: 2,
    row: 4,
    wikiUrl: 'https://escapefromtarkov.fandom.com/wiki/The_Labyrinth_(story_chapter)',
    tip: 'Labrys 접근 키카드 필요 (Jaeger에게 요청 후 48시간 대기). 시설 내에서 Leshy의 명령서 → 프로토타입 무기 지역 → Leshy의 일지(고문실) → 연구원 시신 5구 조사 + 조수 메모 5개 수집 → 관찰실 열쇠로 잠긴 방 진입 → 과학자 음성 테이프 회수. 보상: AI AXMC .338 저격소총 + 50만₽.',
    quests: [
      'Jaeger에게 지하 시설 문의 → 48시간 대기',
      'Labrys 접근 키카드 2개 수령 (Jaeger 우편)',
      'Health Resort 서쪽 동 지하 → The Labyrinth 진입',
      '스폰 챔버 2 근처에서 "Leshy의 명령서" 회수',
      '프로토타입 무기 지역(Item 1156) 조사',
      '고문실에서 "Leshy의 일지" 회수',
      '연구원 시신 5구 조사 + 조수 메모 5개 수집',
      '관찰실 열쇠로 잠긴 관찰실 진입',
      '관찰실 바닥에서 "사망한 과학자의 음성 테이프" 회수',
      'Jaeger에게 음성 테이프 전달 → 50만₽ + AI AXMC .338 저격소총',
      'Shoreline 부두 근처 배수관에서 시설 연구 보고서 회수 → Theseus 업적',
    ],
    dealers: ['Jaeger', 'Therapist'],
  },
  {
    id: 'accidental_witness',
    name: 'Accidental Witness',
    description: 'Customs 기숙사 옆 차량의 협박 메시지에서 시작되는 수사 챕터. Kozlov의 빚과 Anastasia 실종 사건을 추적하며, Skier·Ragman의 도움으로 Streets·Customs·Shoreline을 돌아다니며 단서를 수집한다.',
    maps: ['Customs', 'Streets of Tarkov', 'Shoreline'],
    choices: [
      { id: 'hand_kerman', label: 'Kerman에게 증거 전달', description: '수집한 증거를 Kerman에게 넘겨 인류를 위한 탈출을 선택한다 — 최선의 결말.', nextChapterId: 'ending_savior' },
      { id: 'hand_prapor_final', label: 'Prapor에게 증거 전달', description: '증거를 Prapor에게 넘기고 생존만을 위한 탈출을 선택한다.', nextChapterId: 'ending_survivor' },
    ],
    column: 1,
    row: 5,
    wikiUrl: 'https://escapefromtarkov.fandom.com/wiki/Accidental_Witness',
    tip: 'Customs 기숙사 마당의 세단에서 시작. 기숙사 110호(열쇠 필요) → Skier·Ragman에게 Anastasia 문의 → Streets Zmeisky 3 아파트(문서 4개 수집) → Streets Chekannaya 13 편지·신문 → Customs 배달부 Pasha 매복지 → Reshala 벙커(열쇠 필요, 문서 3개) → Shoreline 서쪽 마을 3번 집에서 결정적 음성 증거 회수.',
    quests: [
      'Customs 기숙사 마당 세단의 협박 메시지 확인',
      '2층 기숙사 110호 열쇠로 진입 → Kozlov 편지 회수',
      'Skier·Ragman에게 Anastasia 문의',
      'Streets of Tarkov: Zmeisky 3 아파트에서 문서 4개 수집 (The Ninth Circle #19, #14 + Tarkov Herald + FSB 보고서)',
      'Streets of Tarkov: Chekannaya 13 건물 2층 편지 + A. Mikhailova 신문 기사',
      'Customs: 2층 기숙사 근처 매복지에서 미봉인 봉투 회수 → Skier 보고',
      'Customs: Reshala 벙커(열쇠 필요)에서 문서 3개 수집 (주소 메모, 경고 메모, 편지)',
      'Shoreline: 서쪽 마을 3번 집에서 결정적 음성 테이프 회수',
    ],
    dealers: ['Skier', 'Ragman'],
  },
  {
    id: 'the_unheard',
    name: 'The Unheard',
    description: 'TerraGroup의 "정화(Purification)" 작전과 비밀 그룹 "The Unheard"를 조사한다. The Lab·Factory·Streets·Shoreline에서 문서를 수집하고, A.P.의 정체를 밝히며, 최종적으로 Streets Cardinal 아파트의 숨겨진 방에서 진실을 발견한다.',
    maps: ['Streets of Tarkov', 'Ground Zero', 'The Lab', 'Factory', 'Shoreline'],
    choices: [
      { id: 'regret', label: '후회하며 발버둥', description: '늦었지만 무언가를 하려 한다. 진실에 거의 닿았지만 멈춘 결말.', nextChapterId: 'ending_debtor' },
      { id: 'surrender', label: '포기', description: '모든 것을 놓아버린다. 타르코프와 함께 무너지는 최악의 결말.', nextChapterId: 'ending_fallen' },
    ],
    column: 2,
    row: 5,
    wikiUrl: 'https://escapefromtarkov.fandom.com/wiki/The_Unheard',
    tip: '3곳 중 하나(Streets TerraGroup 보안 초소/사무실, Ground Zero 사무실 Lv.21+)에서 "정화에 대한 메모" 발견 필요. The Lab 문서 → Factory 촉매제 정보 → Streets 하드 드라이브 → 인텔리전스 센터에서 해독 → A.P. 음성 테이프(The Lab) → A.P. 방(Shoreline 동쪽 동 305호) → Mechanic에게 500만₽ + 플래시 드라이브 → 녹색 재프로그래밍 키카드 제작 → Streets Cardinal 아파트 숨겨진 방.',
    quests: [
      '3곳 중 하나에서 "정화에 대한 메모" 발견',
      'The Lab: TerraGroup 활동 문서 + 연료 운송 팩스(O23 사무실)',
      'Factory: 촉매제 선적 정보 + Blue Ice 촉매제 연구 문서 + 소각 문서',
      'Streets of Tarkov: Rzhevsky 하드 드라이브 회수 (LexOs 딜러십 근처)',
      '인텔리전스 센터에서 하드 드라이브 출력물 제작',
      'The Lab: A.P. 음성 테이프 2부 회수',
      'Shoreline: A.P.의 방 (Health Resort 동쪽 동 305호) 조사 → 플래시 드라이브 + TerraGroup 아파트 열쇠',
      '인텔리전스 센터에서 플래시 드라이브 해독',
      'Mechanic에게 500만₽ + 해독된 플래시 드라이브 전달',
      '3~24시간 대기 → Elektronik/Kerman 연락',
      '인텔리전스 센터에서 녹색 재프로그래밍 키카드 제작',
      'Streets Cardinal 아파트 1호 → 숨겨진 방 진입 → TerraGroup 명령서·촉매제 보고서·The Unheard 프로토콜 확인',
    ],
    dealers: ['Mechanic'],
  },
];

export const STORY_ENDINGS: StoryEnding[] = [
  {
    id: 'ending_savior',
    name: 'Savior',
    subtitle: '인류를 위한 탈출',
    description: 'TerraGroup의 진실을 세상에 알리고 탈출에 성공한다. Kerman에게 증거를 전달하여 기업의 비밀 실험과 정화 작전을 폭로하는 최선의 결말.',
    color: 'text-complete',
    column: 0,
    row: 6,
    reward: 'TerraGroup Labs 접근 키카드 (영구), 특수 탈출 장비, "Savior" 업적',
  },
  {
    id: 'ending_survivor',
    name: 'Survivor',
    subtitle: '생존자의 탈출',
    description: '살아남았지만, 타르코프를 파괴한 사슬의 일부가 되었다. Prapor에게 증거를 넘기고 무력으로 탈출하는 차선의 결말.',
    color: 'text-kappa',
    column: 1,
    row: 6,
    reward: '군용 탈출 장비, 고급 무기 세트, "Survivor" 업적',
  },
  {
    id: 'ending_debtor',
    name: 'Debtor',
    subtitle: '빚진 자',
    description: '진실에 거의 닿았지만, 두려움 앞에 멈춰 섰다. 후회하며 발버둥치지만 이미 늦은 결말.',
    color: 'text-orange-400',
    column: 2,
    row: 6,
    reward: '기본 탈출 장비, "Debtor" 업적',
  },
  {
    id: 'ending_fallen',
    name: 'Fallen',
    subtitle: '어둠 속으로',
    description: '타르코프는 무너졌고, 당신도 함께 무너졌다. 진실을 외면하고 포기한 최악의 결말.',
    color: 'text-incomplete',
    column: 3,
    row: 6,
    reward: '"Fallen" 업적',
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
  const branchChapters = ['accidental_witness', 'the_unheard', 'the_labyrinth', 'blue_fire', 'the_ticket'];

  for (const chId of branchChapters) {
    const p = progress[chId];
    if (!p?.choiceId) continue;

    const chapter = CHAPTER_MAP.get(chId);
    if (!chapter?.choices) continue;

    const choice = chapter.choices.find((c) => c.id === p.choiceId);
    if (!choice) continue;

    if (choice.nextChapterId.startsWith('ending_')) {
      return choice.nextChapterId;
    }
  }

  return null;
}
