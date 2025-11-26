
import React, { useEffect, useState } from 'react';
import { ArrowRight, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import MockContractCard from './MockContractCard';
import { Page } from '../App';

interface HeroProps {
  onNavigate: (page: Page) => void;
  onRequestPreCheck?: () => void;
}

const Hero: React.FC<HeroProps> = ({ onNavigate, onRequestPreCheck }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const handleCtaClick = () => {
    if (onRequestPreCheck) {
      onRequestPreCheck();
    } else {
      onNavigate('check');
    }
  };

  return (
    <section className="relative w-full overflow-hidden pt-12 pb-20 lg:pt-28 lg:pb-32">
      {/* Background Decor Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className={`absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-teal-50 rounded-full blur-3xl opacity-60 mix-blend-multiply transition-transform duration-[2000ms] ease-out ${loaded ? 'translate-y-0' : '-translate-y-10'}`} />
        <div className={`absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-orange-50 rounded-full blur-3xl opacity-60 mix-blend-multiply transition-transform duration-[2000ms] ease-out delay-300 ${loaded ? 'translate-y-0' : 'translate-y-10'}`} />
      </div>

      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left Content */}
          <div className="max-w-2xl flex flex-col items-start space-y-8 z-10">
            
            {/* Tag/Label */}
            <div className={`inline-flex items-center space-x-2 px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm hover:shadow-md transition-all duration-500 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              <span className="text-xs font-semibold tracking-wide text-slate-600 uppercase font-display">
                Contract Early-Warning AI
              </span>
            </div>

            {/* Headline */}
            <h1 className={`text-4xl sm:text-5xl lg:text-[3.5rem] leading-tight font-black tracking-tight text-slate-900 break-keep font-display transition-all duration-700 delay-100 space-y-1.5 sm:space-y-2 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <span className="block">사인하기 전에</span>
              <span className="block">
                <span className="relative inline-block text-teal-700">
                  함정 조항
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-teal-200/50 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                  </svg>
                </span>부터 먼저
              </span>
              <span className="block">찾아드립니다.</span>
            </h1>

            {/* Subheadline */}
            <p className={`text-lg sm:text-xl text-slate-600 leading-relaxed break-keep max-w-lg transition-all duration-700 delay-200 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              근로계약서·알바 계약서를 업로드하면, 숨은 위험 조항을 색상으로 표시하고
              쉬운 우리말로 알려주는 <span className="font-bold text-slate-800">AI 사전 점검 서비스</span>입니다.
            </p>

            {/* CTA Group */}
            <div className={`flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-2 transition-all duration-700 delay-300 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <button
                onClick={handleCtaClick}
                className="group relative px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-lg hover:bg-slate-800 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden"
              >
                <span className="relative z-10">내 계약서 미리 점검하기</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500 via-slate-900 to-slate-900 opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
              </button>
              
              <button 
                onClick={() => onNavigate('how')}
                className="px-8 py-4 bg-white border border-slate-200 text-slate-700 font-semibold rounded-2xl shadow-sm hover:border-slate-300 hover:bg-slate-50 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center"
              >
                서비스가 어떻게 작동하나요?
              </button>
            </div>

            {/* Trust Indicator */}
            <div className={`flex items-center gap-2 text-sm text-slate-500 bg-slate-100/50 px-4 py-2 rounded-lg border border-slate-100 transition-all duration-700 delay-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>주요 개인정보는 업로드 즉시 <strong className="text-slate-700 font-medium">자동 마스킹</strong> 처리됩니다.</span>
            </div>
          </div>

          {/* Right Content - Mock UI */}
          <div className={`relative w-full flex justify-center lg:justify-end z-0 mt-8 lg:mt-0 transition-all duration-1000 delay-300 ${loaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
            <div className="relative w-full max-w-[500px] perspective-1000">
              {/* Decorative backdrops */}
              <div className="absolute top-4 right-[-10px] w-full h-full bg-slate-200/50 rounded-[2rem] -rotate-3 transition-transform duration-500 hover:rotate-0" />
              <div className="absolute top-2 right-[-5px] w-full h-full bg-slate-100/80 rounded-[2rem] -rotate-1 transition-transform duration-500 hover:rotate-0" />
              
              {/* Main Card */}
              <MockContractCard showTooltips={false} />

              {/* Floating Feature Tags - Animated */}
              <div className="absolute -left-4 top-[15%] sm:top-[18%] md:top-1/4 animate-bounce-slow hidden sm:flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 hover:scale-105 transition-transform cursor-default z-10">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-medium uppercase">Risk Detected</div>
                  <div className="text-xs font-bold text-slate-800">독소 조항 3건 발견</div>
                </div>
              </div>

              <div className="absolute -right-8 bottom-[20%] sm:bottom-[25%] md:bottom-1/3 animate-bounce-slow-delayed hidden sm:flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 hover:scale-105 transition-transform cursor-default z-10">
                <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-medium uppercase">Safety Check</div>
                  <div className="text-xs font-bold text-slate-800">개인정보 마스킹 완료</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
