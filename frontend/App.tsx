import { useState, useEffect, FC } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ServiceIntroSection from './components/ServiceIntroSection';
import HowItWorksSection from './components/HowItWorksSection';
import FeatureSection from './components/FeatureSection';
import FAQSection from './components/FAQSection';
import PreCheckSection from './components/PreCheckSection';
import PrivacySection from './components/PrivacySection';
import AboutSection from './components/AboutSection';
import Footer from './components/Footer';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import TermsPage from './components/TermsPage';
import ContactPage from './components/ContactPage';
import MyPage from './components/MyPage';
import ChatbotPage from './components/ChatbotPage';
import ExpertSupportPage from './components/ExpertSupportPage';
import PricingPage from './components/PricingPage';
import AdminDashboardPage from './components/AdminDashboardPage';
import AuthModal from './components/AuthModal';
import { AuthProvider, useAuth } from './components/AuthContext';
import { AnalysisHistoryProvider } from './components/AnalysisHistoryContext';
import { CheckCircle2, Lock } from 'lucide-react';
import Reveal from './components/Reveal';

export type Page =
  | 'home'
  | 'why'
  | 'how'
  | 'features'
  | 'faq'
  | 'check'
  | 'privacyPolicy'
  | 'terms'
  | 'contact'
  | 'mypage'
  | 'chatbot'
  | 'experts'
  | 'pricing'
  | 'admin';

type AuthMode = 'login' | 'signup' | 'reset';

const AppContent: FC = () => {
  // Hash-based routing: Read initial page from URL hash
  const getPageFromHash = (): Page => {
    const hash = window.location.hash.slice(1); // Remove '#'
    const validPages: Page[] = ['home', 'why', 'how', 'features', 'faq', 'check', 'privacyPolicy', 'terms', 'contact', 'mypage', 'chatbot', 'experts', 'pricing', 'admin'];
    return validPages.includes(hash as Page) ? (hash as Page) : 'home';
  };

  const [currentPage, setCurrentPage] = useState<Page>(getPageFromHash());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthMode>('login');
  const [authWelcomeAction, setAuthWelcomeAction] = useState<'login' | 'signup' | 'provider' | null>(null);

  const { user, isAuthenticated, isAdmin } = useAuth();

  // Handle browser back/forward buttons
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPage(getPageFromHash());
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    // Scroll to top whenever the page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Auto-hide welcome banner after 4 seconds
  useEffect(() => {
    if (authWelcomeAction && currentPage === 'home') {
      const timer = setTimeout(() => {
        setAuthWelcomeAction(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [authWelcomeAction, currentPage]);

  // Navigation handler: Updates URL hash and state
  const handleNavigate = (page: Page) => {
    // Protected pages: require authentication
    if ((page === 'check' || page === 'mypage' || page === 'chatbot') && !isAuthenticated) {
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
      return;
    }

    // Admin page: require admin role
    if (page === 'admin' && !isAdmin) {
      window.location.hash = page;
      setCurrentPage(page); // Will show access denied page
      return;
    }

    // Update URL hash (this will trigger hashchange event and update state)
    window.location.hash = page;
  };

  const handleAuthSuccess = (action: 'login' | 'signup' | 'provider') => {
    setIsAuthModalOpen(false);
    handleNavigate('home');
    setAuthWelcomeAction(action);
  };

  const handleRequestPreCheck = () => {
    if (!isAuthenticated) {
      setAuthModalMode('signup');
      setIsAuthModalOpen(true);
    } else {
      handleNavigate('check');
    }
  };

  const renderProtectedPageNotice = () => {
    return (
      <section className="py-32 bg-[#FDFCF8] min-h-[70vh] flex items-center justify-center">
        <div className="container mx-auto px-6 text-center">
          <Reveal>
            <div className="bg-white p-12 rounded-3xl shadow-xl border border-slate-100 max-w-lg mx-auto">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">로그인이 필요합니다</h2>
              <p className="text-slate-600 mb-8">
                이 페이지는 회원 전용입니다. <br />
                로그인 후 이용해 주세요.
              </p>
              <button
                onClick={() => {
                  setAuthModalMode('login');
                  setIsAuthModalOpen(true);
                }}
                className="px-8 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors"
              >
                로그인하기
              </button>
            </div>
          </Reveal>
        </div>
      </section>
    );
  };

  const renderAdminPage = () => {
    if (isAdmin) {
      return <AdminDashboardPage />;
    }
    return (
      <section className="py-32 bg-[#FDFCF8] min-h-[70vh] flex items-center justify-center">
        <div className="container mx-auto px-6 text-center">
          <Reveal>
            <div className="bg-white p-12 rounded-3xl shadow-xl border border-slate-100 max-w-lg mx-auto">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">접근 권한이 없습니다</h2>
              <p className="text-slate-600 mb-8">
                이 페이지는 관리자 전용입니다. <br />
                일반 계정으로는 접속하실 수 없습니다.
              </p>
              <button
                onClick={() => handleNavigate('home')}
                className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
              >
                홈으로 돌아가기
              </button>
            </div>
          </Reveal>
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-slate-900 selection:bg-teal-100 selection:text-teal-900 font-sans">
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />

      <main className="pt-20"> {/* Add padding for fixed navbar */}
        {/* Welcome Banner */}
        {authWelcomeAction && currentPage === 'home' && (
          <div className="fixed top-20 left-0 right-0 z-50 flex justify-center px-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-teal-50 border border-teal-200 text-teal-800 px-6 py-4 rounded-2xl shadow-lg max-w-2xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm leading-relaxed">
                {authWelcomeAction === 'signup'
                  ? '회원가입이 완료되었습니다. 상단의 \'사전 점검하기\' 메뉴에서 첫 근로계약서를 점검해 보세요.'
                  : '로그인이 완료되었습니다. 상단 메뉴에서 사전 점검하기를 눌러 계약서 점검을 시작해 보세요.'}
              </p>
            </div>
          </div>
        )}

        {currentPage === 'home' && (
          <>
            <Hero onNavigate={handleNavigate} onRequestPreCheck={handleRequestPreCheck} />
            <PrivacySection />
            <AboutSection />
          </>
        )}

        {currentPage === 'why' && <ServiceIntroSection />}

        {currentPage === 'how' && <HowItWorksSection />}

        {currentPage === 'features' && <FeatureSection />}

        {currentPage === 'faq' && <FAQSection onNavigate={handleNavigate} />}

        {currentPage === 'check' && (isAuthenticated ? <PreCheckSection onNavigate={handleNavigate} /> : renderProtectedPageNotice())}

        {currentPage === 'privacyPolicy' && <PrivacyPolicyPage />}

        {currentPage === 'terms' && <TermsPage />}

        {currentPage === 'contact' && <ContactPage />}

        {currentPage === 'mypage' && (isAuthenticated ? <MyPage /> : renderProtectedPageNotice())}

        {currentPage === 'chatbot' && (isAuthenticated ? <ChatbotPage /> : renderProtectedPageNotice())}

        {currentPage === 'experts' && <ExpertSupportPage />}

        {currentPage === 'pricing' && <PricingPage />}

        {currentPage === 'admin' && renderAdminPage()}
      </main>

      <Footer onNavigate={handleNavigate} />

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        mode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onSwitchMode={setAuthModalMode}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};

const App: FC = () => {
  return (
    <AuthProvider>
      <AnalysisHistoryProvider>
        <AppContent />
      </AnalysisHistoryProvider>
    </AuthProvider>
  );
};

export default App;