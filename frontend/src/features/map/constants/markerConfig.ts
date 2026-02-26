import type { MarkerCategory } from '../../../types/map';

interface MarkerCategoryConfig {
  label: string;
  color: string;
  activeColor: string;
  glowColor: string;
}

export const MARKER_CONFIG: Record<MarkerCategory, MarkerCategoryConfig> = {
  quests: {
    label: '퀘스트',
    color: 'bg-gold',
    activeColor: 'bg-gold/20 text-gold',
    glowColor: 'rgba(230,184,0,0.5)',
  },
  extracts: {
    label: '탈출구',
    color: 'bg-blue-500',
    activeColor: 'bg-blue-500/20 text-blue-400',
    glowColor: 'rgba(59,130,246,0.5)',
  },
  locks: {
    label: '잠금',
    color: 'bg-red-500',
    activeColor: 'bg-red-500/20 text-red-400',
    glowColor: 'rgba(239,68,68,0.5)',
  },
  lootContainers: {
    label: '루팅',
    color: 'bg-amber-500',
    activeColor: 'bg-amber-500/20 text-amber-400',
    glowColor: 'rgba(245,158,11,0.5)',
  },
};

export function getExtractColor(faction: string | null): { bg: string; glow: string } {
  switch (faction) {
    case 'pmc':
      return { bg: 'bg-blue-500', glow: 'rgba(59,130,246,0.5)' };
    case 'scav':
      return { bg: 'bg-orange-500', glow: 'rgba(249,115,22,0.5)' };
    default:
      return { bg: 'bg-purple-500', glow: 'rgba(168,85,247,0.5)' };
  }
}
