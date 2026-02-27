import { Link } from 'react-router-dom';
import { Package, Warehouse, Brain, UserCheck, Check, X, ExternalLink } from 'lucide-react';
import { cn } from '../../../utils/cn';
import type { HideoutLevelDetail } from '../../../types/hideout';
import ItemChecklist from './ItemChecklist';

interface LevelRequirementsProps {
  level: HideoutLevelDetail;
  itemCounts: Record<string, number>;
  stationLevels: Record<string, number>;
  onItemCountChange: (reqId: number, count: number) => void;
  isLoggedIn: boolean;
}

export default function LevelRequirements({
  level,
  itemCounts,
  stationLevels,
  onItemCountChange,
  isLoggedIn,
}: LevelRequirementsProps) {
  return (
    <div className="space-y-4">
      {/* 아이템 요구사항 */}
      {level.itemRequirements.length > 0 && (
        <div>
          <h4 className="flex items-center gap-2 text-xs font-semibold text-text-muted uppercase mb-2">
            <Package size={12} /> 필요 아이템
          </h4>
          <ItemChecklist
            items={level.itemRequirements}
            itemCounts={itemCounts}
            onCountChange={onItemCountChange}
            isLoggedIn={isLoggedIn}
          />
        </div>
      )}

      {/* 스테이션 요구사항 */}
      {level.stationRequirements.length > 0 && (
        <div>
          <h4 className="flex items-center gap-2 text-xs font-semibold text-text-muted uppercase mb-2">
            <Warehouse size={12} /> 필요 스테이션
          </h4>
          <div className="space-y-1.5">
            {level.stationRequirements.map((req) => {
              const currentLevel = stationLevels[req.stationApiId] ?? 0;
              const isMet = currentLevel >= req.requiredLevel;

              return (
                <Link
                  key={req.stationApiId}
                  to={`/hideout/${req.stationApiId}`}
                  className={cn(
                    'flex items-center gap-2 bg-surface-alt rounded-lg px-3 py-2 text-sm',
                    'hover:bg-elevated transition-colors group',
                    isMet && 'opacity-60',
                  )}
                >
                  {/* 충족 여부 아이콘 */}
                  {isLoggedIn && (
                    <div className={cn(
                      'w-5 h-5 rounded flex items-center justify-center flex-shrink-0',
                      isMet ? 'bg-complete/20 text-complete' : 'bg-danger/20 text-danger',
                    )}>
                      {isMet ? <Check size={12} /> : <X size={12} />}
                    </div>
                  )}

                  <Warehouse size={14} className="text-text-muted" />
                  <span className={cn('text-text', isMet && 'line-through')}>{req.stationName}</span>
                  <span className="text-xs text-text-muted">Lv.{req.requiredLevel}</span>

                  {/* 현재 레벨 표시 (로그인 시) */}
                  {isLoggedIn && (
                    <span className={cn(
                      'text-[10px] ml-auto mr-1',
                      isMet ? 'text-complete' : 'text-danger',
                    )}>
                      (현재 Lv.{currentLevel})
                    </span>
                  )}

                  <ExternalLink size={12} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* 스킬 요구사항 */}
      {level.skillRequirements.length > 0 && (
        <div>
          <h4 className="flex items-center gap-2 text-xs font-semibold text-text-muted uppercase mb-2">
            <Brain size={12} /> 필요 스킬
          </h4>
          <div className="space-y-1.5">
            {level.skillRequirements.map((req) => (
              <div key={req.skillName} className="flex items-center gap-2 bg-surface-alt rounded-lg px-3 py-2 text-sm">
                <Brain size={14} className="text-text-muted" />
                <span className="text-text">{req.skillName}</span>
                <span className="text-xs text-text-muted">Lv.{req.skillLevel}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 딜러 요구사항 */}
      {level.traderRequirements.length > 0 && (
        <div>
          <h4 className="flex items-center gap-2 text-xs font-semibold text-text-muted uppercase mb-2">
            <UserCheck size={12} /> 필요 딜러 레벨
          </h4>
          <div className="space-y-1.5">
            {level.traderRequirements.map((req) => (
              <div key={req.traderApiId} className="flex items-center gap-2 bg-surface-alt rounded-lg px-3 py-2 text-sm">
                <UserCheck size={14} className="text-text-muted" />
                <span className="text-text">{req.traderName}</span>
                <span className="text-xs text-text-muted">LL{req.loyaltyLevel}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 건설 시간 */}
      {level.constructionTime != null && level.constructionTime > 0 && (
        <p className="text-xs text-text-muted">
          건설 시간: {formatTime(level.constructionTime)}
        </p>
      )}

      {/* 설명 */}
      {level.description && (
        <p className="text-xs text-text-muted">{level.description}</p>
      )}
    </div>
  );
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}시간 ${minutes > 0 ? `${minutes}분` : ''}`;
  return `${minutes}분`;
}
