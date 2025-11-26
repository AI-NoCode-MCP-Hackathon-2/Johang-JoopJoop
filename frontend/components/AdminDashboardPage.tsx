import React, { useState, useEffect } from 'react';
import Reveal from './Reveal';
import { Users, FileText, AlertOctagon, BarChart3, Shield, Clock, Zap, TrendingUp, Eye, MousePointerClick, Activity, Loader2 } from 'lucide-react';
import api from '../utils/api';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  provider: string;
  remaining_checks_today: number;
  created_at: string;
}

interface AnalysisData {
  id: string;
  user_id: string;
  user_name: string;
  file_name: string;
  title: string;
  risk_level: 'low' | 'medium' | 'high';
  created_at: string;
}

interface ContactData {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  created_at: string;
}

interface StatsData {
  totalUsers: number;
  newUsersToday: number;
  totalAnalyses: number;
  analysesToday: number;
  openReports: number;
}

interface RiskStats {
  low: number;
  medium: number;
  high: number;
}

const AdminDashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [metrics, setMetrics] = useState<StatsData>({
    totalUsers: 0,
    newUsersToday: 0,
    totalAnalyses: 0,
    analysesToday: 0,
    openReports: 0,
  });

  const [users, setUsers] = useState<UserData[]>([]);
  const [analyses, setAnalyses] = useState<AnalysisData[]>([]);
  const [riskStats, setRiskStats] = useState<RiskStats>({ low: 0, medium: 0, high: 0 });
  const [contacts, setContacts] = useState<ContactData[]>([]);

  const apiUsageMetrics = {
    geminiApiCalls: 8542,
    geminiApiCallsToday: 42,
    geminiTokensUsed: 3254890,
    geminiTokensToday: 18450,
    estimatedMonthlyCost: 127.8,
    costToday: 4.2,
    avgResponseTime: 2.3,
    errorRate: 0.8,
  };

  const ga4Metrics = {
    activeUsers: 342,
    pageViews: 12840,
    avgSessionDuration: 4.8,
    bounceRate: 32.5,
    topPages: [
      { page: '/check', views: 4520, percentage: 35.2 },
      { page: '/', views: 3210, percentage: 25.0 },
      { page: '/why', views: 1890, percentage: 14.7 },
      { page: '/how', views: 1650, percentage: 12.8 },
      { page: '/features', views: 1570, percentage: 12.2 },
    ],
    deviceBreakdown: [
      { device: 'Mobile', users: 189, percentage: 55.3 },
      { device: 'Desktop', users: 121, percentage: 35.4 },
      { device: 'Tablet', users: 32, percentage: 9.3 },
    ],
  };

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statsRes, usersRes, analysesRes, contactsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users?limit=10'),
          api.get('/admin/analyses?limit=10'),
          api.get('/admin/contacts?limit=50'),
        ]);

        if (statsRes.data.success) {
          setMetrics(statsRes.data.data);
        }

        if (usersRes.data.success) {
          setUsers(usersRes.data.data.users);
        }

        if (analysesRes.data.success) {
          setAnalyses(analysesRes.data.data.analyses);
          setRiskStats(analysesRes.data.data.riskStats);
        }

        if (contactsRes.data.success) {
          setContacts(contactsRes.data.data.contacts);
        }
      } catch (err: any) {
        console.error('Admin data fetch error:', err);
        setError(err.response?.data?.message || '데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleStatusChange = async (id: string, newStatus: ContactData['status']) => {
    try {
      const res = await api.patch(`/admin/contacts/${id}/status`, { status: newStatus });
      if (res.data.success) {
        setContacts(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
      }
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <section className="py-24 bg-[#FDFCF8] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-slate-600">데이터를 불러오는 중...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-24 bg-[#FDFCF8] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertOctagon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-bold mb-2">오류가 발생했습니다</p>
          <p className="text-slate-600">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-[#FDFCF8] min-h-screen">
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl space-y-10">

        {/* Header */}
        <Reveal>
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-700">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-display font-bold text-slate-900">관리자 대시보드</h2>
              <p className="text-slate-500 mt-1">
                조항줍줍 서비스 운영을 위한 관리자 페이지입니다. 사용자 현황, 계약서 점검 이력, 신고·문의 내역을 확인하세요.
              </p>
            </div>
          </div>
        </Reveal>

        {/* Summary Metrics */}
        <Reveal delay={100}>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { label: "전체 가입자 수", value: metrics.totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "오늘 신규 가입", value: `+${metrics.newUsersToday}`, icon: UserIcon, color: "text-teal-600", bg: "bg-teal-50" },
              { label: "누적 분석 건수", value: metrics.totalAnalyses, icon: BarChart3, color: "text-indigo-600", bg: "bg-indigo-50" },
              { label: "오늘 분석 건수", value: metrics.analysesToday, icon: FileText, color: "text-orange-600", bg: "bg-orange-50" },
            ].map((metric, idx) => (
              <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${metric.bg} ${metric.color}`}>
                  <metric.icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">{metric.label}</div>
                  <div className="text-2xl font-black text-slate-900">{metric.value}</div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">

          {/* Recent Analyses */}
          <Reveal delay={200}>
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-slate-400" />
                  최근 계약서 점검 이력
                </h3>
                <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">실시간</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-400 uppercase bg-slate-50/50 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">ID</th>
                      <th className="px-4 py-3">사용자</th>
                      <th className="px-4 py-3">종류</th>
                      <th className="px-4 py-3">위험/주의</th>
                      <th className="px-4 py-3 rounded-tr-lg">일시</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {analyses.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-slate-500">{item.id.slice(0, 8)}</td>
                        <td className="px-4 py-3 font-bold text-slate-700">{item.user_name || '익명'}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs">{item.title || item.file_name}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            item.risk_level === 'high' ? 'bg-red-100 text-red-600' :
                            item.risk_level === 'medium' ? 'bg-orange-100 text-orange-600' :
                            'bg-green-100 text-green-600'
                          }`}>
                            {item.risk_level === 'high' ? '위험' : item.risk_level === 'medium' ? '주의' : '양호'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-xs">{formatDateTime(item.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>

          {/* User Management */}
          <Reveal delay={300}>
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm h-full">
               <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-slate-400" />
                  최근 가입 사용자
                </h3>
                <button className="text-xs font-bold text-teal-600 hover:underline">전체 보기</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-400 uppercase bg-slate-50/50 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">이름</th>
                      <th className="px-4 py-3">이메일</th>
                      <th className="px-4 py-3">권한</th>
                      <th className="px-4 py-3">가입일</th>
                      <th className="px-4 py-3 rounded-tr-lg">가입방식</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-700">{u.name}</td>
                        <td className="px-4 py-3 text-slate-500">{u.email}</td>
                        <td className="px-4 py-3">
                          {u.role === 'admin'
                            ? <span className="text-indigo-600 font-bold text-xs bg-indigo-50 px-2 py-1 rounded">ADMIN</span>
                            : <span className="text-slate-500 text-xs">USER</span>}
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-xs">{formatDate(u.created_at)}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-600">{u.provider}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>
        </div>

        {/* API Usage Metrics */}
        <Reveal delay={400}>
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Gemini API 사용량
              </h3>
              <span className="text-xs bg-amber-50 px-2 py-1 rounded text-amber-600 font-medium">실시간 모니터링</span>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                <div className="text-[10px] uppercase font-bold text-purple-600 mb-1">총 API 호출</div>
                <div className="text-2xl font-black text-purple-900">{apiUsageMetrics.geminiApiCalls.toLocaleString()}</div>
                <div className="text-xs text-purple-600 mt-1">오늘 +{apiUsageMetrics.geminiApiCallsToday}</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                <div className="text-[10px] uppercase font-bold text-blue-600 mb-1">사용 토큰</div>
                <div className="text-2xl font-black text-blue-900">{(apiUsageMetrics.geminiTokensUsed / 1000000).toFixed(2)}M</div>
                <div className="text-xs text-blue-600 mt-1">오늘 +{(apiUsageMetrics.geminiTokensToday / 1000).toFixed(1)}K</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                <div className="text-[10px] uppercase font-bold text-green-600 mb-1">월 예상 비용</div>
                <div className="text-2xl font-black text-green-900">${apiUsageMetrics.estimatedMonthlyCost}</div>
                <div className="text-xs text-green-600 mt-1">오늘 ${apiUsageMetrics.costToday}</div>
              </div>
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-xl border border-teal-200">
                <div className="text-[10px] uppercase font-bold text-teal-600 mb-1">평균 응답 시간</div>
                <div className="text-2xl font-black text-teal-900">{apiUsageMetrics.avgResponseTime}s</div>
                <div className="text-xs text-teal-600 mt-1">오류율 {apiUsageMetrics.errorRate}%</div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Activity className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-900 mb-1">API 상태</p>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Gemini 2.0 Flash 모델을 사용 중입니다. 현재 API 상태는 정상이며, 평균 응답 속도는 {apiUsageMetrics.avgResponseTime}초입니다.
                    오늘 {apiUsageMetrics.geminiApiCallsToday}건의 분석이 처리되었으며, {apiUsageMetrics.geminiTokensToday.toLocaleString()} 토큰이 사용되었습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* GA4 Analytics */}
        <Reveal delay={450}>
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Google Analytics 4 (GA4)
              </h3>
              <span className="text-xs bg-green-50 px-2 py-1 rounded text-green-600 font-medium">최근 7일</span>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-slate-500" />
                  <div className="text-[10px] uppercase font-bold text-slate-500">활성 사용자</div>
                </div>
                <div className="text-2xl font-black text-slate-900">{ga4Metrics.activeUsers}</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <MousePointerClick className="w-4 h-4 text-slate-500" />
                  <div className="text-[10px] uppercase font-bold text-slate-500">페이지뷰</div>
                </div>
                <div className="text-2xl font-black text-slate-900">{ga4Metrics.pageViews.toLocaleString()}</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <div className="text-[10px] uppercase font-bold text-slate-500">평균 세션</div>
                </div>
                <div className="text-2xl font-black text-slate-900">{ga4Metrics.avgSessionDuration}분</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-slate-500" />
                  <div className="text-[10px] uppercase font-bold text-slate-500">이탈률</div>
                </div>
                <div className="text-2xl font-black text-slate-900">{ga4Metrics.bounceRate}%</div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Top Pages */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                <h4 className="text-sm font-bold text-slate-700 mb-4">인기 페이지</h4>
                <div className="space-y-3">
                  {ga4Metrics.topPages.map((page, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-slate-700">{page.page}</span>
                        <span className="text-xs font-bold text-slate-500">{page.views.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-teal-400 to-teal-600 h-2 rounded-full transition-all"
                          style={{ width: `${page.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Device Breakdown */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                <h4 className="text-sm font-bold text-slate-700 mb-4">기기별 사용자</h4>
                <div className="space-y-4">
                  {ga4Metrics.deviceBreakdown.map((device, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          device.device === 'Mobile' ? 'bg-blue-100 text-blue-600' :
                          device.device === 'Desktop' ? 'bg-purple-100 text-purple-600' :
                          'bg-orange-100 text-orange-600'
                        }`}>
                          <span className="text-xs font-bold">{device.device.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-700">{device.device}</div>
                          <div className="text-xs text-slate-500">{device.percentage}%</div>
                        </div>
                      </div>
                      <div className="text-xl font-black text-slate-900">{device.users}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Reports Management */}
        <Reveal delay={500}>
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <AlertOctagon className="w-5 h-5 text-red-400" />
                  신고 및 문의 관리
                </h3>
                <span className="text-xs bg-red-50 px-2 py-1 rounded text-red-600 font-medium">
                  미처리 {contacts.filter(c => c.status === 'Open').length}건
                </span>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {contacts.map((contact) => (
                  <div key={contact.id} className="bg-[#FDFCF8] border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <span className="bg-slate-200 text-slate-600 px-2 py-1 rounded text-[10px] font-bold">{contact.subject}</span>
                      <span className="text-xs text-slate-400">{formatDate(contact.created_at)}</span>
                    </div>
                    <h4 className="font-bold text-slate-800 mb-1">{contact.name}</h4>
                    <p className="text-xs text-slate-500 mb-2">{contact.email}</p>
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2 h-10">{contact.message}</p>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        contact.status === 'Open' ? 'bg-red-100 text-red-600' :
                        contact.status === 'In Progress' ? 'bg-orange-100 text-orange-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {contact.status === 'Open' ? '열림' : contact.status === 'In Progress' ? '처리 중' : '완료'}
                      </span>
                      <select
                        value={contact.status}
                        onChange={(e) => handleStatusChange(contact.id, e.target.value as ContactData['status'])}
                        className="text-xs border border-slate-300 rounded-lg p-1 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      >
                        <option value="Open">열림</option>
                        <option value="In Progress">처리 중</option>
                        <option value="Resolved">완료</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
          </div>
        </Reveal>

        {/* Footer Notice */}
        <div className="text-center text-xs text-slate-400 mt-12 pt-8 border-t border-slate-200">
          데이터는 MySQL 데이터베이스에서 실시간으로 불러옵니다. (Gemini API 및 GA4 메트릭은 예시 데이터입니다.)
        </div>
      </div>
    </section>
  );
};

const UserIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export default AdminDashboardPage;
