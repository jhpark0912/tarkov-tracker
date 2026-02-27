import axiosInstance from './axiosInstance';
import type { KeyListItem, KeyDetail, KeyProgressItem } from '../types/key';

export const keyApi = {
  getKeyList: (params?: { map?: string; search?: string }) =>
    axiosInstance.get<KeyListItem[]>('/keys', { params }).then((r) => r.data),

  getKeyDetail: (apiId: string) =>
    axiosInstance.get<KeyDetail>(`/keys/${encodeURIComponent(apiId)}`).then((r) => r.data),

  getKeyProgress: () =>
    axiosInstance.get<KeyProgressItem[]>('/keys/progress').then((r) => r.data),

  updateKeyProgress: (apiId: string, owned: boolean) =>
    axiosInstance.put<KeyProgressItem>(`/keys/progress/${encodeURIComponent(apiId)}`, { owned }).then((r) => r.data),
};
