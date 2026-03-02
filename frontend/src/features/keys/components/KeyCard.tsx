import { Link } from 'react-router-dom';
import { Key, DoorOpen, ScrollText, Check, MapPin, Coins } from 'lucide-react';
import { cn } from '../../../utils/cn';
import type { KeyListItem } from '../../../types/key';

interface KeyCardProps {
  keyItem: KeyListItem;
  owned: boolean;
  onToggleOwned?: () => void;
  isLoggedIn: boolean;
}

export default function KeyCard({ keyItem, owned, onToggleOwned, isLoggedIn }: KeyCardProps) {
  return (
    <div className="bg-surface rounded-xl border border-border p-4 hover:border-border/80 transition-colors">
      <div className="flex items-start gap-3">
        {/* 아이콘 */}
        <div className="w-12 h-12 rounded-lg bg-surface-alt flex items-center justify-center flex-shrink-0 overflow-hidden">
          {keyItem.iconUrl ? (
            <img src={keyItem.iconUrl} alt={keyItem.name} className="w-10 h-10 object-contain" />
          ) : (
            <Key size={20} className="text-text-muted" />
          )}
        </div>

        {/* 정보 */}
        <div className="flex-1 min-w-0">
          <Link
            to={`/keys/${encodeURIComponent(keyItem.apiId)}`}
            className="text-sm font-medium text-text hover:text-gold transition-colors no-underline truncate block"
          >
            {keyItem.name}
          </Link>
          {keyItem.shortName && (
            <span className="text-xs text-text-muted">{keyItem.shortName}</span>
          )}

          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-text-secondary">
            <span className="flex items-center gap-1">
              <DoorOpen size={12} />
              {keyItem.doorCount}개 문
            </span>
            {keyItem.questCount > 0 && (
              <span className="flex items-center gap-1">
                <ScrollText size={12} />
                {keyItem.questCount}개 퀘스트
              </span>
            )}
            <span className="flex items-center gap-1">
              <Coins size={12} />
              {keyItem.price != null ? `₽ ${keyItem.price.toLocaleString()}` : 'N/A'}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-2">
            {keyItem.mapNames.map((map) => (
              <span key={map} className="flex items-center gap-1 text-[10px] text-text-muted bg-surface-alt rounded px-1.5 py-0.5">
                <MapPin size={8} />
                {map}
              </span>
            ))}
          </div>
        </div>

        {/* 소유 체크 */}
        {isLoggedIn && (
          <button
            onClick={onToggleOwned}
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer',
              owned
                ? 'bg-complete/20 text-complete'
                : 'bg-surface-alt text-text-muted hover:text-text',
            )}
            title={owned ? '소유 중' : '미소유'}
          >
            <Check size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
