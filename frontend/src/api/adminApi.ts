import axiosInstance from './axiosInstance';

export interface SyncResult {
  tradersProcessed: number;
  mapsProcessed: number;
  itemsProcessed: number;
  questsAdded: number;
  questsUpdated: number;
  questsRemoved: number;
  extractsProcessed: number;
  locksProcessed: number;
  spawnsProcessed: number;
  durationMs: number;
}

export const adminApi = {
  triggerSync: async (): Promise<SyncResult> => {
    const res = await axiosInstance.post<SyncResult>('/admin/sync', null, {
      timeout: 120000,
    });
    return res.data;
  },
};
