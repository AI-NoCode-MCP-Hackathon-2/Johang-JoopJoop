import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import Reveal from './Reveal';
import { Page } from '../App';

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}

interface FAQSectionProps {
  onNavigate?: (page: Page) => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className={`group bg-[#FDFCF8] rounded-2xl border ${isOpen ? 'border-teal-200 shadow-md bg-white' : 'border-slate-100'} overflow-hidden transition-all duration-300 hover:border-teal-100`}>
      <button 
        onClick={onClick}
        className="flex items-center justify-between w-full p-6 text-left cursor-pointer focus:outline-none"
      >
        <span className={`font-bold text-lg pr-8 transition-colors ${isOpen ? 'text-teal-800' : 'text-slate-900 group-hover:text-teal-700'}`}>
          {question}
        </span>
        <span className={`flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          {isOpen ? (
            <Minus className="w-5 h-5 text-teal-600" />
          ) : (
            <Plus className="w-5 h-5 text-slate-400 group-hover:text-teal-600" />
          )}
        </span>
      </button>
      <div 
        className={`px-6 text-slate-600 leading-relaxed transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        {answer}
      </div>
    </div>
  );
};

const FAQSection: React.FC<FAQSectionProps> = ({ onNavigate }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "법률 자문을 완전히 대신해 주나요?",
      answer: "아닙니다. 조항줍줍은 '사전 경고' 및 '1차 검토'를 위한 보조 도구입니다. 법적 효력이 있는 확정적 자문은 아니며, 복잡한 사안이나 실제 분쟁 발생 시에는 반드시 전문가(노무사, 변호사)의 도움을 받으셔야 합니다. 필요 시 전문가 연결 기능을 활용해 보세요."
    },
    {
      question: "어떤 계약서를 올릴 수 있나요?",
      answer: "표준근로계약서, 아르바이트(단시간) 근로계약서, 연봉계약서, 인턴 계약서 등을 분석할 수 있습니다. JPG, PNG 등의 이미지 파일이나 PDF 파일, 혹은 텍스트를 직접 복사해서 입력할 수도 있습니다."
    },
    {
      question: "정확도는 어느 정도인가요?",
      answer: "근로기준법에 명시된 필수 기재 사항 누락이나 위법 소지가 명확한 조항(예: 최저임금 미달, 불법 위약금 설정 등)은 매우 높은 정확도로 탐지합니다. 다만 특수한 직종의 비정형 계약은 맥락 파악에 한계가 있을 수 있습니다."
    },
    {
      question: "개인정보는 안전하게 보호되나요?",
      answer: "물론입니다. 업로드된 계약서 내의 이름, 주민등록번호, 주소, 연락처 등 민감한 개인정보는 분석 시작과 동시에 자동으로 마스킹(가림) 처리됩니다. 분석이 완료된 후 데이터는 서버에 저장되지 않고 즉시 파기됩니다."
    },
    {
      question: "분석 결과를 어떻게 활용하면 좋을까요?",
      answer: "분석 리포트에서 '위험(Red)'이나 '주의(Orange)'로 표시된 조항을 확인하고, 서명하기 전에 고용주에게 해당 내용의 수정이나 설명을 요청하는 자료로 활용하세요. 3줄 요약 기능을 통해 전체적인 유불리를 파악하기 좋습니다."
    },
    {
      question: "서비스를 이용하려면 꼭 회원가입이 필요한가요?",
      answer: "네, 조항줍줍은 로그인 후 이용하실 수 있습니다. 회원가입을 통해 하루 남은 점검 횟수와 과거 분석 이력을 안전하게 관리하고, 나중에 다시 접속하셨을 때도 이전 결과를 이어서 확인하실 수 있도록 돕기 위함입니다."
    },
    {
      question: "하루 5회 점검 제한은 어떻게 적용되나요?",
      answer: "기본 플랜에서는 하루 기준 5회까지 계약서 점검이 가능합니다. 남은 점검 횟수는 사전 점검 화면 상단과 마이페이지에서 모두 확인하실 수 있습니다. 제한 횟수를 초과하면 현재는 추가 점검이 제한되며, 요금제 페이지에서 향후 제공될 유료 플랜 방향을 미리 확인하실 수 있습니다."
    },
    {
      question: "내 계약서 분석 이력은 어디에서 확인할 수 있나요?",
      answer: "로그인 후 우측 상단 프로필 메뉴에서 마이페이지로 이동하시면 최근에 점검한 계약서 목록과 각 분석의 위험도 요약 정보를 확인하실 수 있습니다. 동일 계정으로 로그인하셨을 때에만 본인의 이력이 표시됩니다."
    },
    {
      question: "챗봇 기능과 사전 점검 결과는 어떤 차이가 있나요?",
      answer: "사전 점검 기능은 실제 계약서를 업로드한 뒤 조항별 위험도와 3줄 요약을 제공하는 기능입니다. 챗봇은 업로드 없이도 근로계약·노동 관련 개념이나 일반적인 궁금증을 질문하실 수 있는 Q&A 도우미입니다. 두 기능 모두 법률 자문을 대신하지 않으며, 중요한 결정 전에는 반드시 전문가와 상의해 주세요."
    },
    {
      question: "전문가 연결 서비스는 어떻게 이용하면 되나요?",
      answer: "상세한 상담이 필요하신 경우 '전문가 연결' 페이지에서 제휴 노무사·변호사 리스트와 고용노동부 등 공공기관 안내를 확인하실 수 있습니다. 각 카드의 '연결하기' 버튼을 누르시면 해당 전문가 또는 기관의 공식 채널로 이동하며, 실제 상담 과정에서 발생하는 비용과 책임은 조항줍줍이 아닌 해당 기관·전문가와 개별적으로 협의해 주셔야 합니다."
    },
    {
      question: "요금제 페이지에 나와 있는 금액은 실제로 결제가 되는 건가요?",
      answer: "현재 서비스는 데모 버전으로, 요금제 페이지에 표시된 금액과 옵션은 향후 정식 서비스 출시를 위한 예시입니다. 지금은 실제 결제가 이루어지지 않으며, 결제가 필요한 기능이 도입될 경우 별도의 고지와 동의 절차를 거친 뒤에 적용될 예정입니다."
    }
  ];

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleContactClick = () => {
    if (onNavigate) {
      onNavigate('contact');
    } else {
      // fallback: 그냥 페이지 맨 아래로 스크롤
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
        <Reveal>
          <div className="text-center mb-16">
            <span className="text-teal-600 font-bold tracking-wide text-sm uppercase mb-2 block">FAQ</span>
            <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">
              자주 묻는 질문
            </h2>
            <p className="text-slate-500">서비스 이용에 대해 궁금한 점을 확인해보세요.</p>
          </div>
        </Reveal>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Reveal key={index} delay={index * 100}>
              <FAQItem 
                question={faq.question} 
                answer={faq.answer} 
                isOpen={openIndex === index}
                onClick={() => handleToggle(index)}
              />
            </Reveal>
          ))}
        </div>

        {/* 문의하기 CTA */}
        <div className="mt-12 text-center">
          <p className="text-sm text-slate-500 mb-3">
            원하시는 답변이 없으신가요? 조금 더 구체적인 상황이라면 문의하기를 통해 말씀해 주세요.
          </p>
          <button
            type="button"
            onClick={handleContactClick}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold shadow-md hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-lg transition-all"
          >
            문의하기 페이지로 이동
          </button>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;