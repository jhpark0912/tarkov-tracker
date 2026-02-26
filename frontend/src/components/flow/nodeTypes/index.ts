import StoryStepNode from './StoryStepNode';
import StoryDecisionNode from './StoryDecisionNode';
import StoryCostNode from './StoryCostNode';
import StoryTimegateNode from './StoryTimegateNode';
import StoryAchievementNode from './StoryAchievementNode';
import StoryEndingNode from './StoryEndingNode';
import QuestNode from './QuestNode';

/** 스토리 플로우용 노드 타입 맵 */
export const storyNodeTypes = {
  step: StoryStepNode,
  decision: StoryDecisionNode,
  cost: StoryCostNode,
  timegate: StoryTimegateNode,
  achievement: StoryAchievementNode,
  ending: StoryEndingNode,
} as const;

/** 퀘스트 트리용 노드 타입 맵 */
export const questNodeTypes = {
  quest: QuestNode,
} as const;
