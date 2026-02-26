import { Link } from 'react-router-dom';
import { Flag, ChevronRight } from 'lucide-react';
import { cn } from '../../../utils/cn';
import type { StoryEndingMeta } from '../../../data/storyPaths';

interface EndingCardProps {
  ending: StoryEndingMeta;
  predicted?: boolean;
}

export default function EndingCard({ ending, predicted }: EndingCardProps) {
  return (
    <Link
      to={`/story/${ending.id}`}
      className={cn(
        'block rounded-xl border p-5 transition-all no-underline hover:scale-[1.02] hover:shadow-lg',
        predicted
          ? 'border-kappa/50 bg-kappa/10 ring-1 ring-kappa/30'
          : 'border-border bg-surface hover:bg-elevated/50',
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', predicted ? 'bg-kappa/20' : 'bg-elevated')}>
          <Flag size={20} className={cn(ending.color)} />
        </div>
        <div className="flex-1">
          <h3 className={cn('text-base font-bold', ending.color)}>{ending.name}</h3>
          <p className="text-xs text-text-muted">{ending.subtitle}</p>
        </div>
        <ChevronRight size={16} className="text-text-muted" />
      </div>

      <p className="text-xs text-text-secondary leading-relaxed mb-3 line-clamp-2">{ending.description}</p>

      <div className="flex items-center gap-4 text-[10px] text-text-muted">
        <span>{ending.stepCount} 스텝</span>
        <span>{ending.estimatedCost}</span>
      </div>

      {ending.reward && (
        <div className="mt-2 text-[10px] text-kappa/80 bg-kappa/5 rounded px-2 py-1">
          {ending.reward}
        </div>
      )}
    </Link>
  );
}
