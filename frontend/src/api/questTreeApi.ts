import axiosInstance from './axiosInstance';
import type { QuestTreeResponse } from '../types/questTree';

export const questTreeApi = {
  /** 특정 퀘스트 선행 트리 */
  getQuestTree: (id: number) =>
    axiosInstance.get<QuestTreeResponse>(`/quests/${id}/tree`).then((r) => r.data),

  /** 카파 퀘스트 전체 의존 그래프 */
  getKappaTree: () =>
    axiosInstance.get<QuestTreeResponse>('/quests/tree/kappa').then((r) => r.data),

  /** 등대지기 퀘스트 전체 의존 그래프 */
  getLightkeeperTree: () =>
    axiosInstance.get<QuestTreeResponse>('/quests/tree/lightkeeper').then((r) => r.data),

  /** 전체 퀘스트 의존 그래프 (필터 가능) */
  getFullTree: (params?: { trader?: string; kappa?: boolean; lightkeeper?: boolean }) =>
    axiosInstance.get<QuestTreeResponse>('/quests/tree/full', { params }).then((r) => r.data),
};
