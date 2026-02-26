import type { Node } from '@xyflow/react';
import type { StoryNodeData, StoryNodeType } from '../components/flow/types';

/** 노드 정의 헬퍼 */
function n(
  id: string,
  label: string,
  type: StoryNodeType,
  extra?: Partial<StoryNodeData>,
): Node<StoryNodeData> {
  return {
    id,
    type,
    position: { x: 0, y: 0 }, // dagre가 재배치
    data: { label, type, ...extra },
  };
}

// ═══════════════════════════════════════════════════════════════
// Chapter 1: Tour (10 steps)
// ═══════════════════════════════════════════════════════════════
const TOUR: Node<StoryNodeData>[] = [
  n('tour_01', 'Ground Zero 탈출 (튜토리얼)', 'step', { description: 'Klimov Street로 탈출하여 튜토리얼 완료' }),
  n('tour_02', 'Therapist — Streets 해금', 'cost', { cost: '250,000₽', description: 'Therapist에게 25만 루블 지불' }),
  n('tour_03', 'Ragman — Interchange 정찰', 'step', { description: 'Interchange에서 생존 탈출' }),
  n('tour_04', 'Skier — Customs 건축 자재', 'step', { description: '건축 자재 5개 납품 (FIR)' }),
  n('tour_05', 'Mechanic — Factory 무기', 'step', { description: '무기 2개 납품 (FIR)' }),
  n('tour_06', 'Skier — Woods 처치', 'step', { description: '적 3명 처치 후 탈출' }),
  n('tour_07', 'Shoreline 인터콤 접촉', 'step', { description: '감시탑 인터콤으로 항구 수비대 접촉' }),
  n('tour_08', 'Mechanic — Lighthouse 해금', 'cost', { cost: '$20,000', description: 'Mechanic에게 2만 달러 지불' }),
  n('tour_09', 'Prapor — Reserve 해금', 'cost', { cost: 'PMC 인식표 5개', description: 'Prapor에게 인식표 납품 + Shoreline 탈출' }),
  n('tour_10', 'The Lab — 배수 경로 발견', 'step', { description: 'O21 경영진 사무실 → 서버실 → 배수 시스템', achievement: 'Pathfinder' }),
];

// ═══════════════════════════════════════════════════════════════
// Chapter 2: Falling Skies (10 steps)
// ═══════════════════════════════════════════════════════════════
const FALLING_SKIES: Node<StoryNodeData>[] = [
  n('fs_01', 'Woods 추락 비행기 위치 확인', 'step', { description: 'Mechanic에게 추락 비행기 문의 후 활성화' }),
  n('fs_02', 'Prapor에게 사건 보고', 'step', { description: '5개 딜러에게 정보 문의' }),
  n('fs_03', 'Shoreline G-Wagon 드라이브 회수', 'step', { description: 'SUV에서 플래시 드라이브 회수' }),
  n('fs_04', 'Prapor에게 전달', 'timegate', { duration: '1시간 대기' }),
  n('fs_05', '비행 기록 장치 회수', 'step', { description: '추락기 우측에서 비행 기록 장치 수집' }),
  n('fs_06', 'Shoreline 섬 집에 기록 장치 은닉', 'step', { description: '파괴된 방에 기록 장치 숨김' }),
  n('fs_07', '분석 자재 납품', 'cost', { cost: '충전지 3 + PCB 5 + 도구 세트 2', description: 'Prapor에게 FIR 자재 납품' }),
  n('fs_08', '분석 완료 대기', 'timegate', { duration: '3~5시간 대기' }),
  n('fs_09', '승무원 녹취록 회수', 'step', { description: 'Shoreline 의장실에서 녹취록 + Elektronik 드라이브 수집' }),
  n('fs_10', '장갑 케이스 선택', 'decision', { description: '보관(평판-0.3) / Prapor 전달(150만₽) / 거짓말(100만₽)' }),
];

