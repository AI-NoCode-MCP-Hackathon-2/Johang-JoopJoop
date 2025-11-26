import React, { useState } from 'react';
import { Mail, MessageSquare, Send, Clock, AlertCircle } from 'lucide-react';
import Reveal from './Reveal';

const ContactPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
    }, 1500);
  };

  return (
    <section className="py-24 bg-white min-h-screen">
      <div className="container mx-auto px-6 lg:px-12 max-w-5xl">
        <Reveal>
          <div className="text-center mb-16">
            <span className="text-teal-600 font-bold tracking-wide text-sm uppercase mb-2 block">Contact Us</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">
              문의하기
            </h2>
            <p className="text-slate-500 text-lg">
              궁금한 점이 있으시거나 제안하고 싶은 내용이 있다면 언제든 편하게 말씀해 주세요.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left: Contact Form */}
          <Reveal delay={100} direction="right">
            <div className="bg-[#FDFCF8] rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
              {isSent ? (
                <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-500">
                  <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-6">
                    <Send className="w-8 h-8 text-teal-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">전송 완료!</h3>
                  <p className="text-slate-600 mb-8">
                    소중한 의견 감사합니다. <br/>
                    빠른 시일 내에 답변드리겠습니다.
                  </p>
                  <button 
                    onClick={() => setIsSent(false)}
                    className="text-teal-600 font-bold hover:underline"
                  >
                    추가 문의하기
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">이름</label>
                    <input 
                      type="text" 
                      required
                      placeholder="홍길동"
                      className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">이메일 주소</label>
                    <input 
                      type="email" 
                      required
                      placeholder="example@email.com"
                      className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">문의 유형</label>
                    <select className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow cursor-pointer">
                      <option>서비스 이용 문의</option>
                      <option>기능 제안</option>
                      <option>오류·버그 신고</option>
                      <option>제휴 문의</option>
                      <option>기타</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">문의 내용</label>
                    <textarea 
                      required
                      placeholder="문의하실 내용을 자세히 적어주세요."
                      className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow min-h-[140px] resize-none"
                    ></textarea>
                  </div>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`}
                  >
                    {isSubmitting ? '전송 중...' : '보내기'}
                    {!isSubmitting && <Send className="w-4 h-4" />}
                  </button>
                </form>
              )}
            </div>
          </Reveal>

          {/* Right: Info Card */}
          <Reveal delay={200} direction="left">
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="bg-teal-50 p-3 rounded-xl">
                    <Clock className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">예상 답변 시간</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      보통 영업일 기준 <span className="font-bold text-teal-700">1~2일 이내</span>에 답변을 드리고 있습니다. 주말이나 공휴일에는 답변이 조금 늦어질 수 있는 점 양해 부탁드립니다.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="bg-orange-50 p-3 rounded-xl">
                    <AlertCircle className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">문의 전 확인해주세요</h3>
                    <ul className="text-slate-600 text-sm space-y-2 list-disc list-inside">
                      <li>
                        본 서비스는 AI 사전 점검 도구입니다. 구체적인 법적 분쟁 해결을 위한 자문은 전문가 상담을 권장해 드립니다.
                      </li>
                      <li>
                        주민등록번호, 비밀번호 등 민감한 개인정보는 문의 내용에 절대 포함하지 말아 주세요.
                      </li>
                      <li>
                        서비스 개선을 위한 따끔한 피드백이나 새로운 기능 제안은 언제나 환영합니다!
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                <div className="flex items-center gap-3 mb-2">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <span className="font-bold text-slate-700">이메일 문의</span>
                </div>
                <a href="mailto:contact@johangjoopjoop.com" className="text-teal-600 font-bold hover:underline">
                  contact@johangjoopjoop.com
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default ContactPage;