export interface ContainerTypeConfig {
  label: string;
  icon: string;
  bgColor: string;
  glowColor: string;
}

const CONTAINER_CONFIG: Record<string, ContainerTypeConfig> = {
  // 무기류 — 빨강
  'weapon-box': { label: 'Weapon box', icon: 'Crosshair', bgColor: 'bg-red-500', glowColor: 'rgba(239,68,68,0.5)' },
  // 도구 — 파랑
  'toolbox': { label: 'Toolbox', icon: 'Wrench', bgColor: 'bg-blue-500', glowColor: 'rgba(59,130,246,0.5)' },
  // 가방/상자 — 보라
  'duffle-bag': { label: 'Duffle bag', icon: 'Package', bgColor: 'bg-purple-500', glowColor: 'rgba(168,85,247,0.5)' },
  'wooden-crate': { label: 'Wooden crate', icon: 'Package', bgColor: 'bg-purple-500', glowColor: 'rgba(168,85,247,0.5)' },
  'plastic-suitcase': { label: 'Plastic suitcase', icon: 'Package', bgColor: 'bg-purple-400', glowColor: 'rgba(168,85,247,0.4)' },
  // 의류 — 초록
  'jacket': { label: 'Jacket', icon: 'Shirt', bgColor: 'bg-green-500', glowColor: 'rgba(34,197,94,0.5)' },
  // 가구 — 노랑
  'drawer': { label: 'Drawer', icon: 'Archive', bgColor: 'bg-yellow-500', glowColor: 'rgba(234,179,8,0.5)' },
  'safe': { label: 'Safe', icon: 'Archive', bgColor: 'bg-yellow-600', glowColor: 'rgba(202,138,4,0.5)' },
  'cash-register': { label: 'Cash register', icon: 'Archive', bgColor: 'bg-yellow-400', glowColor: 'rgba(250,204,21,0.5)' },
  // 전자 — 청록
  'pc-block': { label: 'PC block', icon: 'Monitor', bgColor: 'bg-cyan-500', glowColor: 'rgba(6,182,212,0.5)' },
  // 캐시 — 갈색
  'ground-cache': { label: 'Ground cache', icon: 'MapPin', bgColor: 'bg-amber-700', glowColor: 'rgba(180,83,9,0.5)' },
  'buried-barrel-cache': { label: 'Buried barrel cache', icon: 'MapPin', bgColor: 'bg-amber-800', glowColor: 'rgba(146,64,14,0.5)' },
  // 탄약 — 주황
  'grenade-box': { label: 'Grenade box', icon: 'Box', bgColor: 'bg-orange-500', glowColor: 'rgba(249,115,22,0.5)' },
  'wooden-ammo-box': { label: 'Wooden ammo box', icon: 'Box', bgColor: 'bg-orange-600', glowColor: 'rgba(234,88,12,0.5)' },
  // 의료 — 분홍
  'medcase': { label: 'Medcase', icon: 'Heart', bgColor: 'bg-pink-500', glowColor: 'rgba(236,72,153,0.5)' },
  'medbag-smu06': { label: 'Medbag SMU06', icon: 'Heart', bgColor: 'bg-pink-500', glowColor: 'rgba(236,72,153,0.5)' },
  'medical-supply-crate': { label: 'Medical supply crate', icon: 'Heart', bgColor: 'bg-pink-400', glowColor: 'rgba(244,114,182,0.5)' },
  'ration-supply-crate': { label: 'Ration supply crate', icon: 'Heart', bgColor: 'bg-pink-400', glowColor: 'rgba(244,114,182,0.5)' },
  // 특수 — 적갈색
  'dead-scav': { label: 'Dead Scav', icon: 'Skull', bgColor: 'bg-rose-800', glowColor: 'rgba(159,18,57,0.5)' },
};

const DEFAULT_CONFIG: ContainerTypeConfig = {
  label: 'Container',
  icon: 'Box',
  bgColor: 'bg-gray-500',
  glowColor: 'rgba(107,114,128,0.5)',
};

export function getContainerConfig(normalizedName: string): ContainerTypeConfig {
  return CONTAINER_CONFIG[normalizedName] ?? DEFAULT_CONFIG;
}

export { CONTAINER_CONFIG };
