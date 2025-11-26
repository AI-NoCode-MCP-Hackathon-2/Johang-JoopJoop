import React from 'react';
import { AlertCircle, Clock, FileWarning, HelpCircle } from 'lucide-react';
import Reveal from './Reveal';

const ProblemSection: React.FC = () => {
  const problems = [
    {
      icon: <AlertCircle className="w-6 h-6 text-red-500" />,
      color: "bg-red-50",
      title: "숨겨진 독소 조항",
      desc: "수습기간 급여 삭감, 휴게시간 미보장 등 알바 계약서에 교묘하게 숨은 불리한 조건들을 찾기 어렵습니다."
    },
    {
      icon: <FileWarning className="w-6 h-6 text-orange-500" />,
      color: "bg-orange-50",
      title: "복잡하고 모호한 문구",
      desc: "연봉계약서의 포괄임금제, 수당 포함 여부 등 어려운 법률 용어 때문에 정확한 내 권리를 알기 힘듭니다."
    },
    {
      icon: <Clock className="w-6 h-6 text-slate-600" />,
      color: "bg-slate-100",
      title: "부족한 시간과 지식",
      desc: "계약서를 꼼꼼히 읽을 시간도 없고, 법률 지식도 부족해 당장 서명해야 하는 상황이 부담스럽습니다."
    },
    {
      icon: <HelpCircle className="w-6 h-6 text-teal-600" />,
      color: "bg-teal-50",
      title: "나중에 후회하는 경험",
      desc: "\"괜찮겠지\" 하고 서명했다가 나중에 부당한 대우를 받아도 계약서 때문에 대응하지 못할 수 있습니다."
    }
  ];

  return (
    <section className="py-24 bg-white relative">
      <div className="container mx-auto px-6 lg:px-12">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-teal-600 font-bold tracking-wide text-sm uppercase mb-2 block">Why do you need this?</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4 break-keep">
              왜 <span className="text-teal-700">조항줍줍</span>이 필요한가요?
            </h2>
            <p className="text-slate-500 text-lg break-keep leading-relaxed">
              법률 용어는 어렵고 물어볼 곳은 마땅치 않죠.<br className="hidden md:block" />
              하지만 서명하는 순간, 그 책임은 오롯이 나에게 있습니다.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((item, index) => (
            <Reveal key={index} delay={index * 100}>
              <div className="h-full bg-[#FDFCF8] p-8 rounded-3xl border border-slate-100 hover:shadow-xl hover:shadow-slate-100/50 hover:border-slate-200 hover:-translate-y-1 transition-all duration-300 group">
                <div className={`w-12 h-12 ${item.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3 font-display">
                  {item.title}
                </h3>
                <p className="text-slate-600 leading-relaxed break-keep text-sm">
                  {item.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;