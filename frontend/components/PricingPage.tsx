import React from 'react';
import { Check, Crown, Zap, CreditCard, HelpCircle } from 'lucide-react';
import Reveal from './Reveal';

const PricingPage: React.FC = () => {
  const plans = [
    {
      name: 'Free',
      price: '₩0',
      period: '/월',
      tag: '현재 이용 중',
      description: '가볍게 시작하는 근로계약서 점검',
      features: [
        '하루 5회 AI 계약서 점검',
        '위험 조항 색상 표시',
        '쉬운 우리말 해설 제공',
        '기본 FAQ·챗봇 이용'
      ],
      recommended: false,
      buttonText: '현재 이용 중',
      buttonStyle: 'bg-slate-100 text-slate-500 cursor-default'
    },
    {
      name: 'Pro 구독',
      price: '₩9,900',
      period: '/월 (예시)',
      tag: '준비 중',
      description: '프리랜서 및 헤비 유저를 위한 플랜',
      features: [
        '월 100회 넉넉한 점검 한도',
        '우선 분석 처리 (대기 시간 단축)',
        '고급 리포트 기능 (PDF 다운로드)',
        '이메일 기반 1:1 문의 지원'
      ],
      recommended: true,
      buttonText: '알림 받기 (준비 중)',
      buttonStyle: 'bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-200'
    },
    {
      name: '회차 충전',
      price: '₩1,000~',
      period: '/10회',
      tag: '준비 중',
      description: '필요할 때만 충전해서 사용하는 옵션',
      features: [
        '10회 / 30회 / 50회 패키지 선택',
        '유효 기간 내 자유롭게 사용',
        '무료 플랜과 병행 사용 가능',
        '팀·동아리 단체 구매 가능'
      ],
      recommended: false,
      buttonText: '충전하기 (준비 중)',
      buttonStyle: 'bg-slate-900 text-white hover:bg-slate-800'
    }
  ];

  const handlePlanClick = () => {
    alert("현재는 데모 버전입니다. 실제 결제 기능은 연결되어 있지 않습니다.");
  };

  return (
    <section className="py-24 bg-[#FDFCF8] min-h-screen">
      <div className="container mx-auto px-6 lg:px-12 max-w-6xl space-y-16">

        {/* Header Area */}
        <Reveal>
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-teal-600 font-bold tracking-wide text-sm uppercase mb-2 block">Plans</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4 break-keep">
              요금제 및 이용 옵션
            </h2>
            <div className="flex flex-col items-center gap-2">
              <p className="text-slate-600 text-lg leading-relaxed break-keep">
                조항줍줍은 기본적으로 하루 5회까지 무료로 점검을 제공합니다. <br className="hidden md:block" />
                더 많은 계약서 점검이 필요하신가요? 합리적인 플랜을 준비 중입니다.
              </p>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mt-2">
                데모 버전 · 실제 결제 미연동
              </span>
            </div>
          </div>
        </Reveal>

        {/* Pricing Cards */}
        <div className="grid gap-6 md:grid-cols-3 items-start">
          {plans.map((plan, idx) => (
            <Reveal key={idx} delay={idx * 100}>
              <div className={`relative bg-white rounded-3xl p-8 flex flex-col h-full transition-all duration-300 ${plan.recommended ? 'border-2 border-teal-500 shadow-xl scale-105 z-10' : 'border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1'}`}>
                {plan.recommended && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-teal-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm">
                    Recommended
                  </div>
                )}

                <div className="mb-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                    {plan.tag && (
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${plan.tag === '현재 이용 중' ? 'bg-slate-100 text-slate-500' : 'bg-teal-50 text-teal-700'}`}>
                        {plan.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mb-4 min-h-[40px]">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                    <span className="text-sm text-slate-400 font-medium">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3 text-sm text-slate-600">
                      <div className="bg-teal-50 p-1 rounded-full text-teal-600 flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={handlePlanClick}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 ${plan.buttonStyle}`}
                >
                  {plan.buttonText}
                </button>
              </div>
            </Reveal>
          ))}
        </div>

        {/* FAQ Section */}
        <Reveal delay={300}>
          <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <HelpCircle className="w-6 h-6 text-slate-400" />
              <h3 className="text-xl font-bold text-slate-900">자주 묻는 질문</h3>
            </div>
            <div className="space-y-6 divide-y divide-slate-100">
              <div className="pt-4 first:pt-0">
                <h4 className="font-bold text-slate-800 mb-2">Q. 지금 바로 결제해서 사용할 수 있나요?</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  A. 아닙니다. 현재는 해커톤/베타 단계로 실제 결제 기능은 연동되어 있지 않습니다. 이 페이지는 향후 서비스 확장 시 제공될 요금제의 예시 화면입니다.
                </p>
              </div>
              <div className="pt-4">
                <h4 className="font-bold text-slate-800 mb-2">Q. 무료 플랜은 계속 사용할 수 있나요?</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  A. 네, 서비스 정책이 변경되지 않는 한, 하루 5회 무료 점검은 기본적으로 계속 제공할 예정입니다. 더 많은 분들이 안전하게 근로계약을 맺을 수 있도록 돕는 것이 조항줍줍의 목표입니다.
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Footer Disclaimer */}
        <div className="mt-8 text-xs text-slate-400 leading-relaxed border-t border-slate-200 pt-6 text-center">
          * 현재 화면에 표시되는 모든 요금제와 가격 정보는 예시이며, 실제 서비스 출시 시점에 변경될 수 있습니다. <br className="hidden sm:block" />
          또한, 이 데모에서는 실제 결제 기능이 구현되어 있지 않습니다.
        </div>

      </div>
    </section>
  );
};

export default PricingPage;
