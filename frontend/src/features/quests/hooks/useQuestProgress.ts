import { useEffect, useMemo, useState } from 'react';
import { useProgressStore } from '../../../store/progressStore';
import { useAuthStore } from '../../../store/authStore';
import type { QuestObjectiveDto } from '../../../types/quest';
import type { QuestStatus } from '../../../types/progress';

const STATUS_CONFIG = {
  COMPLETED:   { bg: 'bg-complete/20',  text: 'text-complete',  label: '완료' },
  IN_PROGRESS: { bg: 'bg-progress/20',  text: 'text-progress',  label: '진행 중' },
  NOT_STARTED: { bg: 'bg-elevated',     text: 'text-text-muted',label: '미시작' },
} as const;

export { STATUS_CONFIG };

interface UseQuestProgressOptions {
  questId: number;
  objectives: QuestObjectiveDto[];
  questLoaded: boolean;
}

export function useQuestProgress({ questId, objectives, questLoaded }: UseQuestProgressOptions) {
  const { questStatuses, itemCounts, updateQuestStatus } = useProgressStore();
  const { token } = useAuthStore();

  const [statusUpdating, setStatusUpdating] = useState(false);
  /** 현재 COMPLETED가 자동완료로 설정됐는지 여부 (수동 완료 후 auto-revert 차단용) */
  const [autoCompleted, setAutoCompleted] = useState(false);

  const userStatus: QuestStatus = (questStatuses[String(questId)] ?? 'NOT_STARTED') as QuestStatus;
  const statusCfg = STATUS_CONFIG[userStatus] ?? STATUS_CONFIG['NOT_STARTED'];

  const handleStatusChange = async (newStatus: QuestStatus, isAuto = false) => {
    if (!token || statusUpdating) return;
    setStatusUpdating(true);
    try {
      await updateQuestStatus(questId, newStatus);
      setAutoCompleted(newStatus === 'COMPLETED' && isAuto);
    } finally {
      setStatusUpdating(false);
    }
  };

  const completedObjectives = useMemo(
    () =>
      objectives.filter((o) => {
        const collected = itemCounts[String(o.id)] ?? 0;
        if (o.requiredItems.length > 0) {
          const totalRequired = o.requiredItems.reduce((sum, ri) => sum + ri.count, 0);
          return collected >= totalRequired;
        }
        return collected >= 1;
      }),
    [objectives, itemCounts],
  );

  const allDone = objectives.length > 0 && completedObjectives.length === objectives.length;

  useEffect(() => {
    if (!token || !questLoaded || statusUpdating) return;
    if (allDone && userStatus !== 'COMPLETED') {
      handleStatusChange('COMPLETED', true);
    } else if (!allDone && userStatus === 'COMPLETED' && autoCompleted) {
      handleStatusChange('IN_PROGRESS');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDone]);

  return {
    userStatus,
    statusCfg,
    statusUpdating,
    completedObjectives,
    allDone,
    handleStatusChange,
  };
}
