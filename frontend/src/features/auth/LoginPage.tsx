import { Link } from 'react-router-dom';
import { Crosshair, Mail, Lock } from 'lucide-react';
import DebugOverlay from '../../components/debug/DebugOverlay';

export default function LoginPage() {
  return (
    <DebugOverlay id="login-page" tag="div" label="LoginPage" variant="feature">
      <div id="login-page" className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gold/20 flex items-center justify-center mb-4">
              <Crosshair size={28} className="text-gold" />
            </div>
            <h1 className="text-xl font-semibold text-text">다시 만나서 반갑습니다</h1>
            <p className="text-sm text-text-muted mt-1">로그인하여 진행 상황을 추적하세요</p>
          </div>

          {/* Form */}
          <div className="bg-surface rounded-2xl p-6 border border-border">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-text-muted mb-2 tracking-wider">
                  이메일
                </label>
                <div className="flex items-center gap-3 bg-surface-alt rounded-xl px-4 py-3">
                  <Mail size={16} className="text-text-muted flex-shrink-0" />
                  <input
                    id="login-email"
                    type="email"
                    placeholder="이메일을 입력하세요"
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
                    id="login-password"
                    type="password"
                    placeholder="비밀번호를 입력하세요"
                    className="bg-transparent border-none outline-none text-sm text-text placeholder:text-text-muted w-full"
                  />
                </div>
              </div>

              <button
                id="login-submit"
                type="submit"
                className="w-full py-3 rounded-xl text-sm font-semibold bg-gold text-bg hover:bg-gold-dim transition-colors cursor-pointer"
              >
                로그인
              </button>
            </form>
          </div>

          <p className="text-sm text-center mt-6 text-text-muted">
            계정이 없으신가요?{' '}
            <Link to="/signup" className="text-gold hover:text-gold-dim no-underline transition-colors">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </DebugOverlay>
  );
}
