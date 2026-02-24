import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Search, LogOut, LogIn } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import DebugOverlay from '../debug/DebugOverlay';

const pageTitles: Record<string, string> = {
  '/': '대시보드',
  '/quests': '퀘스트',
  '/map': '맵',
  '/login': '로그인',
  '/signup': '회원가입',
};

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const title =
    pageTitles[location.pathname] ||
    (location.pathname.startsWith('/quests/') ? '퀘스트 상세' :
    location.pathname.startsWith('/map/') ? '맵 뷰' : 'Tarkov Quest Helper');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <DebugOverlay id="app-header" tag="header" label="Header" variant="layout">
      <header
        id="app-header"
        className="flex items-center justify-between px-6 h-16"
      >
        <div>
          <h1 className="text-xl font-semibold text-text">{title}</h1>
          <p className="text-xs text-text-muted">타르코프 진행 상황 추적</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search placeholder */}
          <div className="hidden md:flex items-center gap-2 bg-surface rounded-xl px-4 py-2">
            <Search size={16} className="text-text-muted" />
            <input
              type="text"
              placeholder="퀘스트, 아이템 검색..."
              className="bg-transparent border-none outline-none text-sm text-text placeholder:text-text-muted w-48"
            />
          </div>

          {/* Notification bell */}
          <button className="w-10 h-10 flex items-center justify-center rounded-xl text-text-secondary hover:text-text hover:bg-surface transition-colors">
            <Bell size={18} strokeWidth={1.5} />
          </button>

          {/* Auth section */}
          {user ? (
            <>
              <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center text-gold text-sm font-semibold">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={handleLogout}
                title="로그아웃"
                className="w-10 h-10 flex items-center justify-center rounded-xl text-text-secondary hover:text-red-400 hover:bg-surface transition-colors"
              >
                <LogOut size={18} strokeWidth={1.5} />
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gold/20 text-gold hover:bg-gold/30 transition-colors"
            >
              <LogIn size={16} />
              로그인
            </button>
          )}
        </div>
      </header>
    </DebugOverlay>
  );
}
