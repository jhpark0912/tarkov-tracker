import { useState } from 'react';
import { X, MapPin } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { CUSTOM_MARKER_CONFIG } from '../constants/customMarkerConfig';
import type { CustomMarkerType } from '../../../types/marker';

interface Props {
  screenPos: { x: number; y: number } | null;
  onSave: (data: {
    title: string;
    type: CustomMarkerType;
    description?: string;
    color?: string;
  }) => Promise<void>;
  onClose: () => void;
}

const MARKER_TYPES: CustomMarkerType[] = ['LOCATION', 'NOTE', 'WAYPOINT', 'LOOT_SPOT', 'DANGER'];

export default function MarkerCreateModal({ screenPos, onSave, onClose }: Props) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<CustomMarkerType>('NOTE');
  const [description, setDescription] = useState('');
  const [useCustomColor, setUseCustomColor] = useState(false);
  const [color, setColor] = useState(CUSTOM_MARKER_CONFIG['NOTE'].color);
  const [saving, setSaving] = useState(false);

  if (!screenPos) return null;

  const handleSave = async () => {
    const trimmed = title.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    try {
      await onSave({
        title: trimmed,
        type,
        description: description.trim() || undefined,
        color: useCustomColor ? color : undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTypeChange = (t: CustomMarkerType) => {
    setType(t);
    if (!useCustomColor) {
      setColor(CUSTOM_MARKER_CONFIG[t].color);
    }
  };

  return (
    <div
      className="absolute z-40 pointer-events-auto"
      style={{
        left: `${screenPos.x}px`,
        top: `${screenPos.y}px`,
        transform: 'translate(-50%, calc(-100% - 8px))',
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="bg-[#16213e] border border-[#0f3460] rounded-2xl p-4 w-64 shadow-2xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-purple-400" />
            <span className="text-sm font-semibold text-white">마커 추가</span>
          </div>
          <button
            onClick={onClose}
            className="w-5 h-5 flex items-center justify-center rounded text-gray-500 hover:text-white transition-colors"
          >
            <X size={12} />
          </button>
        </div>

        {/* 마커 타입 선택 */}
        <div className="mb-3">
          <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5 block">타입</label>
          <div className="flex flex-wrap gap-1">
            {MARKER_TYPES.map((t) => {
              const cfg = CUSTOM_MARKER_CONFIG[t];
              const isSelected = type === t;
              return (
                <button
                  key={t}
                  onClick={() => handleTypeChange(t)}
                  className={cn(
                    'flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg transition-colors border',
                    isSelected
                      ? 'border-transparent text-white'
                      : 'border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
                  )}
                  style={isSelected ? { backgroundColor: `${cfg.color}33`, borderColor: cfg.color, color: cfg.color } : {}}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: cfg.color }}
                  />
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 제목 입력 */}
        <div className="mb-3">
          <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">
            제목 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="마커 이름 입력"
            maxLength={100}
            autoFocus
            className="w-full bg-[#1a1a2e] border border-[#0f3460] rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* 메모 입력 */}
        <div className="mb-3">
          <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">메모</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="메모 입력 (선택)"
            maxLength={500}
            rows={2}
            className="w-full bg-[#1a1a2e] border border-[#0f3460] rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors resize-none"
          />
        </div>

        {/* 커스텀 색상 */}
        <div className="mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useCustomColor}
              onChange={(e) => setUseCustomColor(e.target.checked)}
              className="rounded"
            />
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">커스텀 색상</span>
            {useCustomColor && (
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
              />
            )}
            {!useCustomColor && (
              <span
                className="w-3 h-3 rounded-full ml-auto"
                style={{ backgroundColor: CUSTOM_MARKER_CONFIG[type].color }}
              />
            )}
          </label>
        </div>

        {/* 버튼 */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-1.5 text-xs text-gray-400 border border-gray-700 rounded-lg hover:text-white hover:border-gray-500 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || saving}
            className="flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              backgroundColor: title.trim() ? CUSTOM_MARKER_CONFIG[type].color : undefined,
              color: title.trim() ? 'white' : undefined,
            }}
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
}
