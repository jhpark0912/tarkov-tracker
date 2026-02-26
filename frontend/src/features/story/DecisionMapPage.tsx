import { Link } from 'react-router-dom';
import { BookOpen, Map } from 'lucide-react';
import { STORY_ENDINGS } from '../../data/storyPaths';
import EndingCard from './components/EndingCard';
import StoryLegend from './components/StoryLegend';

export default function DecisionMapPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-kappa" />
          <div>
            <h1 className="text-xl font-bold text-text">메인 스토리</h1>
            <p className="text-sm text-text-muted">4개 엔딩 경로 중 하나를 선택하세요</p>
          </div>
        </div>
        <Link
          to="/story/full"
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-text-secondary hover:text-text hover:bg-elevated transition-all no-underline"
        >
          <Map size={16} />
          전체 플로우차트 보기
        </Link>
      </div>

      {/* 엔딩 카드 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {STORY_ENDINGS.map((ending) => (
          <EndingCard key={ending.id} ending={ending} />
        ))}
      </div>

      {/* 범례 */}
      <StoryLegend />
    </div>
  );
}
