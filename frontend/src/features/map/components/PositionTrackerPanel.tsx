import { useState, useEffect } from 'react';
import { Navigation, Power, PowerOff, MapPin } from 'lucide-react';
import { cn } from '../../../utils/cn';
import type { PlayerPosition } from '../../../hooks/useTauriScreenshot';

const DEFAULT_SCREENSHOT_PATH = 'C:\\Users\\smile\\OneDrive\\문서\\Escape from Tarkov\\Screenshots';

interface PositionTrackerPanelProps {
  position: PlayerPosition | null;
  watching: boolean;
  error: string | null;
  isTauriAvailable: boolean;
  onStartWatching: (path: string) => void;
  onStopWatching: () => void;
}

export default function PositionTrackerPanel({
  position,
  watching,
  error,
  isTauriAvailable,
  onStartWatching,
  onStopWatching,
}: PositionTrackerPanelProps) {
  const [screenshotPath, setScreenshotPath] = useState(DEFAULT_SCREENSHOT_PATH);
  const [expanded, setExpanded] = useState(false);

  // 자동 시작: Tauri 환경이면 마운트 시 감시 시작
  useEffect(() => {
    if (isTauriAvailable && !watching) {
      onStartWatching(screenshotPath);
    }
  }, [isTauriAvailable]);

  if (!isTauriAvailable) {
    return null; // 브라우저 환경에서는 숨김
  }

  return (
    <div className="absolute top-2 right-2 z-30">
      {/* 접힌 상태: 아이콘만 */}
      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium shadow-lg transition-all',
            watching
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30'
              : 'bg-surface/90 text-gray-400 border border-gray-600/30 hover:bg-surface',
          )}
        >
          <Navigation className={cn('w-3.5 h-3.5', watching && 'animate-pulse')} />
          {watching ? (
            position ? (
              <span>
                {position.x.toFixed(0)}, {position.z.toFixed(0)}
              </span>
            ) : (
              '대기 중...'
            )
          ) : (
            '위치 추적'
          )}
        </button>
      ) : (
        /* 펼친 상태: 설정 패널 */
        <div className="bg-surface/95 border border-cyan-500/20 rounded-lg shadow-xl p-3 w-72">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-cyan-300 text-sm font-medium">
              <MapPin className="w-4 h-4" />
              위치 추적
            </div>
            <button
              onClick={() => setExpanded(false)}
              className="text-gray-500 hover:text-gray-300 text-xs"
            >
              접기
            </button>
          </div>

          {/* 경로 설정 */}
          <div className="mb-2">
            <label className="text-xs text-gray-500 mb-1 block">스크린샷 폴더</label>
            <div className="flex gap-1">
              <input
                type="text"
                value={screenshotPath}
                onChange={(e) => setScreenshotPath(e.target.value)}
                className="flex-1 bg-bg/80 border border-gray-700 rounded px-2 py-1 text-xs text-gray-300 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* 시작/중지 버튼 */}
          <div className="flex gap-2 mb-2">
            {watching ? (
              <button
                onClick={onStopWatching}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-xs hover:bg-red-500/30 transition-colors"
              >
                <PowerOff className="w-3.5 h-3.5" />
                중지
              </button>
            ) : (
              <button
                onClick={() => onStartWatching(screenshotPath)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded text-xs hover:bg-cyan-500/30 transition-colors"
              >
                <Power className="w-3.5 h-3.5" />
                시작
              </button>
            )}
          </div>

          {/* 상태 표시 */}
          {error && (
            <div className="text-xs text-red-400 bg-red-500/10 rounded p-1.5 mb-2">{error}</div>
          )}

          {position && (
            <div className="text-xs text-gray-400 bg-bg/50 rounded p-2 space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">좌표</span>
                <span className="text-cyan-300 font-mono">
                  {position.x.toFixed(1)}, {position.y.toFixed(1)}, {position.z.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">시간</span>
                <span>{position.timestamp.replace('T', ' ')}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
