import React from 'react';
import { ArrowRight } from 'lucide-react';
import Reveal from './Reveal';
import { Page } from '../App';

interface FooterProps {
  onNavigate?: (page: Page) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleLinkClick = (page: Page, e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <footer className="bg-slate-900 text-white pt-20 pb-10">
      <div className="container mx-auto px-6 lg:px-12">
        
        {/* Final CTA Area */}
        <Reveal>
          <div className="flex flex-col md:flex-row items-center justify-between bg-teal-600 rounded-3xl p-8 md:p-12 mb-16 relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 group-hover:scale-110 transition-transform duration-1000"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 group-hover:scale-110 transition-transform duration-1000"></div>
            
            <div className="relative z-10 mb-8 md:mb-0 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
                지금 바로 내 계약서, <br className="md:hidden" />한 번만 점검해 보세요.
              </h2>
              <p className="text-teal-100 text-lg">
                가입하면 하루 5회 무료로 이용할 수 있습니다.
              </p>
            </div>
            
            <button 
              onClick={() => onNavigate && onNavigate('check')}
              className="relative z-10 px-8 py-4 bg-white text-teal-900 font-bold rounded-xl shadow-lg hover:bg-teal-50 hover:scale-105 hover:shadow-2xl transition-all duration-300 flex items-center gap-2 group/btn"
            >
              지금 사전 점검 시작하기
              <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </Reveal>

        {/* Links & Copyright */}
        <div className="border-t border-slate-800 pt-10 flex flex-col items-center gap-6">
          <div className="text-slate-400 text-sm flex flex-wrap justify-center gap-6">
            <a href="#" onClick={(e) => handleLinkClick('why', e)} className="hover:text-white transition-colors hover:underline underline-offset-4">서비스 소개</a>
            <a href="#" onClick={(e) => handleLinkClick('privacyPolicy', e)} className="hover:text-white transition-colors hover:underline underline-offset-4">개인정보처리방침</a>
            <a href="#" onClick={(e) => handleLinkClick('terms', e)} className="hover:text-white transition-colors hover:underline underline-offset-4">이용약관</a>
            <a href="#" onClick={(e) => handleLinkClick('contact', e)} className="hover:text-white transition-colors hover:underline underline-offset-4">문의하기</a>
          </div>

          <div className="text-slate-500 text-xs">
            © 2025 Johang-JoopJoop. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;