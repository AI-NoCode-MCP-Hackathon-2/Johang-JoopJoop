import React from 'react';
import Reveal from './Reveal';

const AboutSection: React.FC = () => {
  return (
    <section className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="container mx-auto px-6 lg:px-12 text-center">
        <Reveal>
          <div className="inline-block px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-500 mb-6 hover:border-slate-300 transition-colors">
            Team Story
          </div>
          <h3 className="text-2xl font-display font-bold text-slate-900 mb-6">
            "계약서 앞에서 쫄지 않는 세상을 만듭니다"
          </h3>
          <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
            조항줍줍 팀은 AI NoCode & MCP Hackathon에서 시작된 팀입니다. <br className="hidden md:block" />
            사회초년생들이 법률 지식이 부족하다는 이유로 불공정한 계약을 맺는 일이 없도록, <br className="hidden md:block" />
            누구나 쉽고 빠르게 내 권리를 지킬 수 있는 기술을 만듭니다.
          </p>
        </Reveal>
      </div>
    </section>
  );
};

export default AboutSection;