import { create } from 'zustand';
import { storyApi } from '../api/storyApi';
import type { StoryChapter, StoryEnding, StoryProgress, ChapterStatus } from '../types/story';

interface StoryStore {
  /** 정적 데이터 (서버에서 로딩) */
  chapters: StoryChapter[];
  endings: StoryEnding[];
  chapterMap: Map<string, StoryChapter>;
  endingMap: Map<string, StoryEnding>;

  /** 사용자 진행 상태 */
  progress: Record<string, StoryProgress>;

  /** UI 상태 */
  dataLoaded: boolean;
  progressLoaded: boolean;
  loading: boolean;

  /** 정적 데이터 로딩 */
  fetchChapters: () => Promise<void>;

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
  chapters: [],
  endings: [],
  chapterMap: new Map(),
  endingMap: new Map(),
  progress: {},
  dataLoaded: false,
  progressLoaded: false,
  loading: false,

  fetchChapters: async () => {
    if (get().dataLoaded) return;
    try {
      const data = await storyApi.getChapters();

      const chapters: StoryChapter[] = data.chapters.map((ch) => ({
        id: ch.id,
        name: ch.name,
        description: ch.description,
        maps: ch.maps,
        nextChapterId: ch.nextChapterId ?? undefined,
        choices: ch.choices.length > 0 ? ch.choices : undefined,
        column: ch.column,
        row: ch.row,
      }));

      const endings: StoryEnding[] = data.endings.map((e) => ({
        id: e.id,
        name: e.name,
        subtitle: e.subtitle,
        description: e.description,
        color: e.color,
        column: e.column,
        row: e.row,
      }));

      set({
        chapters,
        endings,
        chapterMap: new Map(chapters.map((c) => [c.id, c])),
        endingMap: new Map(endings.map((e) => [e.id, e])),
        dataLoaded: true,
      });
    } catch {
      // 서버 미연결 시 로컬 데이터 폴백
    }
  },

  fetchProgress: async () => {
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
      // 미로그인 시 빈 상태 유지
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