// ═══════════════════════════════════════════════════════════════
// Chapter 3: The Ticket (11 steps)
// ═══════════════════════════════════════════════════════════════
const THE_TICKET: Node<StoryNodeData>[] = [
  n('tt_01', '인텔리전스 센터 Lv.1', 'cost', { cost: '인텔리전스 센터 건설', description: '은신처 인텔리전스 센터 레벨 1 확보' }),
  n('tt_02', 'Lighthouse Prapor 캠프 조사', 'step', { description: 'Lighthouse에서 Prapor 전초 캠프 탐색' }),
  n('tt_03', 'Lightkeeper 평판 획득', 'step', { description: 'Lightkeeper와 접촉하여 평판 확보' }),
  n('tt_04', 'Blue Folders 수집', 'step', { description: 'TerraGroup "Blue Folders" 자료 3개 수집' }),
  n('tt_05', 'Interchange 15킬', 'step', { description: '단일 레이드에서 15명 처치' }),
  n('tt_06', 'Lab 마스터 패스 확보', 'step', { description: 'The Lab 마스터 접근 패스 획득' }),
  n('tt_07', 'RFID 암호화 장치', 'step', { description: 'RFID 카드 암호화 장치 확보' }),
  n('tt_08', '비트코인 40개 수집', 'cost', { cost: '물리적 비트코인 40개', description: 'BTC 40개 수집 (제작/거래)' }),
  n('tt_09', 'Terminal 진입', 'step', { description: '수집한 자원으로 Terminal 접근' }),
  n('tt_10', 'Kerman의 제안', 'decision', { description: 'Kerman을 신뢰할지, Prapor를 신뢰할지 선택' }),
  n('tt_10a', 'Kerman 루트 — 진실 추적', 'achievement', { achievement: '분기: Kerman 신뢰' }),
];

// ═══════════════════════════════════════════════════════════════
// Chapter 4: They Are Already Here (11 steps)
// ═══════════════════════════════════════════════════════════════
const THEY_ARE: Node<StoryNodeData>[] = [
  n('ta_01', '"세상의 눈" 메모 발견', 'step', { description: '4개 맵 중 하나에서 컬티스트 메모 발견' }),
  n('ta_02', 'Lighthouse 고문실 조사', 'step', { description: '고문실에서 음성 증거 회수' }),
  n('ta_03', 'Streets 피해자 아파트 조사', 'step', { description: '문서 + 녹음 수집' }),
  n('ta_04', 'Mechanic에게 심볼 문의', 'step', { description: '"세상의 눈" 심볼에 대해 문의' }),
  n('ta_05', '컬티스트 성직자 2명 처치', 'step', { description: '컬티스트 성직자 사살' }),
  n('ta_06', '4개 맵 순회 조사', 'step', { description: 'Lighthouse 샬레 / Woods 컬티스트 집 / Shoreline 라디오 타워 / Interchange 시설' }),
  n('ta_07', '손상된 키카드 복원', 'step', { description: 'Interchange 비밀 시설 침투를 위한 키카드 복구' }),
  n('ta_08', '비밀 시설 침투', 'step', { description: '발전소 지하 비밀 시설 진입' }),
  n('ta_09', '전원·냉각 복구', 'step', { description: '시설 전원 복구 + 서버실 냉각 시스템 활성화' }),
  n('ta_10', '플래시 드라이브 설치/회수', 'step', { description: '서버에 드라이브 설치 후 데이터 추출' }),
  n('ta_11', 'Mechanic에게 드라이브 전달', 'step', { description: '완성된 플래시 드라이브 전달' }),
];

