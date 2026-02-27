import { Crown, Compass, Filter } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface TreeFilterBarProps {
  traders: string[];
  selectedTrader: string;
  onTraderChange: (trader: string) => void;
  kappaOnly: boolean;
  onKappaToggle: () => void;
  lightkeeperOnly: boolean;
  onLightkeeperToggle: () => void;
}

export default function TreeFilterBar({
  traders,
  selectedTrader,
  onTraderChange,
  kappaOnly,
  onKappaToggle,
  lightkeeperOnly,
  onLightkeeperToggle,
}: TreeFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 bg-surface rounded-xl p-3 border border-border">
      <Filter size={16} className="text-text-muted flex-shrink-0" />

      <select
        value={selectedTrader}
        onChange={(e) => onTraderChange(e.target.value)}
        className="bg-surface-alt text-text-secondary text-sm rounded-xl px-4 py-2 border-none outline-none appearance-none cursor-pointer"
      >
        <option value="">전체 트레이더</option>
        {traders.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      <button
        onClick={onKappaToggle}
        className={cn(
          'flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition-colors cursor-pointer',
          kappaOnly ? 'bg-gold/20 text-gold' : 'bg-surface-alt text-text-secondary hover:text-gold',
        )}
      >
        <Crown size={14} />카파
      </button>

      <button
        onClick={onLightkeeperToggle}
        className={cn(
          'flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition-colors cursor-pointer',
          lightkeeperOnly ? 'bg-accent/20 text-accent' : 'bg-surface-alt text-text-secondary hover:text-accent',
        )}
      >
        <Compass size={14} />등대지기
      </button>
    </div>
  );
}
