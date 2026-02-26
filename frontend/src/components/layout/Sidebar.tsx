import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ScrollText,
  BookOpen,
  Map,
  LogIn,
  Settings,
  X,
  MapPin,
  RefreshCw,
  Check,
  AlertCircle,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import DebugOverlay from '../debug/DebugOverlay';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useAuthStore } from '../../store/authStore';
import { adminApi, type SyncResult } from '../../api/adminApi';

const navItems = [
  { icon: LayoutDashboard, label: '대시보드', path: '/' },
  { icon: ScrollText, label: '퀘스트', path: '/quests' },
  { icon: BookOpen, label: '메인 스토리', path: '/story' },
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

type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

function SyncButton() {
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [result, setResult] = useState<SyncResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [showResult, setShowResult] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (resultRef.current && !resultRef.current.contains(e.target as Node)) {
        setShowResult(false);
      }
    }
    if (showResult) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showResult]);

  const handleSync = async () => {
    if (status === 'syncing') return;
    setStatus('syncing');
    setResult(null);
    setErrorMsg('');
    try {
      const data = await adminApi.triggerSync();
      setResult(data);
      setStatus('success');
      setShowResult(true);
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '동기화 실패';
      setErrorMsg(msg);
      setStatus('error');
      setShowResult(true);
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  const icon =
    status === 'syncing' ? RefreshCw :
    status === 'success' ? Check :
    status === 'error' ? AlertCircle : RefreshCw;

  const colorClass =
    status === 'syncing' ? 'text-gold animate-spin' :
    status === 'success' ? 'text-success' :
    status === 'error' ? 'text-danger' :
    'text-text-secondary hover:text-text hover:bg-surface-alt';

  return (
    <div className="relative">
      <Tooltip.Provider delayDuration={200}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              onClick={handleSync}
              disabled={status === 'syncing'}
              className={cn(
                'w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-200 flex-shrink-0 cursor-pointer',
                colorClass
              )}
            >
              {(() => { const Icon = icon; return <Icon size={20} strokeWidth={1.5} />; })()}
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              side="right"
              sideOffset={12}
              className="px-3 py-1.5 text-xs font-medium text-text bg-surface-alt rounded-lg shadow-lg z-[9999]"
            >
              {status === 'syncing' ? '동기화 중...' : '데이터 동기화'}
              <Tooltip.Arrow className="fill-surface-alt" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>

      {showResult && (
        <div
          ref={resultRef}
          className="fixed left-16 bottom-4 w-72 bg-surface border border-border rounded-xl shadow-lg z-50 p-4"
        >
          {status === 'error' ? (
            <div className="text-danger text-sm">
              <p className="font-semibold mb-1">동기화 실패</p>
              <p className="text-text-muted text-xs">{errorMsg}</p>
            </div>
          ) : result ? (
            <div className="text-sm">
              <p className="font-semibold text-success mb-2">동기화 완료</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-text-secondary">
                <span>딜러</span><span className="text-text">{result.tradersProcessed}</span>
                <span>맵</span><span className="text-text">{result.mapsProcessed}</span>
                <span>아이템</span><span className="text-text">{result.itemsProcessed}</span>
                <span>퀘스트 추가</span><span className="text-text">{result.questsAdded}</span>
                <span>퀘스트 갱신</span><span className="text-text">{result.questsUpdated}</span>
                <span>탈출구</span><span className="text-text">{result.extractsProcessed}</span>
                <span>잠금</span><span className="text-text">{result.locksProcessed}</span>
                <span>컨테이너</span><span className="text-text">{result.containersProcessed}</span>
              </div>
              <p className="text-xs text-text-muted mt-2">{(result.durationMs / 1000).toFixed(1)}초 소요</p>
            </div>
          ) : null}
          <button
            onClick={() => setShowResult(false)}
            className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded text-text-muted hover:text-text cursor-pointer"
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const location = useLocation();
  const [mapsOpen, setMapsOpen] = useState(false);
  const flyoutRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

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

        {/* Settings + Sync (authenticated only) */}
        {user && (
          <div className="flex flex-col items-center gap-2 flex-shrink-0 mb-2">
            <NavButton
              icon={Settings}
              label="설정"
              path="/settings"
              isActive={location.pathname === '/settings'}
            />
            <SyncButton />
          </div>
        )}

        {/* Login */}
        {!user && (
          <div className="flex-shrink-0 mt-4">
            <NavButton
              icon={LogIn}
              label="로그인"
              path="/login"
              isActive={location.pathname === '/login'}
            />
          </div>
        )}
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