// ═══════════════════════════════════════════════════════════════
// Chapter 5: Batya (12 steps)
// ═══════════════════════════════════════════════════════════════
const BATYA: Node<StoryNodeData>[] = [
  n('bt_01', 'Bogatyr 패치 발견', 'step', { description: '4개 맵 중 하나에서 BEAR 특수작전 분대 패치 발견' }),
  n('bt_02', 'Jaeger에게 패치 문의', 'step', { description: 'Jaeger에게 Bogatyr 정보 요청' }),
  n('bt_03', 'Woods Ryabina 전초기지', 'step', { description: 'Strelets 부적 + 철수 보고서 수집' }),
  n('bt_04', 'Interchange Carousel 전초기지', 'step', { description: 'Taran 엽서 + Voevoda 녹음기 + 개인 파일 수집' }),
  n('bt_05', 'Interchange Gnezdo 전초기지', 'step', { description: 'Moreman 개인 파일 + 작전 보고서 + 코드 메모' }),
  n('bt_06', 'Moreman 전화기 회수', 'step', { description: 'Woods ZB-016 근처 매복지에서 전화기 + 인식표 + 코드 메모' }),
  n('bt_07', '음성 테이프 제작', 'step', { description: '작업대 Lv.1에서 전화기 음성 테이프 제작' }),
  n('bt_08', '인텔리전스 센터 Lv.3', 'cost', { cost: '인텔리전스 센터 Lv.3', description: 'Voevoda 연락을 위한 장비 확보' }),
  n('bt_09', 'Lightkeeper 접촉', 'step', { description: '주파수 35.70, 코드 27.893.2000으로 Lightkeeper 접촉' }),
  n('bt_10', '전투 도전 과제', 'step', { description: '15킬 연속 / PMC 4킬 / 돌격소총 Lv.10 / 경기관총 Lv.5' }),
  n('bt_11', 'BEAR 캠프 조사', 'step', { description: '배신자(Prapor + "장군") 식별' }),
  n('bt_12', 'Lightkeeper 압박', 'timegate', { duration: '24시간 대기', description: '비밀 요원 문서 획득' }),
];

// ═══════════════════════════════════════════════════════════════
// Chapter 6: Blue Fire (9 steps)
// ═══════════════════════════════════════════════════════════════
const BLUE_FIRE: Node<StoryNodeData>[] = [
  n('bf_01', 'EMERCOM 전단지 발견', 'step', { description: 'EMERCOM 전단지 또는 Item #1156 메모 발견' }),
  n('bf_02', 'Mechanic에게 EMP 문의', 'step', { description: 'EMP 폭발에 대해 Mechanic과 대화' }),
  n('bf_03', '장치 파편 회수', 'step', { description: 'LexOs 딜러십 또는 Chekannaya 13에서 파편 수집' }),
  n('bf_04', 'Mechanic에게 파편 전달', 'step', { description: '파편 분석 의뢰' }),
  n('bf_05', 'The Lab 해킹 장치 설치', 'step', { description: '서버실 1층에 로컬 네트워크 해킹 장치 설치' }),
  n('bf_06', 'Item 1156 메모 수집', 'step', { description: 'Ground Zero, Lighthouse, The Lab에서 메모 찾기' }),
  n('bf_07', 'Rus Post 사무실 조사', 'step', { description: '음성 테이프 3개 수집' }),
  n('bf_08', 'Item 1156 설계도 확보', 'step', { description: 'Rus Post 차량에서 설계도 획득' }),
  n('bf_09', '증거 공개 여부 결정', 'decision', { description: 'Mechanic에게 전달(150만₽) — 증거 공개 / 보관(Just Business 업적) — 망설임' }),
];

