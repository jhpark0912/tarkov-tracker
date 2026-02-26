import type { Edge } from '@xyflow/react';

/** 엣지 헬퍼 — 기본 smoothstep */
function e(source: string, target: string, label?: string, isBranch = false): Edge {
  return {
    id: `${source}->${target}`,
    source,
    target,
    type: 'branch',
    data: { label, isBranch, isActive: false },
  };
}

// ═══════════════════════════════════════════════════════════════
// Tour 내부 연결 (순차)
// ═══════════════════════════════════════════════════════════════
const TOUR_EDGES: Edge[] = [
  e('tour_01', 'tour_02'),
  e('tour_02', 'tour_03'),
  e('tour_03', 'tour_04'),
  e('tour_04', 'tour_05'),
  e('tour_05', 'tour_06'),
  e('tour_06', 'tour_07'),
  e('tour_07', 'tour_08'),
  e('tour_08', 'tour_09'),
  e('tour_09', 'tour_10'),
];

// ═══════════════════════════════════════════════════════════════
// Falling Skies 내부 연결
// ═══════════════════════════════════════════════════════════════
const FS_EDGES: Edge[] = [
  e('fs_01', 'fs_02'),
  e('fs_02', 'fs_03'),
  e('fs_03', 'fs_04'),
  e('fs_04', 'fs_05'),
  e('fs_05', 'fs_06'),
  e('fs_06', 'fs_07'),
  e('fs_07', 'fs_08'),
  e('fs_08', 'fs_09'),
  e('fs_09', 'fs_10'),
];

// ═══════════════════════════════════════════════════════════════
// The Ticket 내부 연결
// ═══════════════════════════════════════════════════════════════
const TT_EDGES: Edge[] = [
  e('tt_01', 'tt_02'),
  e('tt_02', 'tt_03'),
  e('tt_03', 'tt_04'),
  e('tt_04', 'tt_05'),
  e('tt_05', 'tt_06'),
  e('tt_06', 'tt_07'),
  e('tt_07', 'tt_08'),
  e('tt_08', 'tt_09'),
  e('tt_09', 'tt_10'),
  e('tt_10', 'ta_01', 'Kerman 신뢰', true),   // → They Are Already Here
  e('tt_10', 'bt_01', 'Prapor 신뢰', true),   // → Batya
];

// ═══════════════════════════════════════════════════════════════
// They Are Already Here 내부 연결
// ═══════════════════════════════════════════════════════════════
const TA_EDGES: Edge[] = [
  e('ta_01', 'ta_02'),
  e('ta_02', 'ta_03'),
  e('ta_03', 'ta_04'),
  e('ta_04', 'ta_05'),
  e('ta_05', 'ta_06'),
  e('ta_06', 'ta_07'),
  e('ta_07', 'ta_08'),
  e('ta_08', 'ta_09'),
  e('ta_09', 'ta_10'),
  e('ta_10', 'ta_11'),
];

// ═══════════════════════════════════════════════════════════════
// Batya 내부 연결
// ═══════════════════════════════════════════════════════════════
const BT_EDGES: Edge[] = [
  e('bt_01', 'bt_02'),
  e('bt_02', 'bt_03'),
  e('bt_03', 'bt_04'),
  e('bt_04', 'bt_05'),
  e('bt_05', 'bt_06'),
  e('bt_06', 'bt_07'),
  e('bt_07', 'bt_08'),
  e('bt_08', 'bt_09'),
  e('bt_09', 'bt_10'),
  e('bt_10', 'bt_11'),
  e('bt_11', 'bt_12'),
];

// ═══════════════════════════════════════════════════════════════
// Blue Fire 내부 연결
// ═══════════════════════════════════════════════════════════════
const BF_EDGES: Edge[] = [
  e('bf_01', 'bf_02'),
  e('bf_02', 'bf_03'),
  e('bf_03', 'bf_04'),
  e('bf_04', 'bf_05'),
  e('bf_05', 'bf_06'),
  e('bf_06', 'bf_07'),
  e('bf_07', 'bf_08'),
  e('bf_08', 'bf_09'),
  e('bf_09', 'aw_01', '증거 공개', true),       // → Accidental Witness
  e('bf_09', 'tu_01', '망설임', true),           // → The Unheard
];

// ═══════════════════════════════════════════════════════════════
// The Labyrinth 내부 연결
// ═══════════════════════════════════════════════════════════════
const LB_EDGES: Edge[] = [
  e('lb_01', 'lb_02'),
  e('lb_02', 'lb_03'),
  e('lb_03', 'lb_04'),
  e('lb_04', 'lb_05'),
  e('lb_05', 'lb_06'),
  e('lb_06', 'lb_07'),
  e('lb_07', 'lb_08'),
  e('lb_08', 'lb_09'),
  e('lb_09', 'lb_10'),
  e('lb_10', 'lb_11'),
  e('lb_11', 'aw_01', 'Prapor 지불', true),     // → Accidental Witness
  e('lb_11', 'tu_01', '거부', true),             // → The Unheard
];

// ═══════════════════════════════════════════════════════════════
// Accidental Witness 내부 연결
// ═══════════════════════════════════════════════════════════════
const AW_EDGES: Edge[] = [
  e('aw_01', 'aw_02'),
  e('aw_02', 'aw_03'),
  e('aw_03', 'aw_04'),
  e('aw_04', 'aw_05'),
  e('aw_05', 'aw_06'),
  e('aw_06', 'aw_07'),
  e('aw_07', 'aw_08'),
  e('aw_08', 'ending_savior', 'Kerman에게 전달', true),
  e('aw_08', 'ending_survivor', 'Prapor에게 전달', true),
];

// ═══════════════════════════════════════════════════════════════
// The Unheard 내부 연결
// ═══════════════════════════════════════════════════════════════
const TU_EDGES: Edge[] = [
  e('tu_01', 'tu_02'),
  e('tu_02', 'tu_03'),
  e('tu_03', 'tu_04'),
  e('tu_04', 'tu_05'),
  e('tu_05', 'tu_06'),
  e('tu_06', 'tu_07'),
  e('tu_07', 'tu_08'),
  e('tu_08', 'tu_09'),
  e('tu_09', 'tu_10'),
  e('tu_10', 'tu_11'),
  e('tu_11', 'tu_12'),
  e('tu_12', 'ending_debtor', '후회', true),
  e('tu_12', 'ending_fallen', '포기', true),
];

// ═══════════════════════════════════════════════════════════════
// 챕터 간 연결 (순차 + 분기)
// ═══════════════════════════════════════════════════════════════
const CHAPTER_BRIDGES: Edge[] = [
  e('tour_10', 'fs_01'),        // Tour → Falling Skies
  e('fs_10', 'tt_01'),          // Falling Skies → The Ticket
  e('ta_11', 'bf_01'),          // They Are Already Here → Blue Fire
  e('bt_12', 'lb_01'),          // Batya → The Labyrinth
];

/** 전체 96개 엣지 */
export const STORY_EDGES: Edge[] = [
  ...TOUR_EDGES,
  ...FS_EDGES,
  ...TT_EDGES,
  ...TA_EDGES,
  ...BT_EDGES,
  ...BF_EDGES,
  ...LB_EDGES,
  ...AW_EDGES,
  ...TU_EDGES,
  ...CHAPTER_BRIDGES,
];
