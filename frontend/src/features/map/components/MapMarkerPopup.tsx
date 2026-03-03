import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Crown, Lock, LogOut, Box, Pencil, Trash2 } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { getContainerConfig } from '../constants/containerConfig';
import { CUSTOM_MARKER_CONFIG } from '../constants/customMarkerConfig';
import type { QuestMapMarker, MapExtractMarker, MapLockMarker, MapLootContainerMarker } from '../../../types/map';
import type { UserMapMarker } from '../../../types/marker';

type PopupData =
  | { type: 'quest'; data: QuestMapMarker; isCompleted: boolean }
  | { type: 'extract'; data: MapExtractMarker }
  | { type: 'lock'; data: MapLockMarker; isOwned?: boolean }
  | { type: 'lootContainer'; data: MapLootContainerMarker }
  | { type: 'custom'; data: UserMapMarker; onEdit?: (marker: UserMapMarker) => void; onDelete?: (markerId: number) => void };

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
        {popup.type === 'lock' && <LockPopup data={popup.data} isOwned={popup.isOwned} />}
        {popup.type === 'lootContainer' && <LootContainerPopup data={popup.data} />}
        {popup.type === 'custom' && (
          <CustomMarkerPopup data={popup.data} onEdit={popup.onEdit} onDelete={popup.onDelete} />
        )}
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

function LockPopup({ data, isOwned }: { data: MapLockMarker; isOwned?: boolean }) {
  return (
    <>
      <div className="flex items-center gap-2 mb-2">
        <Lock size={14} className={isOwned ? 'text-complete shrink-0' : 'text-red-400 shrink-0'} />
        <span className="text-sm font-semibold text-text leading-tight">잠긴 문</span>
        {isOwned !== undefined && (
          <span className={cn(
            'text-[9px] font-medium px-1.5 py-0.5 rounded ml-auto',
            isOwned ? 'bg-complete/20 text-complete' : 'bg-red-500/20 text-red-400',
          )}>
            {isOwned ? '보유' : '미보유'}
          </span>
        )}
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

function CustomMarkerPopup({
  data,
  onEdit,
  onDelete,
}: {
  data: UserMapMarker;
  onEdit?: (marker: UserMapMarker) => void;
  onDelete?: (markerId: number) => void;
}) {
  const config = CUSTOM_MARKER_CONFIG[data.type];
  const markerColor = data.color ?? config.color;
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2 mb-2">
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: markerColor }} />
        <span className="text-sm font-semibold text-text leading-tight flex-1">{data.title}</span>
        <span
          className="text-[9px] px-1.5 py-0.5 rounded font-medium"
          style={{ backgroundColor: `${markerColor}22`, color: markerColor }}
        >
          {config.label}
        </span>
      </div>
      {data.description && (
        <p className="text-xs text-text-secondary mb-2 leading-relaxed">{data.description}</p>
      )}
      <p className="text-[9px] text-text-muted mb-3">
        {new Date(data.createdAt).toLocaleDateString('ko-KR')}
      </p>
      {!confirmDelete ? (
        <div className="flex gap-1.5 pt-2 border-t border-border">
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(data); }}
              className="flex-1 flex items-center justify-center gap-1 py-1 text-[10px] text-text-secondary hover:text-text rounded-lg hover:bg-surface-alt transition-colors"
            >
              <Pencil size={10} />
              수정
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
              className="flex-1 flex items-center justify-center gap-1 py-1 text-[10px] text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/10 transition-colors"
            >
              <Trash2 size={10} />
              삭제
            </button>
          )}
        </div>
      ) : (
        <div className="pt-2 border-t border-border">
          <p className="text-[10px] text-text-secondary mb-2">정말 삭제할까요?</p>
          <div className="flex gap-1.5">
            <button
              onClick={(e) => { e.stopPropagation(); setConfirmDelete(false); }}
              className="flex-1 py-1 text-[10px] text-text-muted border border-border rounded-lg hover:text-text transition-colors"
            >
              취소
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete?.(data.id); }}
              className="flex-1 py-1 text-[10px] font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
            >
              삭제
            </button>
          </div>
        </div>
      )}
    </>
  );
}