// ═══════════════════════════════════════════════════════════════
// Chapter 7: The Labyrinth (11 steps)
// ═══════════════════════════════════════════════════════════════
const LABYRINTH: Node<StoryNodeData>[] = [
  n('lb_01', 'Jaeger에게 지하 시설 문의', 'timegate', { duration: '48시간 대기', description: 'Labrys 접근 키카드 요청' }),
  n('lb_02', 'Labrys 키카드 수령', 'step', { description: 'Jaeger 우편에서 키카드 2개 수령' }),
  n('lb_03', 'The Labyrinth 진입', 'step', { description: 'Health Resort 서쪽 동 지하 시설 진입' }),
  n('lb_04', 'Leshy의 명령서 회수', 'step', { description: '스폰 챔버 2 근처에서 문서 수집' }),
  n('lb_05', 'Item 1156 프로토타입 조사', 'step', { description: '프로토타입 무기 지역 탐색' }),
  n('lb_06', 'Leshy의 일지 회수', 'step', { description: '고문실에서 일지 수집' }),
  n('lb_07', '연구원 시신 5구 조사', 'step', { description: '시신 5구 조사 + 조수 메모 5개 수집' }),
  n('lb_08', '관찰실 진입', 'step', { description: '관찰실 열쇠로 잠긴 방 진입' }),
  n('lb_09', '과학자 음성 테이프 회수', 'step', { description: '관찰실 바닥에서 음성 테이프 발견' }),
  n('lb_10', 'Jaeger에게 테이프 전달', 'step', { description: '50만₽ + AI AXMC .338 저격소총 보상', achievement: 'Theseus' }),
  n('lb_11', 'Prapor 5억₽ 지불 여부', 'decision', { description: 'Prapor에게 5억₽ 지불(Terminal) / 거부(독자 탈출)' }),
];

// ═══════════════════════════════════════════════════════════════
// Chapter 8: Accidental Witness (8 steps)
// ═══════════════════════════════════════════════════════════════
const ACCIDENTAL_WITNESS: Node<StoryNodeData>[] = [
  n('aw_01', 'Customs 세단 협박 메시지', 'step', { description: '기숙사 마당 세단의 협박 메시지 확인' }),
  n('aw_02', '기숙사 110호 조사', 'step', { description: '열쇠로 진입 → Kozlov 편지 회수' }),
  n('aw_03', 'Skier·Ragman에게 문의', 'step', { description: 'Anastasia 실종 정보 수집' }),
  n('aw_04', 'Streets Zmeisky 3 아파트', 'step', { description: '문서 4개 수집 (The Ninth Circle #19, #14 등)' }),
  n('aw_05', 'Streets Chekannaya 13', 'step', { description: '편지 + A. Mikhailova 신문 기사 수집' }),
  n('aw_06', 'Customs 배달부 매복지', 'step', { description: '미봉인 봉투 회수 → Skier 보고' }),
  n('aw_07', 'Reshala 벙커 조사', 'step', { description: '열쇠 필요, 문서 3개 수집' }),
  n('aw_08', '증거 전달 대상 선택', 'decision', { description: 'Kerman에게 전달(Savior) / Prapor에게 전달(Survivor)' }),
];

// ═══════════════════════════════════════════════════════════════
// Chapter 9: The Unheard (12 steps)
// ═══════════════════════════════════════════════════════════════
const THE_UNHEARD: Node<StoryNodeData>[] = [
  n('tu_01', '"정화에 대한 메모" 발견', 'step', { description: 'Streets TerraGroup 보안 초소/사무실 또는 Ground Zero 사무실' }),
  n('tu_02', 'The Lab 문서 수집', 'step', { description: 'TerraGroup 활동 문서 + 연료 운송 팩스 (O23 사무실)' }),
  n('tu_03', 'Factory 촉매제 정보', 'step', { description: '촉매제 선적 정보 + Blue Ice 연구 문서 + 소각 문서' }),
  n('tu_04', 'Streets 하드 드라이브 회수', 'step', { description: 'Rzhevsky 하드 드라이브 (LexOs 딜러십 근처)' }),
  n('tu_05', '하드 드라이브 출력물 제작', 'step', { description: '인텔리전스 센터에서 해독' }),
  n('tu_06', 'The Lab A.P. 음성 테이프', 'step', { description: 'A.P. 음성 테이프 2부 회수' }),
  n('tu_07', 'Shoreline A.P.의 방 조사', 'step', { description: 'Health Resort 동쪽 동 305호 → 드라이브 + 열쇠' }),
  n('tu_08', '플래시 드라이브 해독', 'step', { description: '인텔리전스 센터에서 해독 작업' }),
  n('tu_09', 'Mechanic에게 전달', 'cost', { cost: '500만₽ + 해독 드라이브', description: 'Mechanic에게 비용 지불' }),
  n('tu_10', '연락 대기', 'timegate', { duration: '3~24시간 대기', description: 'Elektronik/Kerman 연락 대기' }),
  n('tu_11', '녹색 키카드 제작 + Cardinal 침투', 'step', { description: 'Streets Cardinal 아파트 숨겨진 방 → TerraGroup 진실 확인' }),
  n('tu_12', '최종 선택', 'decision', { description: '후회하며 발버둥(Debtor) / 포기(Fallen)' }),
];

