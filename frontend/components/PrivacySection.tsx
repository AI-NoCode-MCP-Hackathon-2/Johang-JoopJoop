import React from 'react';
import { ShieldCheck, Lock, Eraser } from 'lucide-react';
import Reveal from './Reveal';

const PrivacySection: React.FC = () => {
  return (
    <section className="py-20 bg-[#FDFCF8] border-y border-slate-100">
      <div className="container mx-auto px-6 lg:px-12 text-center">
        <Reveal>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-6 hover:scale-110 transition-transform duration-300">
            <ShieldCheck className="w-8 h-8 text-teal-600" />
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 mb-4">
            개인정보는 절대 저장되지 않습니다.
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed">
            계약서에는 주민등록번호, 주소 등 민감한 정보가 포함되어 있죠. <br className="hidden md:block" />
            조항줍줍은 업로드 즉시 개인정보를 마스킹하며, 분석 후 원본 데이터는 즉시 파기됩니다.
          </p>
        </Reveal>

        <div className="flex flex-col md:flex-row justify-center gap-6">
          <Reveal delay={100} direction="left">
            <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-xl border border-slate-100 shadow-sm text-left hover:shadow-md hover:border-slate-200 transition-all duration-300">
              <div className="bg-slate-100 p-2 rounded-lg">
                <Eraser className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">자동 마스킹</div>
                <div className="text-xs text-slate-500">민감정보 식별 및 가림 처리</div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={200} direction="right">
            <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-xl border border-slate-100 shadow-sm text-left hover:shadow-md hover:border-slate-200 transition-all duration-300">
              <div className="bg-slate-100 p-2 rounded-lg">
                <Lock className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">즉시 데이터 파기</div>
                <div className="text-xs text-slate-500">분석 종료 후 서버에서 영구 삭제</div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default PrivacySection;