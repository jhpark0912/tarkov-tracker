import axiosInstance from './axiosInstance';
import type { ChapterStatus } from '../types/story';

export interface StoryDataDto {
  chapters: StoryChapterDto[];
  endings: StoryEndingDto[];
}

export interface StoryChapterDto {
  id: string;
  name: string;
  description: string;
  maps: string[];
  nextChapterId: string | null;
  choices: StoryChoiceDto[];
  column: number;
  row: number;
}

export interface StoryChoiceDto {
  id: string;
  label: string;
  description: string;
  nextChapterId: string;
}

export interface StoryEndingDto {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  color: string;
  column: number;
  row: number;
}

export interface StoryProgressDto {
  chapters: Record<string, { status: ChapterStatus; choiceId: string | null }>;
}

export interface ChapterProgressDto {
  status: ChapterStatus;
  choiceId: string | null;
}

export const storyApi = {
  getChapters: () =>
    axiosInstance.get<StoryDataDto>('/story/chapters').then((r) => r.data),

  getProgress: () =>
    axiosInstance.get<StoryProgressDto>('/story/progress').then((r) => r.data),

  updateChapterProgress: (chapterId: string, status: ChapterStatus, choiceId?: string) =>
    axiosInstance
      .put<ChapterProgressDto>(`/story/progress/${chapterId}`, { status, choiceId })
      .then((r) => r.data),

  resetProgress: () =>
    axiosInstance.put('/story/progress/reset'),
};
