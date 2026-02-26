import { useEffect, useState, useCallback, useRef } from 'react';

export interface PlayerPosition {
  x: number;
  y: number;
  z: number;
  timestamp: string;
  filename: string;
}

// Tauri 환경 감지
const isTauri = () => '__TAURI_INTERNALS__' in window;

/**
 * 타르코프 스크린샷 폴더를 감시하여 플레이어 위치를 추적하는 훅.
 * Tauri 환경에서만 동작하며, 일반 브라우저에서는 no-op.
 */
export function useTauriScreenshot() {
  const [position, setPosition] = useState<PlayerPosition | null>(null);
  const [history, setHistory] = useState<PlayerPosition[]>([]);
  const [watching, setWatching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const startWatching = useCallback(async (path: string) => {
    if (!isTauri()) {
      setError('Tauri 환경이 아닙니다. 데스크톱 앱에서 실행해주세요.');
      return;
    }

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const { listen } = await import('@tauri-apps/api/event');

      // 감시 시작
      await invoke('start_watching', { path });
      setWatching(true);
      setError(null);

      // 기존 히스토리 로드
      const existingHistory = await invoke<PlayerPosition[]>('get_position_history', { limit: 50 });
      setHistory(existingHistory);
      if (existingHistory.length > 0) {
        setPosition(existingHistory[existingHistory.length - 1]);
      }

      // 실시간 이벤트 리스너
      const unlisten = await listen<PlayerPosition>('screenshot-position', (event) => {
        const newPos = event.payload;
        setPosition(newPos);
        setHistory((prev) => [...prev.slice(-49), newPos]);
      });

      cleanupRef.current = () => {
        unlisten();
      };
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setWatching(false);
    }
  }, []);

  const stopWatching = useCallback(async () => {
    if (!isTauri()) return;
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('stop_watching');
      cleanupRef.current?.();
      cleanupRef.current = null;
      setWatching(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      cleanupRef.current?.();
    };
  }, []);

  return {
    position,
    history,
    watching,
    error,
    startWatching,
    stopWatching,
    isTauriAvailable: isTauri(),
  };
}
