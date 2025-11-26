import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Info, AlertCircle, HelpCircle } from 'lucide-react';
import Reveal from './Reveal';
import api from '../utils/api';

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
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (e?: React.FormEvent) => {
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

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'bot',
        content: msg.content,
      }));

      const response = await api.post('/chatbot', {
        message: trimmed,
        conversationHistory,
      });

      const newBotMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: response.data.data.message,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, newBotMsg]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: '죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
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
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-100 text-teal-800 text-xs font-bold rounded-full mb-4">
                <Bot className="w-3 h-3" /> AI 상담
              </div>
              <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">
                조항줍줍 챗봇
              </h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                근로계약서와 노동 관련 기본 개념을 쉽고 빠르게 물어보세요. <br className="hidden xl:block" />
                AI가 어려운 법률 용어도 친절하게 설명해 드립니다.
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
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FDFCF8]">
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
