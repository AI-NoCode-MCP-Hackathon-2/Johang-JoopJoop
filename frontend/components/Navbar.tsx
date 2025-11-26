import React, { useState, useEffect, useRef } from 'react';
import { FileText, Menu, X, User as UserIcon, LogOut, ChevronDown, ShieldCheck } from 'lucide-react';
import { Page } from '../App';
import { useAuth } from './AuthContext';
import AuthModal from './AuthModal';

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  // User Menu State
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { user, isAuthenticated, logout, isAdmin } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Close user menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNavClick = (page: Page) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  const openLogin = () => {
    setAuthMode('login');
    setIsAuthModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const openSignup = () => {
    setAuthMode('signup');
    setIsAuthModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  const navLinks: { name: string; id: Page }[] = [
    { name: '서비스 소개', id: 'why' },
    { name: '작동 방식', id: 'how' },
    { name: '주요 기능', id: 'features' },
    { name: '챗봇', id: 'chatbot' },
    { name: '전문가 연결', id: 'experts' },
    { name: '요금제', id: 'pricing' },
    { name: 'FAQ', id: 'faq' },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || isMobileMenuOpen ? 'bg-white/95 backdrop-blur-md border-b border-slate-100 py-3' : 'bg-transparent py-5'}`}>
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <button 
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2 z-50 relative group focus:outline-none"
            >
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-slate-900">
                조항줍줍
              </span>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`text-sm font-medium transition-colors ${
                    currentPage === link.id
                      ? 'text-teal-600 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {link.name}
                </button>
              ))}

              {/* Admin Link for Desktop */}
              {isAdmin && (
                <button
                  onClick={() => handleNavClick('admin')}
                  className={`text-sm font-medium transition-colors flex items-center gap-1 ${
                    currentPage === 'admin'
                      ? 'text-indigo-600 font-bold'
                      : 'text-slate-600 hover:text-indigo-600'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" /> 관리자
                </button>
              )}
            </div>

            {/* Desktop CTA / Auth */}
            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated && user ? (
                // User Menu (Authenticated)
                <div className="relative" ref={userMenuRef}>
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold text-sm">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-sm font-bold text-slate-700 max-w-[100px] truncate">
                      {user.name}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 animate-in fade-in zoom-in-95 duration-200">
                      <div className="px-4 py-2 border-b border-slate-50">
                        <p className="text-xs text-slate-500">잔여 점검 횟수</p>
                        <p className="font-bold text-teal-600">{user.remainingChecksToday}회</p>
                      </div>
                      <button
                        onClick={() => {
                          handleNavClick('mypage');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <UserIcon className="w-4 h-4" /> 마이페이지
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" /> 로그아웃
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // Login/Signup Button (Not Authenticated)
                <button 
                  onClick={openLogin}
                  className="text-sm font-bold text-slate-600 hover:text-slate-900 px-3 py-2"
                >
                  로그인 / 회원가입
                </button>
              )}

              {/* Check CTA */}
              <button 
                onClick={() => handleNavClick('check')}
                className={`inline-block px-5 py-2.5 text-sm font-bold rounded-xl shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                  currentPage === 'check'
                    ? 'bg-teal-600 text-white hover:bg-teal-700'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                사전 점검하기
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden relative z-50 p-2 text-slate-900 focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <div className={`fixed inset-0 bg-white z-40 flex flex-col pt-24 px-6 transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col gap-6 text-lg h-full overflow-y-auto pb-10">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`text-left font-bold border-b border-slate-100 pb-4 ${
                  currentPage === link.id ? 'text-teal-600' : 'text-slate-900'
                }`}
              >
                {link.name}
              </button>
            ))}

            {/* Admin Link for Mobile */}
            {isAdmin && (
              <button
                onClick={() => handleNavClick('admin')}
                className={`text-left font-bold border-b border-slate-100 pb-4 flex items-center gap-2 ${
                  currentPage === 'admin' ? 'text-indigo-600' : 'text-slate-900'
                }`}
              >
                <ShieldCheck className="w-5 h-5" /> 관리자
              </button>
            )}

            <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
              {isAuthenticated && user ? (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <button className="w-full text-left py-3 text-slate-700 font-medium border-b border-slate-50">
                    잔여 점검 횟수: <span className="text-teal-600 font-bold">{user.remainingChecksToday}회</span>
                  </button>
                  <button
                    onClick={() => {
                      handleNavClick('mypage');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-3 text-slate-700 font-medium border-b border-slate-50"
                  >
                    마이페이지
                  </button>
                  <button onClick={handleLogout} className="w-full text-left py-3 text-red-600 font-medium">
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={openLogin}
                    className="w-full py-3 bg-white border border-slate-200 text-slate-900 font-bold rounded-xl shadow-sm"
                  >
                    로그인
                  </button>
                  <button 
                    onClick={openSignup}
                    className="w-full py-3 bg-teal-50 text-teal-700 font-bold rounded-xl shadow-sm border border-teal-100"
                  >
                    이메일로 회원가입
                  </button>
                </>
              )}
              
              <button 
                onClick={() => handleNavClick('check')}
                className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg text-center active:scale-95 transition-transform mt-2"
              >
                사전 점검하기
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Auth Modal Integration */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        mode={authMode} 
        onClose={() => setIsAuthModalOpen(false)}
        onSwitchMode={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
      />
    </>
  );
};

export default Navbar;