import { Link } from 'react-router-dom';
import { Crosshair, Mail, Lock, User } from 'lucide-react';
import DebugOverlay from '../../components/debug/DebugOverlay';

export default function SignupPage() {
  return (
    <DebugOverlay id="signup-page" tag="div" label="SignupPage" variant="feature">
      <div id="signup-page" className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gold/20 flex items-center justify-center mb-4">
              <Crosshair size={28} className="text-gold" />
            </div>
            <h1 className="text-xl font-semibold text-text">계정 만들기</h1>
            <p className="text-sm text-text-muted mt-1">타르코프 퀘스트 추적을 시작하세요</p>
          </div>

          {/* Form */}
          <div className="bg-surface rounded-2xl p-6 border border-border">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-text-muted mb-2 tracking-wider">
                  사용자 이름
                </label>
                <div className="flex items-center gap-3 bg-surface-alt rounded-xl px-4 py-3">
                  <User size={16} className="text-text-muted flex-shrink-0" />
                  <input
                    id="signup-username"
                    type="text"
                    placeholder="Choose a username"
                    className="bg-transparent border-none outline-none text-sm text-text placeholder:text-text-muted w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase text-text-muted mb-2 tracking-wider">
                  이메일
                </label>
                <div className="flex items-center gap-3 bg-surface-alt rounded-xl px-4 py-3">
                  <Mail size={16} className="text-text-muted flex-shrink-0" />
                  <input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    className="bg-transparent border-none outline-none text-sm text-text placeholder:text-text-muted w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase text-text-muted mb-2 tracking-wider">
                  비밀번호
                </label>
                <div className="flex items-center gap-3 bg-surface-alt rounded-xl px-4 py-3">
                  <Lock size={16} className="text-text-muted flex-shrink-0" />
                  <input
                    id="signup-password"
                    type="password"
                    placeholder="Choose a password"
                    className="bg-transparent border-none outline-none text-sm text-text placeholder:text-text-muted w-full"
                  />
                </div>
              </div>

              <button
                id="signup-submit"
                type="submit"
                className="w-full py-3 rounded-xl text-sm font-semibold bg-gold text-bg hover:bg-gold-dim transition-colors cursor-pointer"
              >
                계정 만들기
              </button>
            </form>
          </div>

          <p className="text-sm text-center mt-6 text-text-muted">
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="text-gold hover:text-gold-dim no-underline transition-colors">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </DebugOverlay>
  );
}
