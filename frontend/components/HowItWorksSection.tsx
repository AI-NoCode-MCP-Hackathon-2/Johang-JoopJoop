import React from 'react';
import { UploadCloud, ScanSearch, FileCheck2 } from 'lucide-react';
import Reveal from './Reveal';
import MockContractCard from './MockContractCard';

const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      icon: <UploadCloud className="w-6 h-6 text-white" />,
      title: "1. 계약서 업로드",
      desc: "사진, PDF, 또는 텍스트로 계약서를 올려주세요.",
      color: "bg-slate-900"
    },
    {
      icon: <ScanSearch className="w-6 h-6 text-white" />,
      title: "2. AI 자동 분석",
      desc: "위험 조항(Red)과 주의 조항(Orange)을 찾아냅니다.",
      color: "bg-teal-600"
    },
    {
      icon: <FileCheck2 className="w-6 h-6 text-white" />,
      title: "3. 리포트 확인",
      desc: "쉬운 우리말 설명과 3줄 요약으로 내용을 파악하세요.",
      color: "bg-indigo-600"
    },
  ];

  return (
    <section className="py-24 bg-[#FDFCF8]">
      <div className="container mx-auto px-6 lg:px-12">
        <Reveal>
          <div className="text-center mb-16">
            <span className="text-teal-600 font-bold tracking-wide text-sm uppercase mb-2 block">How it works</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 break-keep">
              복잡한 계약서, <br className="md:hidden" />3단계로 쉽게 확인하세요.
            </h2>
          </div>
        </Reveal>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Steps List */}
          <div className="space-y-8">
            {steps.map((step, index) => (
              <Reveal key={index} delay={index * 150} direction="left">
                <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 transition-all duration-300">
                  <div className={`w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center flex-shrink-0 ${step.color} transform group-hover:scale-110 transition-transform`}>
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{step.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Visual Representation */}
          <Reveal delay={300} direction="right">
            <div className="relative">
              {/* Decorative elements behind the card */}
              <div className="absolute inset-0 bg-gradient-to-tr from-teal-50 to-indigo-50 rounded-[2.5rem] transform rotate-3 scale-105 opacity-70"></div>
              <div className="relative transform hover:-rotate-1 transition-transform duration-500 ease-out">
                {/* Main Card - Tooltips Visible on How It Works */}
                <MockContractCard showTooltips={true} />
              </div>
              
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce-slow">
                <div className="bg-teal-100 text-teal-700 px-2 py-1 rounded text-xs font-bold">New</div>
                <div className="text-sm font-bold text-slate-800">유사 판례 데이터 탑재 완료!</div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;