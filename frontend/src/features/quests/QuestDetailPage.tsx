import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Crown, ExternalLink, MapPin, Check, Circle, Package } from 'lucide-react';
import * as Progress from '@radix-ui/react-progress';
import * as Checkbox from '@radix-ui/react-checkbox';
import { cn } from '../../utils/cn';
import DebugOverlay from '../../components/debug/DebugOverlay';

const sampleQuest = {
  id: '1',
  name: 'Debut',
  trader: 'Prapor',
  map: 'Customs',
  level: 1,
  kappa: true,
  status: 'IN_PROGRESS',
  experience: 1500,
  wikiLink: 'https://escapefromtarkov.fandom.com/wiki/Debut',
  objectives: [
    { id: 'obj1', description: 'Eliminate 5 Scavs on Customs', type: 'kill', completed: true, progress: 5, total: 5 },
    { id: 'obj2', description: 'Hand over 2 MP-133 shotguns to Prapor', type: 'giveItem', completed: false, progress: 1, total: 2 },
  ],
  requiredItems: [
    { id: 'item1', name: 'MP-133 shotgun', count: 2, foundInRaid: false, collected: 1 },
  ],
  prerequisites: [
    { id: '0', name: 'Introduction', status: 'COMPLETED' },
  ],
};

export default function QuestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const quest = sampleQuest;
  const objectivesDone = quest.objectives.filter(o => o.completed).length;

  return (
    <DebugOverlay id="quest-detail-page" tag="div" label="QuestDetailPage" variant="feature">
      <div id="quest-detail-page" className="max-w-4xl mx-auto space-y-6">

        {/* Back link */}
        <Link to="/quests" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text no-underline transition-colors">
          <ArrowLeft size={16} />
          퀘스트 목록으로
        </Link>

        {/* Quest header card */}
        <DebugOverlay id="quest-info" tag="div" label="QuestInfo" variant="component">
          <div id="quest-info" className="bg-surface rounded-2xl p-6 border border-border">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center text-gold text-lg font-semibold">
                  {quest.trader.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-semibold text-text">{quest.name}</h1>
                    {quest.kappa && <Crown size={16} className="text-gold" />}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-text-secondary mt-1">
                    <span>{quest.trader}</span>
                    <span className="w-1 h-1 rounded-full bg-elevated" />
                    <span>{quest.map}</span>
                    <span className="w-1 h-1 rounded-full bg-elevated" />
                    <span>레벨 {quest.level}+</span>
                    <span className="w-1 h-1 rounded-full bg-elevated" />
                    <span>+{quest.experience} EXP</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs bg-progress/20 text-progress px-2.5 py-1 rounded-lg">
                  <Circle size={8} fill="currentColor" />
                  진행 중
                </span>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-muted uppercase">목표 진행률</span>
                <span className="text-xs text-text-secondary">{objectivesDone}/{quest.objectives.length}</span>
              </div>
              <Progress.Root className="h-2 w-full bg-elevated rounded-full overflow-hidden">
                <Progress.Indicator
                  className="h-full bg-complete rounded-full transition-all duration-500"
                  style={{ width: `${(objectivesDone / quest.objectives.length) * 100}%` }}
                />
              </Progress.Root>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <a
                href={quest.wikiLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs bg-surface-alt hover:bg-elevated text-text-secondary px-4 py-2 rounded-xl no-underline transition-colors"
              >
                <ExternalLink size={14} />
                위키
              </a>
              <Link
                to="/map/customs"
                className="flex items-center gap-2 text-xs bg-surface-alt hover:bg-elevated text-text-secondary px-4 py-2 rounded-xl no-underline transition-colors"
              >
                <MapPin size={14} />
                맵에서 보기
              </Link>
            </div>
          </div>
        </DebugOverlay>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Objectives */}
          <DebugOverlay id="quest-objectives" tag="div" label="QuestObjectives" variant="component">
            <div id="quest-objectives" className="bg-surface rounded-2xl p-6 border border-border">
              <h2 className="text-base font-semibold text-text mb-4">목표</h2>
              <div className="space-y-3">
                {quest.objectives.map((obj) => (
                  <div
                    key={obj.id}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-xl',
                      obj.completed ? 'bg-complete/5' : 'bg-surface-alt'
                    )}
                  >
                    <Checkbox.Root
                      checked={obj.completed}
                      className={cn(
                        'w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors',
                        obj.completed ? 'bg-complete' : 'bg-elevated'
                      )}
                    >
                      <Checkbox.Indicator>
                        <Check size={12} className="text-bg" />
                      </Checkbox.Indicator>
                    </Checkbox.Root>
                    <div className="flex-1">
                      <p className={cn('text-sm', obj.completed ? 'text-text-muted line-through' : 'text-text')}>
                        {obj.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Progress.Root className="h-1 flex-1 bg-elevated rounded-full overflow-hidden">
                          <Progress.Indicator
                            className="h-full bg-complete rounded-full"
                            style={{ width: `${(obj.progress / obj.total) * 100}%` }}
                          />
                        </Progress.Root>
                        <span className="text-[10px] text-text-muted font-mono">{obj.progress}/{obj.total}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DebugOverlay>

          <div className="space-y-6">
            {/* Required Items */}
            <DebugOverlay id="quest-items" tag="div" label="QuestItems" variant="component">
              <div id="quest-items" className="bg-surface rounded-2xl p-6 border border-border">
                <h2 className="text-base font-semibold text-text mb-4">필요 아이템</h2>
                <div className="space-y-3">
                  {quest.requiredItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-surface-alt rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-elevated flex items-center justify-center">
                          <Package size={16} className="text-text-muted" />
                        </div>
                        <div>
                          <p className="text-sm text-text">{item.name}</p>
                          {item.foundInRaid && (
                            <span className="text-[10px] text-complete">레이드 중 수령</span>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-mono text-text-secondary">
                        {item.collected}/{item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </DebugOverlay>

            {/* Prerequisites */}
            <DebugOverlay id="quest-prerequisites" tag="div" label="QuestPrerequisites" variant="component">
              <div id="quest-prerequisites" className="bg-surface rounded-2xl p-6 border border-border">
                <h2 className="text-base font-semibold text-text mb-4">선행 퀘스트</h2>
                <div className="space-y-3">
                  {quest.prerequisites.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 p-3 bg-complete/5 rounded-xl">
                      <div className="w-5 h-5 rounded-md bg-complete flex items-center justify-center">
                        <Check size={12} className="text-bg" />
                      </div>
                      <span className="text-sm text-text-muted">{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </DebugOverlay>
          </div>
        </div>

        <p className="text-[10px] text-text-muted">Quest ID: {id} (placeholder data)</p>
      </div>
    </DebugOverlay>
  );
}
