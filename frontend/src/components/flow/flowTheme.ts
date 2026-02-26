/** 다크 테마 상수 — React Flow 노드/엣지 공통 */
export const FLOW_COLORS = {
  bg: '#1a1a2e',
  surface: '#16213e',
  surfaceAlt: '#1a2744',
  elevated: '#0f3460',
  border: '#2a3a5c',
  text: '#e2e8f0',
  textMuted: '#94a3b8',
  textSecondary: '#cbd5e1',
  gold: '#e6b800',
  complete: '#4ecca3',
  incomplete: '#e74c3c',
  accent: '#0f3460',
  progress: '#3b82f6',
} as const;

export const FLOW_NODE_DEFAULTS = {
  width: 220,
  height: 72,
} as const;

export const FLOW_LAYOUT_DEFAULTS = {
  rankSep: 80,
  nodeSep: 40,
  direction: 'TB' as const,
} as const;
