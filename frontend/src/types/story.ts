export type ChapterStatus = 'locked' | 'available' | 'in_progress' | 'completed';

export interface StoryChoice {
  id: string;
  label: string;
  description: string;
  nextChapterId: string;
}

export interface StoryChapter {
  id: string;
  name: string;
  description: string;
  maps: string[];
  choices?: StoryChoice[];
  nextChapterId?: string;
  endingId?: string;
  column: number;
  row: number;
  wikiUrl?: string;
  tip?: string;
  quests?: string[];
  dealers?: string[];
}

export interface StoryEnding {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  color: string;
  column: number;
  row: number;
  reward?: string;
}

export interface StoryProgress {
  status: ChapterStatus;
  choiceId?: string;
}
