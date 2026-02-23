import { type ReactNode } from 'react';
import { useDebug } from './DebugProvider';

type OverlayVariant = 'layout' | 'feature' | 'component';

interface DebugOverlayProps {
  id?: string;
  tag?: string;
  label: string;
  variant?: OverlayVariant;
  children: ReactNode;
}

const variantColors: Record<OverlayVariant, { border: string; bg: string; text: string }> = {
  layout: { border: '#3b82f6', bg: 'rgba(59,130,246,0.15)', text: '#93c5fd' },
  feature: { border: '#22c55e', bg: 'rgba(34,197,94,0.15)', text: '#86efac' },
  component: { border: '#eab308', bg: 'rgba(234,179,8,0.15)', text: '#fde047' },
};

export default function DebugOverlay({
  id,
  tag = 'div',
  label,
  variant = 'component',
  children,
}: DebugOverlayProps) {
  const { debugMode } = useDebug();

  if (!debugMode) {
    return <>{children}</>;
  }

  const colors = variantColors[variant];
  const displayLabel = `${tag}${id ? `#${id}` : ''} .${label}`;

  return (
    <div
      className="relative"
      style={{
        border: `1px dashed ${colors.border}`,
        borderRadius: '4px',
      }}
    >
      <span
        className="absolute top-0 left-0 z-[9998] px-1.5 py-0.5 text-[10px] font-mono leading-tight rounded-br"
        style={{
          backgroundColor: colors.bg,
          color: colors.text,
          borderRight: `1px dashed ${colors.border}`,
          borderBottom: `1px dashed ${colors.border}`,
        }}
      >
        {displayLabel}
      </span>
      {children}
    </div>
  );
}
