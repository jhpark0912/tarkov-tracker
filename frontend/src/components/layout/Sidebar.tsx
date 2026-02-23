import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ScrollText,
  Map,
  LogIn,
  X,
  MapPin,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import DebugOverlay from '../debug/DebugOverlay';
import * as Tooltip from '@radix-ui/react-tooltip';

const navItems = [
  { icon: LayoutDashboard, label: '대시보드', path: '/' },
  { icon: ScrollText, label: '퀘스트', path: '/quests' },
];

const allMaps = [
  { name: 'Customs', path: '/map/customs' },
  { name: 'Interchange', path: '/map/interchange' },
  { name: 'Reserve', path: '/map/reserve' },
  { name: 'Woods', path: '/map/woods' },
  { name: 'Shoreline', path: '/map/shoreline' },
  { name: 'Factory', path: '/map/factory' },
  { name: 'The Lab', path: '/map/the-lab' },
  { name: 'Lighthouse', path: '/map/lighthouse' },
  { name: 'Streets of Tarkov', path: '/map/streets-of-tarkov' },
  { name: 'Ground Zero', path: '/map/ground-zero' },
];

function NavButton({
  icon: Icon,
  label,
  path,
  isActive,
}: {
  icon: React.ElementType;
  label: string;
  path: string;
  isActive: boolean;
}) {
  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <Link
            to={path}
            className={cn(
              'w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-200 flex-shrink-0',
              isActive
                ? 'bg-gold text-bg'
                : 'text-text-secondary hover:text-text hover:bg-surface-alt'
            )}
          >
            <Icon size={20} strokeWidth={1.5} />
          </Link>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="right"
            sideOffset={12}
            className="px-3 py-1.5 text-xs font-medium text-text bg-surface-alt rounded-lg shadow-lg z-[9999]"
          >
            {label}
            <Tooltip.Arrow className="fill-surface-alt" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

function MapToggleButton({
  isActive,
  isOpen,
  onClick,
}: {
  isActive: boolean;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            onClick={onClick}
            className={cn(
              'w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-200 flex-shrink-0 cursor-pointer',
              isOpen
                ? 'bg-gold text-bg'
                : isActive
                  ? 'bg-gold text-bg'
                  : 'text-text-secondary hover:text-text hover:bg-surface-alt'
            )}
          >
            <Map size={20} strokeWidth={1.5} />
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="right"
            sideOffset={12}
            className="px-3 py-1.5 text-xs font-medium text-text bg-surface-alt rounded-lg shadow-lg z-[9999]"
          >
            맵
            <Tooltip.Arrow className="fill-surface-alt" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

export default function Sidebar() {
  const location = useLocation();
  const [mapsOpen, setMapsOpen] = useState(false);
  const flyoutRef = useRef<HTMLDivElement>(null);

  const isMapActive = location.pathname.startsWith('/map');

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (flyoutRef.current && !flyoutRef.current.contains(e.target as Node)) {
        setMapsOpen(false);
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setMapsOpen(false);
    }

    if (mapsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [mapsOpen]);

  return (
    <DebugOverlay id="app-sidebar" tag="nav" label="Sidebar" variant="layout">
      <nav
        id="app-sidebar"
        className="fixed left-0 top-0 h-screen w-16 bg-surface flex flex-col items-center py-6 z-40 scrollbar-hide overflow-y-auto border-r border-border"
      >
        {/* Logo */}
        <Link to="/" className="text-gold font-bold text-lg mb-6 flex-shrink-0 no-underline">
          TQ
        </Link>

        {/* Main nav */}
        <div className="flex flex-col items-center gap-2 mb-2">
          {navItems.map((item) => (
            <NavButton
              key={item.path}
              icon={item.icon}
              label={item.label}
              path={item.path}
              isActive={
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path)
              }
            />
          ))}
        </div>

        {/* Maps toggle */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <MapToggleButton
            isActive={isMapActive}
            isOpen={mapsOpen}
            onClick={() => setMapsOpen(!mapsOpen)}
          />
        </div>

        {/* Divider */}
        <div className="w-8 h-px bg-elevated mb-6 flex-shrink-0" />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Login */}
        <div className="flex-shrink-0 mt-4">
          <NavButton
            icon={LogIn}
            label="로그인"
            path="/login"
            isActive={location.pathname === '/login'}
          />
        </div>
      </nav>

      {/* Maps flyout panel */}
      {mapsOpen && (
        <div
          ref={flyoutRef}
          className="fixed left-16 top-0 h-screen w-52 bg-surface border-r border-border z-39 animate-slide-in"
        >
          <div className="flex items-center justify-between px-4 py-5">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-gold" />
              <span className="text-sm font-semibold text-text">맵 선택</span>
            </div>
            <button
              onClick={() => setMapsOpen(false)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-surface-alt transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          <div className="px-2 pb-4 space-y-0.5">
            {allMaps.map((map) => {
              const active = location.pathname === map.path;
              return (
                <Link
                  key={map.path}
                  to={map.path}
                  onClick={() => setMapsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm no-underline transition-colors',
                    active
                      ? 'bg-gold/20 text-gold font-medium'
                      : 'text-text-secondary hover:text-text hover:bg-surface-alt'
                  )}
                >
                  <MapPin size={14} className={active ? 'text-gold' : 'text-text-muted'} />
                  {map.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </DebugOverlay>
  );
}