// ═══════════════════════════════════════════════════════════════
// Endings (4)
// ═══════════════════════════════════════════════════════════════
const ENDINGS: Node<StoryNodeData>[] = [
  n('ending_savior', 'Savior — 인류를 위한 탈출', 'ending', {
    endingId: 'savior',
    endingColor: 'text-complete',
    description: 'TerraGroup의 진실을 세상에 알리고 탈출 성공',
  }),
  n('ending_survivor', 'Survivor — 생존자의 탈출', 'ending', {
    endingId: 'survivor',
    endingColor: 'text-kappa',
    description: '살아남았지만 사슬의 일부가 된 차선의 결말',
  }),
  n('ending_debtor', 'Debtor — 빚진 자', 'ending', {
    endingId: 'debtor',
    endingColor: 'text-orange-400',
    description: '진실에 닿았지만 두려움 앞에 멈춘 결말',
  }),
  n('ending_fallen', 'Fallen — 어둠 속으로', 'ending', {
    endingId: 'fallen',
    endingColor: 'text-incomplete',
    description: '타르코프와 함께 무너진 최악의 결말',
  }),
];

/** 전체 91개 스토리 노드 */
export const STORY_NODES: Node<StoryNodeData>[] = [
  ...TOUR,
  ...FALLING_SKIES,
  ...THE_TICKET,
  ...THEY_ARE,
  ...BATYA,
  ...BLUE_FIRE,
  ...LABYRINTH,
  ...ACCIDENTAL_WITNESS,
  ...THE_UNHEARD,
  ...ENDINGS,
];

/** 노드 ID → 챕터 이름 매핑 */
export const NODE_CHAPTER_MAP: Record<string, string> = {};
TOUR.forEach((n) => (NODE_CHAPTER_MAP[n.id] = 'Tour'));
FALLING_SKIES.forEach((n) => (NODE_CHAPTER_MAP[n.id] = 'Falling Skies'));
THE_TICKET.forEach((n) => (NODE_CHAPTER_MAP[n.id] = 'The Ticket'));
THEY_ARE.forEach((n) => (NODE_CHAPTER_MAP[n.id] = 'They Are Already Here'));
BATYA.forEach((n) => (NODE_CHAPTER_MAP[n.id] = 'Batya'));
BLUE_FIRE.forEach((n) => (NODE_CHAPTER_MAP[n.id] = 'Blue Fire'));
LABYRINTH.forEach((n) => (NODE_CHAPTER_MAP[n.id] = 'The Labyrinth'));
ACCIDENTAL_WITNESS.forEach((n) => (NODE_CHAPTER_MAP[n.id] = 'Accidental Witness'));
THE_UNHEARD.forEach((n) => (NODE_CHAPTER_MAP[n.id] = 'The Unheard'));
ENDINGS.forEach((n) => (NODE_CHAPTER_MAP[n.id] = 'Ending'));

/** 노드 ID 빠른 조회 맵 */
export const STORY_NODE_MAP = new Map(STORY_NODES.map((n) => [n.id, n]));
