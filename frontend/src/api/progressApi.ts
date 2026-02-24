import axiosInstance from './axiosInstance';
import type {
  UserProgressResponse,
  ProgressSummaryResponse,
  QuestProgressResponse,
  ItemProgressResponse,
  QuestStatus,
} from '../types/progress';

export const progressApi = {
  getUserProgress: () =>
    axiosInstance.get<UserProgressResponse>('/progress').then((r) => r.data),

  getSummary: () =>
    axiosInstance.get<ProgressSummaryResponse>('/progress/summary').then((r) => r.data),

  updateQuestStatus: (questId: number, status: QuestStatus) =>
    axiosInstance
      .put<QuestProgressResponse>(`/progress/quest/${questId}`, { status })
      .then((r) => r.data),

  updateItemCount: (objectiveId: number, collectedCount: number) =>
    axiosInstance
      .put<ItemProgressResponse>(`/progress/item/${objectiveId}`, { collectedCount })
      .then((r) => r.data),

  resetProgress: () => axiosInstance.put('/progress/reset'),
};
