import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, RotateCcw, LogOut, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useProgressStore } from '../../store/progressStore';

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const { resetProgress } = useProgressStore();
  const navigate = useNavigate();

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState('');

  const handleReset = async () => {
    setResetting(true);
    setResetError('');
    try {
      await resetProgress();
      setShowResetModal(false);
    } catch {
      setResetError('초기화에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setResetting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* 사용자 정보 */}
      <div className="bg-surface rounded-2xl p-6 border border-border">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-gold/20 flex items-center justify-center text-gold text-xl font-semibold">
            {user?.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text">{user?.username}</h2>
            <p className="text-sm text-text-muted">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 px-4 py-3 bg-surface-alt rounded-xl">
            <User size={16} className="text-text-muted" />
            <div className="flex-1">
              <p className="text-xs text-text-muted">사용자명</p>
              <p className="text-sm text-text">{user?.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 bg-surface-alt rounded-xl">
            <User size={16} className="text-text-muted" />
            <div className="flex-1">
              <p className="text-xs text-text-muted">이메일</p>
              <p className="text-sm text-text">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 진행 초기화 */}
      <div className="bg-surface rounded-2xl p-6 border border-border">
        <h3 className="text-base font-semibold text-text mb-2">새 시즌 시작</h3>
        <p className="text-sm text-text-muted mb-4">
          새 와이프가 시작되면 모든 퀘스트와 아이템 진행 상태를 초기화할 수 있습니다.
        </p>
        <button
          onClick={() => setShowResetModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
        >
          <RotateCcw size={16} />
          진행 초기화
        </button>
      </div>

      {/* 로그아웃 */}
      <div className="bg-surface rounded-2xl p-6 border border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-red-400 hover:bg-surface-alt transition-colors cursor-pointer"
        >
          <LogOut size={16} />
          로그아웃
        </button>
      </div>

      {/* 초기화 확인 모달 */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-surface rounded-2xl p-6 border border-border max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-text">진행 초기화</h3>
            </div>
            <p className="text-sm text-text-secondary mb-6">
              모든 퀘스트 및 아이템 진행이 초기화됩니다. 이 작업은 되돌릴 수 없습니다.
            </p>
            {resetError && (
              <p className="text-sm text-red-400 mb-4">{resetError}</p>
            )}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                disabled={resetting}
                className="px-4 py-2 rounded-xl text-sm text-text-secondary hover:text-text hover:bg-surface-alt transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={handleReset}
                disabled={resetting}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50"
              >
                {resetting ? '초기화 중...' : '초기화'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
