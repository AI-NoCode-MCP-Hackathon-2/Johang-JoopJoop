import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Info, AlertCircle, HelpCircle, MessageSquare } from 'lucide-react';
import Reveal from './Reveal';

type Role = 'user' | 'bot';

interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
}

const ChatbotPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'bot',
      content: "안녕하세요! 조항줍줍 챗봇입니다. 근로계약서나 노동 관련 궁금한 점이 있으신가요? 무엇이든 물어보세요.",
      timestamp: Date.now(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();

    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    // Mock Response Logic
    setTimeout(() => {
      let responseText = "좋은 질문입니다. 현재 데모 버전이라 실제 계약서 내용을 직접 확인해 드릴 수는 없지만, 일반적인 내용을 안내해 드릴게요.";

      if (trimmed.includes("주휴수당")) {
        responseText = "주휴수당이란 1주 동안 규정된 근무일수를 개근한 근로자에게 지급되는 유급휴일에 대한 수당입니다. 주 15시간 이상 근무 시 반드시 지급되어야 합니다.";
      } else if (trimmed.includes("포괄임금")) {
        responseText = "포괄임금제란 실제 근로시간과 관계없이 연장·야간·휴일근로수당 등을 급여에 미리 포함하여 지급하는 계약 형태입니다. 이 경우에도 실제 근로시간에 따른 수당 합계가 포괄임금보다 많다면 차액을 지급해야 합니다.";
      } else if (trimmed.includes("수습") || trimmed.includes("수습기간")) {
        responseText = "수습기간은 근로자의 업무 적격성을 판단하기 위한 기간으로, 보통 3개월 이내로 설정합니다. 1년 이상 계약 시 수습기간(3개월 이내) 동안 최저임금의 90% 지급이 가능하지만, 1년 미만 계약이라면 100%를 지급해야 합니다.";
      } else if (trimmed.includes("퇴직금")) {
        responseText = "퇴직금은 1년 이상 계속 근로한 근로자가 퇴직할 때 지급받는 급여입니다. 주 15시간 이상 근무해야 하며, 퇴직 전 3개월간의 평균임금을 기준으로 산정됩니다.";
      } else if (trimmed.includes("해고") || trimmed.includes("권고사직")) {
        responseText = "사용자는 정당한 이유 없이 근로자를 해고할 수 없으며, 해고 시에는 30일 전에 예고하거나 30일분 이상의 통상임금을 지급해야 합니다. 부당해고가 의심된다면 노동위원회에 구제 신청을 할 수 있습니다.";
      }

      responseText += "\n\n(※ 본 내용은 참고용이며, 정확한 판단을 위해서는 노무사·변호사 등 전문가와 상의해 주세요.)";

      const newBotMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: responseText,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, newBotMsg]);
      setIsTyping(false);
    }, 800); // Simulate delay
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <section className="py-24 bg-[#FDFCF8] min-h-screen">
      <div className="container mx-auto px-6 lg:px-12 max-w-6xl grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)]">

        {/* Left Column: Explanation Guide */}
        <Reveal>
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm h-full flex flex-col">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full mb-4">
                <AlertCircle className="w-3 h-3" /> 데모 버전
              </div>
              <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">
                조항줍줍 챗봇
              </h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                근로계약서와 노동 관련 기본 개념을 쉽고 빠르게 물어보세요. <br className="hidden xl:block" />
                어려운 법률 용어도 친절하게 설명해 드립니다.
              </p>
            </div>

            <div className="space-y-4 mb-8 flex-1">
              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <Info className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-slate-700">
                  <strong className="block text-slate-900 mb-1">자주 묻는 질문 예시</strong>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li>"주휴수당은 언제 받을 수 있나요?"</li>
                    <li>"포괄임금제가 뭔가요?"</li>
                    <li>"수습기간 월급 90%가 맞나요?"</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <HelpCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-slate-700">
                  <strong className="block text-slate-900 mb-1">주의사항</strong>
                  <p className="text-slate-600 leading-relaxed">
                    이 챗봇은 일반적인 정보를 제공하는 안내용입니다. <br/>
                    개별적인 계약 검토나 법적 분쟁 해결을 위해서는 반드시 전문가의 자문을 받으셔야 합니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 text-xs text-slate-400 text-center">
              * AI 답변은 부정확할 수 있으며 법적 효력이 없습니다.
            </div>
          </div>
        </Reveal>

        {/* Right Column: Chat Interface */}
        <Reveal delay={100}>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-lg h-[600px] flex flex-col overflow-hidden">
            {/* Chat Header */}
            <div className="bg-slate-50/80 backdrop-blur-sm border-b border-slate-100 p-4 flex items-center gap-3 sticky top-0 z-10">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-700">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">조항줍줍 도우미</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-xs text-slate-500">답변 가능</span>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FDFCF8]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-teal-600 text-white rounded-tr-sm'
                      : 'bg-white border border-slate-100 text-slate-800 rounded-tl-sm'
                  }`}>
                    {msg.content.split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < msg.content.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100">
              <form
                onSubmit={handleSendMessage}
                className="flex items-end gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-all"
              >
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="궁금한 내용을 입력하세요..."
                  className="flex-1 bg-transparent border-none focus:ring-0 resize-none text-sm text-slate-800 placeholder:text-slate-400 min-h-[44px] max-h-32 py-3 px-2"
                  rows={1}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-0.5"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <p className="text-[10px] text-slate-400 text-center mt-2">
                Shift + Enter로 줄바꿈 가능
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default ChatbotPage;
