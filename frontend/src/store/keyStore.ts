import { create } from 'zustand';
import { keyApi } from '../api/keyApi';
import type { KeyListItem, KeyDetail } from '../types/key';

interface KeyStore {
  keys: KeyListItem[];
  currentDetail: KeyDetail | null;
  ownedKeys: Set<string>;
  loading: boolean;
  error: string | null;
  fetchKeys: (params?: { map?: string; search?: string }) => Promise<void>;
  fetchDetail: (apiId: string) => Promise<void>;
  fetchProgress: () => Promise<void>;
  toggleOwned: (apiId: string) => Promise<void>;
  clearDetail: () => void;
}

export const useKeyStore = create<KeyStore>((set, get) => ({
  keys: [],
  currentDetail: null,
  ownedKeys: new Set(),
  loading: false,
  error: null,

  fetchKeys: async (params) => {
    set({ loading: true, error: null });
    try {
      const keys = await keyApi.getKeyList(params);
      set({ keys, loading: false });
    } catch {
      set({ error: '키 목록을 불러오는데 실패했습니다.', loading: false });
    }
  },

  fetchDetail: async (apiId) => {
    set({ loading: true, error: null });
    try {
      const detail = await keyApi.getKeyDetail(apiId);
      set({ currentDetail: detail, loading: false });
    } catch {
      set({ error: '키 상세를 불러오는데 실패했습니다.', loading: false });
    }
  },

  fetchProgress: async () => {
    try {
      const progress = await keyApi.getKeyProgress();
      const owned = new Set(progress.filter((p) => p.owned).map((p) => p.itemApiId));
      set({ ownedKeys: owned });
    } catch {
      // 비로그인 상태에서는 무시
    }
  },

  toggleOwned: async (apiId) => {
    const { ownedKeys } = get();
    const newOwned = !ownedKeys.has(apiId);
    try {
      await keyApi.updateKeyProgress(apiId, newOwned);
      const updated = new Set(ownedKeys);
      if (newOwned) {
        updated.add(apiId);
      } else {
        updated.delete(apiId);
      }
      set({ ownedKeys: updated });
    } catch {
      // 실패 시 무시
    }
  },

  clearDetail: () => set({ currentDetail: null }),
}));
