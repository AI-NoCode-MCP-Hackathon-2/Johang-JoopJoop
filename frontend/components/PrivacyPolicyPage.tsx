import React from 'react';
import Reveal from './Reveal';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <section className="py-24 bg-white min-h-screen">
      <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
        <Reveal>
          <div className="mb-12 border-b border-slate-100 pb-8">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">
              개인정보처리방침
            </h2>
            <p className="text-slate-600 leading-relaxed">
              조항줍줍(이하 "서비스")은 이용자의 개인정보를 소중히 다루며, 관련 법령을 준수하고 있습니다. <br className="hidden md:block"/>
              본 방침은 서비스 이용 시 수집되는 개인정보의 항목, 이용 목적, 보관 및 파기 절차 등을 안내합니다.
            </p>
          </div>

          <div className="space-y-8">
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm">1</span>
                수집하는 개인정보 항목
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                서비스 제공을 위해 필요한 최소한의 개인정보만을 수집합니다.
              </p>
              <ul className="list-disc list-inside text-slate-600 text-sm space-y-2 pl-2">
                <li><strong>문의 시:</strong> 이름, 이메일 주소, 문의 내용</li>
                <li><strong>서비스 이용 시 (자동 수집):</strong> 접속 로그, 쿠키, IP 주소, 이용 기록 등</li>
              </ul>
            </div>

            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm">2</span>
                개인정보의 이용 목적
              </h3>
              <ul className="list-disc list-inside text-slate-600 text-sm space-y-2 pl-2">
                <li>서비스 제공 및 기능 개선</li>
                <li>고객 문의 응대 및 불만 처리</li>
                <li>법령 및 이용약관 위반에 대한 대응</li>
                <li>통계 분석을 통한 서비스 고도화</li>
              </ul>
            </div>

            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm">3</span>
                보관 및 파기
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                이용자의 개인정보는 원칙적으로 이용 목적이 달성되면 지체 없이 파기합니다. <br/>
                특히, 업로드해주신 계약서 파일은 분석 완료 직후 서버에서 영구 삭제됩니다.
              </p>
              <ul className="list-disc list-inside text-slate-600 text-sm space-y-2 pl-2">
                <li><strong>파기 절차:</strong> 목적이 달성된 정보는 내부 방침 및 관련 법령에 따라 일정 기간 저장 후 파기하거나 즉시 파기합니다.</li>
                <li><strong>파기 방법:</strong> 전자적 파일 형태는 복구할 수 없는 기술적 방법을 사용하여 삭제합니다.</li>
              </ul>
            </div>

            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm">4</span>
                이용자의 권리
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                이용자는 언제든지 자신의 개인정보에 대해 열람, 정정, 삭제, 처리정지를 요구할 수 있습니다. <br/>
                요청이 필요하신 경우 아래 문의처로 연락 주시면 신속하게 조치하겠습니다.
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm">5</span>
                문의처
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-2">
                개인정보 관련 문의사항은 아래로 연락해 주시기 바랍니다.
              </p>
              <div className="font-medium text-slate-800 text-sm">
                이메일: <span className="text-teal-600">contact@johangjoopjoop.com</span>
              </div>
              <div className="text-slate-500 text-xs mt-1">
                (응대 시간: 평일 10:00 ~ 18:00)
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default PrivacyPolicyPage;