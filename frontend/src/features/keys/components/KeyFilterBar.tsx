import { Search } from 'lucide-react';

interface KeyFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  mapFilter: string;
  onMapFilterChange: (value: string) => void;
  mapNames: string[];
}

export default function KeyFilterBar({
  search,
  onSearchChange,
  mapFilter,
  onMapFilterChange,
  mapNames,
}: KeyFilterBarProps) {
  return (
    <div className="bg-surface rounded-2xl p-4 border border-border">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-surface-alt rounded-xl px-4 py-2.5 flex-1 min-w-[200px]">
          <Search size={16} className="text-text-muted flex-shrink-0" />
          <input
            type="text"
            placeholder="키 검색..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-text placeholder:text-text-muted w-full"
          />
        </div>
        <select
          value={mapFilter}
          onChange={(e) => onMapFilterChange(e.target.value)}
          className="bg-surface-alt text-text-secondary text-sm rounded-xl px-4 py-2.5 border-none outline-none appearance-none cursor-pointer"
        >
          <option value="">전체 맵</option>
          {mapNames.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
