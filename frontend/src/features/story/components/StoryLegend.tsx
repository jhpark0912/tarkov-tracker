import { GitBranch, Clock, Trophy, Flag } from 'lucide-react';

export default function StoryLegend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-text-muted">
      <span className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded border border-border bg-surface" /> 퀘스트 스텝
      </span>
      <span className="flex items-center gap-1.5">
        <GitBranch size={12} className="text-kappa" /> 분기점
      </span>
      <span className="flex items-center gap-1.5">
        <span className="text-sm leading-none">💰</span> 비용
      </span>
      <span className="flex items-center gap-1.5">
        <Clock size={12} className="text-purple-400" /> 타임게이트
      </span>
      <span className="flex items-center gap-1.5">
        <Trophy size={12} className="text-gold" /> 업적
      </span>
      <span className="flex items-center gap-1.5">
        <Flag size={12} className="text-complete" /> 엔딩
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-6 border-t border-dashed border-kappa" /> 분기 엣지
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-6 border-t-2 border-complete" /> 활성 경로
      </span>
    </div>
  );
}
