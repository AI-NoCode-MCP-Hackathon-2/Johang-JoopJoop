import React from 'react';
import { Highlighter, MessageCircle, BookOpen, Users, Lock, Sparkles } from 'lucide-react';
import Reveal from './Reveal';

const FeatureSection: React.FC = () => {
  const features = [
    { 
      icon: Highlighter, 
      title: "위험 조항 색상 표시", 
      desc: "위험 정도에 따라 빨강, 주황, 노랑으로 하이라이팅하여 직관적으로 보여줍니다." 
    },
    { 
      icon: MessageCircle, 
      title: "쉬운 우리말 설명", 
      desc: "\"갑\", \"을\", \"귀책사유\" 등 어려운 법률 용어를 일상 언어로 쉽게 풀어서 설명합니다." 
    },
    { 
      icon: BookOpen, 
      title: "유사 판례·사례 안내", 
      desc: "해당 조항이 문제가 되었던 실제 법적 사례나 판례를 찾아 근거를 제시합니다." 
    },
    { 
      icon: Users, 
      title: "전문가 상담 연계", 
      desc: "심각한 독소 조항이 발견되면, 제휴된 노무사/변호사와 빠르게 연결해 드립니다." 
    },
    { 
      icon: Lock, 
      title: "민감정보 자동 마스킹", 
      desc: "이름, 주소, 주민번호 등 개인정보는 업로드 즉시 자동으로 가림 처리됩니다." 
    },
    { 
      icon: Sparkles, 
      title: "3줄 요약 리포트", 
      desc: "긴 계약서를 다 읽지 않아도 핵심 내용과 주의사항을 3줄로 요약해 드립니다." 
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-12">
        <Reveal>
          <div className="text-center mb-16">
            <span className="text-teal-600 font-bold tracking-wide text-sm uppercase mb-2 block">Key Features</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-6 break-keep">
              법률 전문가가 옆에 있는 것처럼 <br className="hidden md:block" />
              든든하게 지켜드립니다.
            </h2>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <Reveal key={idx} delay={idx * 100}>
              <div className="h-full p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-100/50 hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-5 text-teal-600 group-hover:scale-110 group-hover:text-teal-700 transition-all">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-3">{feature.title}</h4>
                <p className="text-slate-600 leading-relaxed text-sm break-keep">
                  {feature.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;