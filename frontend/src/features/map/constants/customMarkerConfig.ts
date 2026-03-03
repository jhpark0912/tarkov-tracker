import type { CustomMarkerType } from '../../../types/marker';

interface CustomMarkerTypeConfig {
  label: string;
  color: string;
  bgClass: string;
  glowColor: string;
}

export const CUSTOM_MARKER_CONFIG: Record<CustomMarkerType, CustomMarkerTypeConfig> = {
  LOCATION: {
    label: '위치',
    color: '#3b82f6',
    bgClass: 'bg-blue-500',
    glowColor: 'rgba(59,130,246,0.6)',
  },
  NOTE: {
    label: '메모',
    color: '#a855f7',
    bgClass: 'bg-purple-500',
    glowColor: 'rgba(168,85,247,0.6)',
  },
  WAYPOINT: {
    label: '경유지',
    color: '#22c55e',
    bgClass: 'bg-green-500',
    glowColor: 'rgba(34,197,94,0.6)',
  },
  LOOT_SPOT: {
    label: '루팅 포인트',
    color: '#eab308',
    bgClass: 'bg-yellow-500',
    glowColor: 'rgba(234,179,8,0.6)',
  },
  DANGER: {
    label: '위험',
    color: '#ef4444',
    bgClass: 'bg-red-500',
    glowColor: 'rgba(239,68,68,0.6)',
  },
};
