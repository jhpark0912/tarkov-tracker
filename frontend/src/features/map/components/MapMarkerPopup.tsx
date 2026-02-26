import { Link } from 'react-router-dom';
import { Crown, Lock, LogOut, Box } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { getContainerConfig } from '../constants/containerConfig';
import type { QuestMapMarker, MapExtractMarker, MapLockMarker, MapLootContainerMarker } from '../../../types/map';

type PopupData =
  | { type: 'quest'; data: QuestMapMarker; isCompleted: boolean }
  | { type: 'extract'; data: MapExtractMarker }
  | { type: 'lock'; data: MapLockMarker }
  | { type: 'lootContainer'; data: MapLootContainerMarker };

interface Props {
  popup: PopupData;
  screenPos: { x: number; y: number };
  containerWidth: number;
}

export type { PopupData };

export default function MapMarkerPopup({ popup, screenPos, containerWidth }: Props) {
  const POPUP_W = 224;
  const x = Math.min(Math.max(screenPos.x, POPUP_W / 2 + 8), containerWidth - POPUP_W / 2 - 8);

  return (
    <div
      className="absolute z-30 pointer-events-none"
      style={{
        left: `${x}px`,
        top: `${screenPos.y}px`,
        transform: 'translate(-50%, calc(-100% - 12px))',
      }}
    >
      <div className="pointer-events-auto bg-bg/95 backdrop-blur-md border border-border rounded-2xl p-4 w-56 shadow-xl">
        {popup.type === 'quest' && <QuestPopup data={popup.data} isCompleted={popup.isCompleted} />}
        {popup.type === 'extract' && <ExtractPopup data={popup.data} />}
        {popup.type === 'lock' && <LockPopup data={popup.data} />}
        {popup.type === 'lootContainer' && <LootContainerPopup data={popup.data} />}
      </div>
    </div>
  );
}

function QuestPopup({ data, isCompleted }: { data: QuestMapMarker; isCompleted: boolean }) {
  return (
    <>
      <div className="flex items-start justify-between gap-2 mb-2">
        <Link
          to={`/quests/${data.questId}`}
          className="text-sm font-semibold text-gold hover:underline leading-tight"
          onClick={(e) => e.stopPropagation()}
        >
          {data.questName}
        </Link>
        {data.kappaRequired && <Crown size={12} className="text-gold shrink-0 mt-0.5" />}
      </div>
      <p className="text-xs text-text-secondary mb-2">{data.objectiveDescription}</p>
      {data.traderName && <p className="text-[10px] text-text-muted uppercase">{data.traderName}</p>}
      {data.requiredItems.length > 0 && (
        <div className="mt-2 pt-2 border-t border-border space-y-1">
          {data.requiredItems.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-[10px]">
              <span className="text-text-secondary">{item.itemName}</span>
              <span className="text-text-muted">
                x{item.count}{item.foundInRaid ? ' (FIR)' : ''}
              </span>
            </div>
          ))}
        </div>
      )}
      <div className="mt-3 pt-2 border-t border-border">
        <span className={cn('text-[10px] font-medium uppercase', isCompleted ? 'text-complete' : 'text-text-muted')}>
          {isCompleted ? '완료' : '미완료'}
        </span>
      </div>
    </>
  );
}

function ExtractPopup({ data }: { data: MapExtractMarker }) {
  const factionLabel = data.faction === 'pmc' ? 'PMC' : data.faction === 'scav' ? 'Scav' : '공용';
  const factionColor = data.faction === 'pmc' ? 'text-blue-400' : data.faction === 'scav' ? 'text-orange-400' : 'text-purple-400';
  return (
    <>
      <div className="flex items-center gap-2 mb-2">
        <LogOut size={14} className="text-blue-400 shrink-0" />
        <span className="text-sm font-semibold text-text leading-tight">{data.name}</span>
      </div>
      <span className={cn('text-xs font-medium', factionColor)}>{factionLabel} 탈출구</span>
    </>
  );
}

function LockPopup({ data }: { data: MapLockMarker }) {
  return (
    <>
      <div className="flex items-center gap-2 mb-2">
        <Lock size={14} className="text-red-400 shrink-0" />
        <span className="text-sm font-semibold text-text leading-tight">잠긴 문</span>
      </div>
      {data.keyName && (
        <div className="flex items-center gap-2 mt-1">
          {data.keyIconUrl && (
            <img src={data.keyIconUrl} alt={data.keyShortName ?? ''} className="w-8 h-8 object-contain rounded" />
          )}
          <div>
            <p className="text-xs text-text-secondary">{data.keyName}</p>
            {data.keyShortName && <p className="text-[10px] text-text-muted">{data.keyShortName}</p>}
          </div>
        </div>
      )}
      {data.lockType && <p className="text-[10px] text-text-muted mt-1 uppercase">{data.lockType}</p>}
      {data.needsPower && (
        <span className="inline-block mt-1 text-[9px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded">전원 필요</span>
      )}
    </>
  );
}

function LootContainerPopup({ data }: { data: MapLootContainerMarker }) {
  const config = getContainerConfig(data.normalizedName);
  return (
    <>
      <div className="flex items-center gap-2 mb-1">
        <Box size={14} className="text-amber-400 shrink-0" />
        <span className="text-sm font-semibold text-text leading-tight">{data.containerName}</span>
      </div>
      <span className="text-[10px] text-text-muted">{config.label}</span>
    </>
  );
}
