import { create } from 'zustand';
import { storyApi } from '../api/storyApi';
import type { StoryProgress, ChapterStatus } from '../types/story';

interface StoryStore {
  /** 사용자 진행 상태 */
  progress: Record<string, StoryProgress>;

  /** UI 상태 */
  progressLoaded: boolean;
  loading: boolean;

  /** 사용자 진행 상태 로딩 */
  fetchProgress: () => Promise<void>;

  /** 챕터 상태 변경 */
  updateChapterStatus: (chapterId: string, status: ChapterStatus, choiceId?: string) => Promise<void>;

  /** 진행 초기화 */
  resetProgress: () => Promise<void>;

  /** 스토어 초기화 (로그아웃 시) */
  clearProgress: () => void;
}

export const useStoryStore = create<StoryStore>((set, get) => ({
  progress: {},
  progressLoaded: false,
  loading: false,

  fetchProgress: async () => {
    if (get().progressLoaded) return;
    try {
      const data = await storyApi.getProgress();
      const progress: Record<string, StoryProgress> = {};
      for (const [chapterId, p] of Object.entries(data.chapters)) {
        progress[chapterId] = {
          status: p.status,
          choiceId: p.choiceId ?? undefined,
        };
      }
      set({ progress, progressLoaded: true });
    } catch {
      set({ progressLoaded: true });
    }
  },

  updateChapterStatus: async (chapterId, status, choiceId) => {
    set({ loading: true });
    try {
      const result = await storyApi.updateChapterProgress(chapterId, status, choiceId);
      set((s) => ({
        progress: {
          ...s.progress,
          [chapterId]: {
            status: result.status,
            choiceId: result.choiceId ?? undefined,
          },
        },
        loading: false,
      }));
    } catch {
      set({ loading: false });
    }
  },

  resetProgress: async () => {
    set({ loading: true });
    try {
      await storyApi.resetProgress();
      set({ progress: {}, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  clearProgress: () => set({ progress: {}, progressLoaded: false }),
}));
