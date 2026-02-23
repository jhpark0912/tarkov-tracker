import { useDebug } from './DebugProvider';

export default function DebugToggle() {
  const { debugMode, toggleDebug } = useDebug();

  return (
    <button
      onClick={toggleDebug}
      className="fixed bottom-4 right-4 z-[9999] px-3 py-2 rounded-lg text-sm font-mono font-bold shadow-lg transition-all duration-200 cursor-pointer"
      style={{
        backgroundColor: debugMode ? 'var(--color-gold)' : 'var(--color-surface)',
        color: debugMode ? 'var(--color-bg)' : 'var(--color-text-secondary)',
        border: `2px solid ${debugMode ? 'var(--color-gold)' : 'var(--color-elevated)'}`,
      }}
    >
      {debugMode ? '[ DEBUG ON ]' : '[ DEBUG ]'}
    </button>
  );
}
