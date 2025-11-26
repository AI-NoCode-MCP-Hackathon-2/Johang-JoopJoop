import React from 'react';
import { Shield, UserCheck, Briefcase, Landmark, ExternalLink, ArrowRight } from 'lucide-react';
import Reveal from './Reveal';

const ExpertSupportPage: React.FC = () => {
  const experts = [
    {
      id: 1,
      name: '김현수 노무사',
      icon: <UserCheck className="w-6 h-6" />,
      specialties: ['알바·단기 근로계약', '임금체불', '주휴수당'],
    },
    {
      id: 2,
      name: '이정민 변호사',
      icon: <Briefcase className="w-6 h-6" />,
      specialties: ['근로계약 분쟁', '부당해고', '손해배상 청구'],
    },
    {
      id: 3,
      name: '박서연 노무사',
      icon: <UserCheck className="w-6 h-6" />,
      specialties: ['인사·노무 관리', '취업규칙', '직장 내 괴롭힘'],
    },
  ];

  const institutions = [
    {
      id: 1,
      name: '고용노동부 고객상담센터',
      contact: '국번없이 1350',
      description: '근로기준, 최저임금, 임금체불 등 노동 관련 상담',
      url: 'https://www.moel.go.kr',
    },
    {
      id: 2,
      name: '고용노동부 청년 정책',
      contact: '전화: 1350',
      description: '청년 일자리 정책 및 취업 지원 안내',
      url: 'https://www.moel.go.kr/policy/policyinfo/young/list.do',
    },
    {
      id: 3,
      name: '국민신문고',
      contact: '온라인 민원 접수',
      description: '노동 관련 민원·신고 접수',
      url: 'https://www.epeople.go.kr',
    },
  ];

  return (
    <section className="py-24 bg-[#FDFCF8] min-h-screen">
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
        {/* Header */}
        <Reveal>
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-display font-bold text-slate-900 mb-4">
              전문가 연결 & 공공기관 안내
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              근로계약 관련 전문적인 상담이 필요하신가요?
              <br />
              노무사·변호사 연결 서비스 및 공공기관 안내를 제공합니다.
            </p>
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mt-4 inline-block">
              실제 상담 서비스는 별도 비용이 발생할 수 있습니다.
            </p>
          </div>
        </Reveal>

        {/* Expert Section */}
        <Reveal delay={100}>
          <div className="mb-20">
            <h2 className="text-3xl font-display font-bold text-slate-900 mb-8 text-center">
              전문가 상담 서비스
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {experts.map((expert, idx) => (
                <Reveal key={expert.id} delay={100 + idx * 50}>
                  <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-lg transition-shadow h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-700">
                        {expert.icon}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">{expert.name}</h3>
                    </div>

                    <div className="mb-6 flex-1">
                      <p className="text-sm font-semibold text-slate-700 mb-3">전문 분야</p>
                      <ul className="space-y-2">
                        {expert.specialties.map((specialty, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-1.5 flex-shrink-0"></span>
                            <span>{specialty}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button className="w-full bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                      연결하기
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Public Institution Section */}
        <Reveal delay={200}>
          <div className="mb-16">
            <h2 className="text-3xl font-display font-bold text-slate-900 mb-8 text-center">
              공공기관 안내
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {institutions.map((institution, idx) => (
                <Reveal key={institution.id} delay={200 + idx * 50}>
                  <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-lg transition-shadow h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700">
                        <Landmark className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 leading-tight">
                        {institution.name}
                      </h3>
                    </div>

                    <div className="mb-6 flex-1">
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-slate-700 mb-1">연락처</p>
                        <p className="text-base text-teal-700 font-semibold">{institution.contact}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-1">제공 서비스</p>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {institution.description}
                        </p>
                      </div>
                    </div>

                    <a
                      href={institution.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      사이트 방문
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Disclaimer Footer */}
        <Reveal delay={300}>
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-slate-600" />
              <h3 className="text-lg font-bold text-slate-900">안내사항</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed max-w-3xl mx-auto">
              본 서비스는 외부 전문가 및 공공기관 연결을 위한 안내 페이지입니다.
              <br />
              실제 상담 및 법률 서비스 이용 시 별도 비용이 발생할 수 있으며,
              <br />
              조항줍줍은 외부 서비스 이용에 따른 법적 책임을 지지 않습니다.
              <br />
              <span className="text-amber-700 font-semibold mt-2 inline-block">
                정확한 상담을 위해서는 반드시 전문가와 직접 상담하시기 바랍니다.
              </span>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default ExpertSupportPage;
