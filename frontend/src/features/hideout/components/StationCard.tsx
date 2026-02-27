import { Link } from 'react-router-dom';
import { Warehouse, ChevronRight } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface StationCardProps {
  apiId: string;
  name: string;
  imageLink: string | null;
  maxLevel: number;
  currentLevel: number;
}

export default function StationCard({ apiId, name, imageLink, maxLevel, currentLevel }: StationCardProps) {
  const progressPercent = maxLevel > 0 ? Math.round((currentLevel / maxLevel) * 100) : 0;
  const isComplete = currentLevel >= maxLevel && maxLevel > 0;

  return (
    <Link
      to={`/hideout/${encodeURIComponent(apiId)}`}
      className="bg-surface rounded-xl border border-border p-4 hover:border-border/80 transition-colors no-underline group"
    >
      <div className="flex items-start gap-3">
        <div className="w-14 h-14 rounded-lg bg-surface-alt flex items-center justify-center flex-shrink-0 overflow-hidden">
          {imageLink ? (
            <img src={imageLink} alt={name} className="w-12 h-12 object-contain" />
          ) : (
            <Warehouse size={24} className="text-text-muted" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text truncate">{name}</span>
            <ChevronRight size={16} className="text-text-muted group-hover:text-text transition-colors flex-shrink-0" />
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={cn(
              'text-xs',
              isComplete ? 'text-complete' : 'text-text-secondary',
            )}>
              Lv.{currentLevel} / {maxLevel}
            </span>
          </div>
          {/* 진행 바 */}
          <div className="mt-2 h-1.5 bg-elevated rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                isComplete ? 'bg-complete' : 'bg-gold',
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
