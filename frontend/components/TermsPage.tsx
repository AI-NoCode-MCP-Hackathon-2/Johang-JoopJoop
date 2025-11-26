import React from 'react';
import Reveal from './Reveal';

const TermsPage: React.FC = () => {
  return (
    <section className="py-24 bg-[#FDFCF8] min-h-screen">
      <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
        <Reveal>
          <div className="mb-12 border-b border-slate-200 pb-8">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">
              이용약관
            </h2>
            <p className="text-slate-600 leading-relaxed">
              조항줍줍 서비스를 이용해 주셔서 감사합니다. <br className="hidden md:block"/>
              본 약관은 서비스 이용과 관련된 기본적인 권리, 의무 및 책임사항을 안내드립니다.
            </p>
          </div>

          <div className="space-y-12">
            {[
              {
                title: "제1조 (목적)",
                content: "본 약관은 조항줍줍(이하 \"회사\")이 제공하는 근로계약 AI 사전 점검 서비스(이하 \"서비스\")의 이용조건 및 절차, 이용자와 회사의 권리, 의무, 책임사항을 규정함을 목적으로 합니다."
              },
              {
                title: "제2조 (정의)",
                content: "\"이용자\"란 본 약관에 따라 서비스를 이용하는 회원을 말합니다. \"서비스\"란 회사가 제공하는 AI 기반 계약서 분석 및 관련 정보를 의미합니다."
              },
              {
                title: "제3조 (약관의 효력 및 변경)",
                content: "본 약관은 서비스 화면에 게시함으로써 효력이 발생합니다. 회사는 합리적인 사유가 발생할 경우 관련 법령에 위배되지 않는 범위 내에서 약관을 변경할 수 있으며, 변경된 약관은 공지사항을 통해 안내합니다."
              },
              {
                title: "제4조 (서비스의 제공)",
                content: "회사는 이용자에게 계약서 분석, 위험 조항 안내, 법률 정보 제공 등의 서비스를 제공합니다. 단, 제공되는 정보는 법적 자문을 대체하지 않으며 참고용 자료로만 활용되어야 합니다."
              },
              {
                title: "제5조 (회원의 의무)",
                content: "이용자는 서비스를 이용함에 있어 타인의 정보를 도용하거나 위법한 목적으로 서비스를 이용해서는 안 됩니다. 또한 회사의 지식재산권을 침해하거나 서비스 운영을 방해하는 행위를 금지합니다."
              },
              {
                title: "제6조 (서비스의 제한 및 중단)",
                content: "회사는 시스템 점검, 교체, 고장, 통신 두절 등의 사유가 발생한 경우 서비스의 제공을 일시적으로 중단할 수 있습니다. 이 경우 회사는 사전에 공지함을 원칙으로 합니다."
              },
              {
                title: "제7조 (책임의 한계)",
                content: "회사가 제공하는 분석 결과는 AI 알고리즘에 기반한 예측 정보이므로, 그 정확성이나 완전성을 보장하지 않습니다. 이용자가 서비스 정보를 바탕으로 내린 결정에 대한 법적 책임은 이용자 본인에게 있습니다."
              },
              {
                title: "제8조 (분쟁 해결 및 관할)",
                content: "서비스 이용과 관련하여 발생한 분쟁에 대해서는 상호 원만히 해결하도록 노력하며, 소송이 제기될 경우 회사의 본점 소재지를 관할하는 법원을 전속 관할법원으로 합니다."
              }
            ].map((term, index) => (
              <div key={index} className="border-l-4 border-slate-200 pl-6 hover:border-teal-400 transition-colors duration-300">
                <h3 className="text-lg font-bold text-slate-900 mb-2">{term.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed text-justify">
                  {term.content}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center text-xs text-slate-400">
             <p>공고일자: 2025년 11월 26일 / 시행일자: 2025년 11월 26일</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default TermsPage;