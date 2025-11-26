import React from 'react';
import ProblemSection from './ProblemSection';
import Reveal from './Reveal';
import { Bot, FileText, Gavel, UserCheck, CheckCircle2, Search, Zap } from 'lucide-react';

const ServiceIntroSection: React.FC = () => {
  return (
    <div className="flex flex-col">
      {/* 1. Problem Section (Existing) */}
      <ProblemSection />

      {/* 2. Solution Overview */}
      <section className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="container mx-auto px-6 lg:px-12">
          <Reveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-teal-600 font-bold tracking-wide text-sm uppercase mb-2 block">Solution</span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-6 break-keep">
                조항줍줍은 복잡한 계약서를 <br className="hidden md:block"/>
                <span className="text-teal-600">가장 쉽고 빠르게</span> 점검해 드립니다.
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed break-keep">
                근로계약서, 알바 계약서를 업로드하기만 하세요. <br className="hidden md:block"/>
                AI가 숨겨진 위험 조항을 색상으로 표시하고, 어려운 법률 용어를 쉬운 우리말로 풀어드립니다.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8">
            <Reveal delay={100}>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg transition-all h-full">
                <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center mb-6">
                  <Search className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">위험 조항 자동 탐지</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  계약서 내 불공정하거나 법적 문제가 있는 조항을 AI가 자동으로 찾아내어 빨강, 주황, 노랑으로 직관적으로 표시합니다.
                </p>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg transition-all h-full">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                  <Bot className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">쉬운 AI 해설 & 요약</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  "귀책사유", "포괄임금" 같은 어려운 말 대신, 누구나 이해할 수 있는 쉬운 설명과 3줄 핵심 요약을 제공합니다.
                </p>
              </div>
            </Reveal>

            <Reveal delay={300}>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg transition-all h-full">
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mb-6">
                  <Gavel className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">실제 판례·사례 기반</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  단순한 추측이 아닙니다. 관련된 실제 법적 판례와 유사 사례를 함께 제시하여 판단의 근거를 명확히 합니다.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 3. Target Audience */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-teal-600 font-bold tracking-wide text-sm uppercase mb-2 block">For Whom</span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900">
                이런 분들께 특히 필요합니다
              </h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            <Reveal delay={100}>
              <div className="bg-[#FDFCF8] border border-slate-100 rounded-3xl p-8 hover:-translate-y-1 transition-transform duration-300">
                <div className="mb-4">
                  <span className="bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1 rounded-full">대학생</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">첫 알바를 구하는 대학생</h3>
                <p className="text-slate-600 text-sm">
                  "최저임금은 맞는지, 주휴수당은 받을 수 있는지... 사장님 말만 믿고 사인해도 될까요?"
                </p>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="bg-[#FDFCF8] border border-slate-100 rounded-3xl p-8 hover:-translate-y-1 transition-transform duration-300">
                <div className="mb-4">
                  <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full">사회초년생</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">첫 입사를 앞둔 인턴/신입</h3>
                <p className="text-slate-600 text-sm">
                  "수습 기간 3개월 동안 급여 70%? 이게 정말 법적으로 맞는 내용인지 불안해요."
                </p>
              </div>
            </Reveal>

            <Reveal delay={300}>
              <div className="bg-[#FDFCF8] border border-slate-100 rounded-3xl p-8 hover:-translate-y-1 transition-transform duration-300">
                <div className="mb-4">
                  <span className="bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full">직장인</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">연봉계약이 낯선 직장인</h3>
                <p className="text-slate-600 text-sm">
                  "포괄임금제라 야근 수당이 없다고요? 계약서에 있는 독소 조항을 미리 알고 싶어요."
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 4. Differentiation */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="container mx-auto px-6 lg:px-12">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div>
                <span className="text-teal-400 font-bold tracking-wide text-sm uppercase mb-2 block">Why JoopJoop?</span>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-white">
                  조항줍줍만의 차별점
                </h2>
              </div>
              <p className="text-slate-400 max-w-md text-sm md:text-base">
                기존의 단순 텍스트 뷰어와는 다릅니다. <br/>
                법률 AI 기술로 당신의 권리를 확실하게 지켜드립니다.
              </p>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: "위험도 색상 표시", desc: "Red, Orange, Yellow로 직관적인 위험 수준 확인" },
              { icon: CheckCircle2, title: "쉬운 우리말 해설", desc: "법알못도 1분이면 이해하는 쉽고 친절한 설명" },
              { icon: FileText, title: "실제 판례 연동", desc: "데이터에 기반한 정확하고 신뢰할 수 있는 분석" },
              { icon: UserCheck, title: "전문가 연결", desc: "심각한 문제는 검증된 노무사/변호사와 상담 가능" }
            ].map((feature, idx) => (
              <Reveal key={idx} delay={idx * 100}>
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl hover:bg-slate-800 transition-colors">
                  <div className="w-10 h-10 bg-teal-900/50 rounded-lg flex items-center justify-center mb-4 text-teal-400">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-lg mb-2">{feature.title}</h4>
                  <p className="text-slate-400 text-sm">{feature.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServiceIntroSection;