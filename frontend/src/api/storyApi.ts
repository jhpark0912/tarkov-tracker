import axiosInstance from './axiosInstance';
import type { ChapterStatus } from '../types/story';

export interface StoryProgressDto {
  chapters: Record<string, { status: ChapterStatus; choiceId: string | null }>;
}

export interface ChapterProgressDto {
  status: ChapterStatus;
  choiceId: string | null;
}

export const storyApi = {
  getProgress: () =>
    axiosInstance.get<StoryProgressDto>('/story/progress').then((r) => r.data),

  updateChapterProgress: (chapterId: string, status: ChapterStatus, choiceId?: string) =>
    axiosInstance
      .put<ChapterProgressDto>(`/story/progress/${chapterId}`, { status, choiceId })
      .then((r) => r.data),

  resetProgress: () =>
    axiosInstance.put('/story/progress/reset'),
};
