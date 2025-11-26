import React, { useState, useEffect } from 'react';
import { X, Mail, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth, AuthProviderType } from './AuthContext';

type AuthMode = 'login' | 'signup' | 'reset';

interface AuthModalProps {
  isOpen: boolean;
  mode: AuthMode;
  onClose: () => void;
  onSwitchMode: (mode: AuthMode) => void;
  onAuthSuccess?: (action: 'login' | 'signup' | 'provider') => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, mode, onClose, onSwitchMode, onAuthSuccess }) => {
  const { loginWithEmail, signupWithEmail, loginWithProvider, sendPasswordResetEmail, isAuthLoading } = useAuth();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Reset form state when modal opens or mode changes
  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setName('');
      setError(null);
      setSuccessMessage(null);
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      if (mode === 'reset') {
        if (!email) {
          setError('이메일을 입력해 주세요.');
          return;
        }
        await sendPasswordResetEmail(email);
        setSuccessMessage('비밀번호 재설정 안내를 이메일로 발송한 것으로 처리되었습니다.');
      } else if (mode === 'signup') {
        if (!name || !email || !password) {
          setError('모든 항목을 입력해 주세요.');
          return;
        }
        await signupWithEmail(name, email, password);
        if (onAuthSuccess) onAuthSuccess('signup');
        onClose();
      } else {
        if (!email || !password) {
          setError('이메일과 비밀번호를 입력해 주세요.');
          return;
        }
        await loginWithEmail(email, password);
        if (onAuthSuccess) onAuthSuccess('login');
        onClose();
      }
    } catch (err) {
      setError('처리 중 오류가 발생했습니다.');
    }
  };

  const handleSocialLogin = async (provider: AuthProviderType) => {
    setError(null);
    try {
      await loginWithProvider(provider);
      if (onAuthSuccess) onAuthSuccess('provider');
      onClose();
    } catch (err) {
      setError(`${provider} 로그인 중 오류가 발생했습니다.`);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            {mode === 'reset' && (
              <button
                onClick={() => onSwitchMode('login')}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-2xl font-display font-bold text-slate-900">
              {mode === 'login' ? '로그인' : mode === 'signup' ? '회원가입' : '비밀번호 재설정'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {successMessage && (
            <div className="mb-6 p-4 bg-teal-50 border border-teal-100 rounded-xl">
              <div className="flex items-start gap-2 text-sm text-teal-600 mb-3">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{successMessage}</span>
              </div>
              <button
                onClick={() => onSwitchMode('login')}
                className="w-full py-2 bg-teal-600 text-white text-sm font-bold rounded-lg hover:bg-teal-700 transition-colors"
              >
                로그인 화면으로 이동
              </button>
            </div>
          )}

          {!successMessage && <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">이름</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="실명 입력"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
              />
            </div>
            {mode !== 'reset' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-bold text-slate-700">비밀번호</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => onSwitchMode('reset')}
                      className="text-xs text-teal-600 hover:text-teal-700 font-medium hover:underline"
                    >
                      비밀번호를 잊으셨나요?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="영문, 숫자 포함 8자 이상"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isAuthLoading}
              className={`w-full py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2 ${isAuthLoading ? 'opacity-70 cursor-wait' : ''}`}
            >
              {isAuthLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Mail className="w-5 h-5" />
              )}
              {mode === 'login' ? '이메일로 로그인' : mode === 'signup' ? '이메일로 회원가입' : '재설정 이메일 전송'}
            </button>
          </form>}

          {mode !== 'reset' && (
            <>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-4 text-slate-400 font-medium">SNS 간편 로그인</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('kakao')}
                  disabled={isAuthLoading}
                  className="w-full py-3.5 bg-[#FEE500] text-black/90 font-bold rounded-xl hover:bg-[#FDD800] transition-colors flex items-center justify-center gap-2"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M12 3c5.523 0 10 3.477 10 7.767 0 2.583-1.636 4.887-4.194 6.277.165.957.6 3.515.632 3.738.019.13-.092.213-.197.145-.11-.07-2.673-1.802-3.882-2.617C13.567 18.47 12.8 18.534 12 18.534c-5.523 0-10-3.477-10-7.767S6.477 3 12 3z"/></svg>
                  카카오로 계속하기
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('naver')}
                  disabled={isAuthLoading}
                  className="w-full py-3.5 bg-[#03C75A] text-white font-bold rounded-xl hover:bg-[#02B351] transition-colors flex items-center justify-center gap-2"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z"/></svg>
                  네이버로 계속하기
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  disabled={isAuthLoading}
                  className="w-full py-3.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none"><path d="M23.52 12.29c0-.85-.08-1.68-.22-2.48H12v4.7h6.46c-.28 1.48-1.12 2.74-2.39 3.59v2.98h3.87c2.26-2.08 3.56-5.15 3.56-8.79z" fill="#4285F4"/><path d="M12 24c3.24 0 5.95-1.07 7.94-2.9l-3.87-2.98c-1.07.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.12-6.73-4.96H1.36v3.12C3.34 21.36 7.39 24 12 24z" fill="#34A853"/><path d="M5.27 14.29c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.59H1.36C.49 8.32 0 10.29 0 12s.49 3.68 1.36 5.41l3.91-3.12z" fill="#FBBC05"/><path d="M12 4.75c1.76 0 3.34.61 4.59 1.8l3.43-3.43C17.94 1.14 15.23 0 12 0 7.39 0 3.34 2.64 1.36 6.59l3.91 3.12c.95-2.84 3.6-4.96 6.73-4.96z" fill="#EA4335"/></svg>
                  Google로 계속하기
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!successMessage && (
          <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              {mode === 'reset' ? (
                <>
                  기억하셨나요?{' '}
                  <button
                    onClick={() => onSwitchMode('login')}
                    className="text-teal-600 font-bold hover:underline"
                  >
                    로그인 하기
                  </button>
                </>
              ) : (
                <>
                  {mode === 'login' ? '아직 계정이 없으신가요?' : '이미 계정이 있으신가요?'}
                  {' '}
                  <button
                    onClick={() => onSwitchMode(mode === 'login' ? 'signup' : 'login')}
                    className="text-teal-600 font-bold hover:underline"
                  >
                    {mode === 'login' ? '회원가입 하기' : '로그인 하기'}
                  </button>
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;