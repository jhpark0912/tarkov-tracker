import axiosInstance from './axiosInstance';
import type { QuestListItem, QuestDetail } from '../types/quest';

export const questApi = {
  getList: (params?: { trader?: string; kappa?: boolean; map?: string }) =>
    axiosInstance.get<QuestListItem[]>('/quests', { params }).then((r) => r.data),

  getDetail: (id: number) =>
    axiosInstance.get<QuestDetail>(`/quests/${id}`).then((r) => r.data),
};
