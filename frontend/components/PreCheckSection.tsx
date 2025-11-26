import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle, ArrowRight, Lock, Crown, Zap, FileSearch, Shield, Filter } from 'lucide-react';
import Reveal from './Reveal';
import Loader from './Loader';
import { useAuth } from './AuthContext';
import { useAnalysisHistory } from './AnalysisHistoryContext';
import { Page } from '../App';
import MockContractCard, { ClauseResult, RiskLevel } from './MockContractCard';
import api from '../utils/api';

interface PreCheckSectionProps {
  onNavigate?: (page: Page) => void;
}

const MOCK_CLAUSE_RESULTS: ClauseResult[] = [
  {
    id: 'clause-1',
    title: '수습 기간 중 급여 삭감',
    originalText: '제5조 (임금) 수습기간 3개월 동안은 월 급여의 70%만을 지급한다. 단, 수습기간 종료 후에는 100%를 지급한다.',
    easyExplanation: '수습기간이라도 최저임금의 90% 이상은 지급해야 합니다. 또한 계약 기간이 1년 미만인 경우, 수습기간 급여를 깎을 수 없습니다. 단순히 "수습"이라는 이유로 70%만 지급하는 것은 위법 소지가 큽니다.',
    summaryBullets: [
      '1년 미만 계약 시 수습 감액 불가',
      '최저임금의 90% 미만 지급 불가',
      '단순 노무직은 수습 감액 적용 불가'
    ],
    riskLevel: 'RED',
    tags: ['수습기간', '임금삭감', '최저임금'],
    isKeyClause: true,
  },
  {
    id: 'clause-2',
    title: '포괄임금제 적용',
    originalText: '제6조 (근로시간 및 휴게) 연장근로, 야간근로, 휴일근로 수당은 월 급여에 모두 포함된 것으로 간주한다.',
    easyExplanation: '포괄임금제는 실제 일한 시간만큼 수당을 계산하지 않고 퉁쳐서 주는 방식입니다. 하지만 "모두 포함"이라고만 쓰고 구체적인 금액이나 시간이 명시되지 않으면 무효가 될 수 있습니다. 공짜 야근의 주범이 될 수 있으니 주의하세요.',
    summaryBullets: [
      '구체적인 시간/금액 명시 필요',
      '실제 근로시간 기록 권장',
      '무제한 공짜 야근은 불법'
    ],
    riskLevel: 'ORANGE',
    tags: ['포괄임금', '야근수당', '근로시간'],
    isKeyClause: true,
  },
  {
    id: 'clause-3',
    title: '퇴직금 지급 제외',
    originalText: '제9조 (퇴직) 본 계약은 1년 미만 계약이므로 퇴직금은 지급하지 아니한다.',
    easyExplanation: '1년 이상 근무하고 주 15시간 이상 일했다면 퇴직금은 무조건 지급해야 합니다. 계약서에 "지급하지 않는다"고 써놔도 법적으로 무효입니다. 다만, 실제 1년 미만 근무 후 퇴사한다면 지급 의무는 없습니다.',
    summaryBullets: [
      '1년 이상 근무 시 무조건 지급',
      '계약서 특약보다 법이 우선',
      '주 15시간 이상 근무 조건 확인'
    ],
    riskLevel: 'YELLOW',
    tags: ['퇴직금', '근로기간'],
    isKeyClause: false,
  },
  {
    id: 'clause-4',
    title: '손해배상 예정',
    originalText: '제11조 (손해배상) 을이 무단 퇴사할 경우, 회사에 100만 원을 배상해야 한다.',
    easyExplanation: '근로자가 잘못해서 손해를 입혔을 때 배상을 청구할 수는 있지만, "무조건 얼마를 내라"고 미리 정해두는 것(위약금 예정)은 근로기준법 위반입니다.',
    summaryBullets: [
      '위약금 예정 금지 위반',
      '실제 발생 손해만 청구 가능',
      '강제 근로 유도 방지'
    ],
    riskLevel: 'RED',
    tags: ['손해배상', '위약금', '강제근로'],
    isKeyClause: true,
  }
];

const RECOMMENDED_DOCS = [
  { name: '신분증 / 주민등록증', description: '계약 당사자 본인 확인을 위해 기본적으로 필요합니다.' },
  { name: '사업자등록증', description: '고용주가 실제로 어떤 사업장인지, 명의가 누구인지 확인하는 데 도움이 됩니다.' },
  { name: '4대보험 가입내역', description: '정규직·상용직 여부와 실제 가입 여부를 확인할 수 있습니다.' },
  { name: '급여명세서', description: '계약서와 실제 지급 내역이 일치하는지 비교할 수 있는 핵심 자료입니다.' }
];

const SAMPLE_CASES = [
  {
    title: '[예시 판례] 수습 기간 중 급여 70% 지급이 문제 된 사례',
    summary: '수습 기간이라는 이유만으로 최저임금 미만을 지급한 것이 문제가 되어, 미지급 임금을 지급하라는 판결이 내려진 사례를 바탕으로 한 예시입니다.',
  },
  {
    title: '[예시 판례] 포괄임금제와 초과근로수당',
    summary: '근로시간 관리 없이 포괄임금제만 명시한 경우, 별도의 연장·야간·휴일근로수당을 인정한 판례를 바탕으로 구성한 예시 설명입니다.',
  }
];

const PreCheckSection: React.FC<PreCheckSectionProps> = ({ onNavigate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<ClauseResult[]>([]);
  const [contractText, setContractText] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Filter & Sort State
  const [showKeyOnly, setShowKeyOnly] = useState(false);
  const [riskFilter, setRiskFilter] = useState<'ALL' | RiskLevel>('ALL');
  const [sortOrder, setSortOrder] = useState<'DEFAULT' | 'HIGH_RISK' | 'LOW_RISK'>('DEFAULT');

  const { user, isAuthenticated, canUseCheck, consumeCheck } = useAuth();
  const { addRecord } = useAnalysisHistory();

  const isLimitReached = isAuthenticated && !canUseCheck();

  const handleAnalyzeClick = async () => {
    if (!isAuthenticated) {
      alert("계약서 점검은 로그인 후 이용하실 수 있습니다.\n상단의 '로그인' 버튼을 눌러주세요.");
      return;
    }

    if (isLimitReached) {
      alert("오늘 무료 점검 횟수를 모두 사용하셨습니다.\n내일 다시 이용하거나 유료 플랜을 확인해 주세요.");
      return;
    }

    if (!contractText.trim()) {
      alert("계약서 내용을 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await api.post('/analysis/analyze', {
        contractText: contractText,
        fileName: selectedFile?.name || '계약서',
      });

      // Convert backend analysis result to frontend ClauseResult format
      const analysisResult = data.data.analysisResult;
      const convertedResults: ClauseResult[] = analysisResult.risks.map((risk: any, index: number) => ({
        id: `clause-${index + 1}`,
        title: risk.issue,
        originalText: risk.issue,
        easyExplanation: risk.recommendation,
        summaryBullets: [risk.recommendation],
        riskLevel: risk.severity === 'high' ? 'RED' : risk.severity === 'medium' ? 'ORANGE' : 'YELLOW',
        tags: [risk.category],
        isKeyClause: risk.severity === 'high' || risk.severity === 'medium',
      }));

      setResults(convertedResults);
      setShowResults(true);

      // Sync quota with server
      await consumeCheck();

      // Add to analysis history
      if (user) {
        addRecord({
          title: analysisResult.title,
          riskLevel: analysisResult.risk_level,
          fileName: selectedFile?.name || '계약서',
        });
      }

      alert(`분석이 완료되었습니다!\n${analysisResult.risks.length}개의 위험 조항을 발견했습니다.`);
    } catch (error: any) {
      alert(error.response?.data?.message || '분석 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  // Derived state for filtering and sorting
  const filteredResults = results
    .filter(r => !showKeyOnly || r.isKeyClause)
    .filter(r => riskFilter === 'ALL' || r.riskLevel === riskFilter)
    .sort((a, b) => {
      if (sortOrder === 'DEFAULT') return 0;

      const riskScore = { 'RED': 3, 'ORANGE': 2, 'YELLOW': 1 };
      const scoreA = riskScore[a.riskLevel];
      const scoreB = riskScore[b.riskLevel];

      if (sortOrder === 'HIGH_RISK') return scoreB - scoreA;
      if (sortOrder === 'LOW_RISK') return scoreA - scoreB;
      return 0;
    });

  const riskCounts = {
    RED: results.filter(r => r.riskLevel === 'RED').length,
    ORANGE: results.filter(r => r.riskLevel === 'ORANGE').length,
    YELLOW: results.filter(r => r.riskLevel === 'YELLOW').length,
  };

  return (
    <section className="py-24 bg-slate-900 text-white relative overflow-hidden min-h-screen">
      {/* Loading Modal Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center transition-all duration-300">
          <Loader />
          <p className="mt-8 text-slate-300 animate-pulse font-medium">
            계약서를 꼼꼼히 살펴보고 있습니다...
          </p>
        </div>
      )}

      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500 rounded-full blur-[100px] opacity-10 pointer-events-none transform translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600 rounded-full blur-[120px] opacity-10 pointer-events-none transform -translate-x-1/3 translate-y-1/3"></div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">

        {/* Header */}
        <Reveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              {showResults ? "계약서 분석 결과" : "지금 바로 사전 점검 해보세요"}
            </h2>
            <p className="text-slate-400 text-lg">
              {showResults
                ? "발견된 위험 조항을 확인하고 전문가의 조언을 참고하세요."
                : "로그인 후 10초면 충분합니다. 계약서를 업로드하고 숨은 위험을 찾아보세요."}
            </p>

            {!showResults && (
              isAuthenticated ? (
                <div className="mt-6 inline-flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700">
                  <span className={`w-2 h-2 rounded-full animate-pulse ${user && user.remainingChecksToday > 0 ? 'bg-green-400' : 'bg-red-500'}`}></span>
                  <span className="text-sm font-medium text-slate-300">
                    오늘 남은 점검 횟수: <span className={`font-bold ${user && user.remainingChecksToday > 0 ? 'text-teal-400' : 'text-red-400'}`}>{user?.remainingChecksToday}</span> / 5
                  </span>
                </div>
              ) : (
                <div className="mt-6 inline-flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span className="text-sm text-slate-400">로그인 후 이용 가능합니다.</span>
                </div>
              )
            )}
          </div>
        </Reveal>

        {/* Content Area */}
        {!showResults ? (
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start max-w-6xl mx-auto">
            {/* Upload UI (Left) */}
            <div className="lg:col-span-3">
              <Reveal delay={100} direction="right">
                <div className="bg-white rounded-3xl p-8 text-slate-900 shadow-2xl relative overflow-hidden">
                  {/* Disabled Overlay */}
                  {(!isAuthenticated || isLimitReached) && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center text-center p-6">
                      {isLimitReached ? (
                        <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 max-w-sm">
                          <AlertTriangle className="w-10 h-10 text-orange-500 mx-auto mb-3" />
                          <h3 className="text-lg font-bold text-slate-900 mb-2">오늘 무료 점검 횟수 소진</h3>
                          <p className="text-slate-600 text-sm mb-4">
                            무료 플랜은 하루 5회까지 이용 가능합니다.<br/>
                            내일 다시 이용하거나 유료 플랜을 확인해 주세요.
                          </p>
                          <button
                            onClick={() => onNavigate && onNavigate('pricing')}
                            className="w-full py-2.5 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 transition-colors"
                          >
                            요금제 자세히 보기
                          </button>
                        </div>
                      ) : (
                        <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 max-w-sm">
                          <Lock className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                          <h3 className="text-lg font-bold text-slate-900 mb-2">로그인이 필요합니다</h3>
                          <p className="text-slate-600 text-sm mb-4">
                            계약서 분석 서비스를 이용하시려면<br/>
                            먼저 로그인을 진행해 주세요.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mb-6">
                    <label className="block text-sm font-bold text-slate-700 mb-2">계약 종류 선택</label>
                    <select disabled={!isAuthenticated || isLimitReached} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow cursor-pointer disabled:opacity-50">
                      <option>아르바이트 (단기 근로)</option>
                      <option>인턴 / 수습 계약</option>
                      <option>정규직 근로계약</option>
                      <option>연봉 계약서</option>
                      <option>기타 계약</option>
                    </select>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-bold text-slate-700 mb-2">계약서 내용 입력</label>
                    <textarea
                      disabled={!isAuthenticated || isLimitReached}
                      value={contractText}
                      onChange={(e) => setContractText(e.target.value)}
                      placeholder="계약서 내용을 여기에 복사하여 붙여넣기 해주세요..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow disabled:opacity-50 min-h-[200px]"
                    />
                  </div>

                  <div className={`border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 hover:border-teal-400 transition-all mb-6 ${(!isAuthenticated || isLimitReached) ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Upload className="w-6 h-6 text-teal-600" />
                    </div>
                    <p className="text-slate-600 text-sm">
                      또는 이미지/PDF 파일 업로드 (향후 지원 예정)
                    </p>
                  </div>

                  <p className="text-xs text-slate-400 text-center flex items-center justify-center gap-1">
                     <LockIcon className="w-3 h-3" />
                     업로드된 파일은 분석 후 즉시 서버에서 영구 삭제됩니다.
                  </p>
                </div>
              </Reveal>
            </div>

            {/* Preview UI (Right) */}
            <div className="lg:col-span-2">
              {isLimitReached ? (
                <Reveal delay={200} direction="left">
                  {/* Upgrade UI */}
                  <div className="bg-slate-800 rounded-3xl p-1 border border-slate-700 shadow-2xl h-full">
                    <div className="bg-slate-900 rounded-[1.3rem] p-6 h-full flex flex-col">
                      <div className="mb-6 pb-4 border-b border-slate-800">
                        <span className="text-sm font-bold text-teal-400 uppercase tracking-wider">Upgrade Plan</span>
                        <h3 className="text-xl font-bold text-white mt-2">더 많은 분석이 필요하신가요?</h3>
                      </div>

                      <div className="space-y-4 flex-1">
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex items-center justify-between opacity-50">
                          <div>
                            <h4 className="font-bold text-slate-300">Free Basic</h4>
                            <p className="text-xs text-slate-500">하루 5회 무료</p>
                          </div>
                          <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-400">사용 중</span>
                        </div>

                        <div className="bg-gradient-to-br from-teal-900/50 to-slate-800 p-4 rounded-xl border border-teal-500/30 relative overflow-hidden group hover:border-teal-500/50 transition-all">
                          <div className="absolute top-0 right-0 bg-teal-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">Popular</div>
                          <div className="flex items-start gap-3">
                            <div className="bg-teal-500/20 p-2 rounded-lg text-teal-400">
                              <Crown className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-white">Pro Unlimited</h4>
                              <p className="text-xs text-slate-400 mt-1">무제한 분석 + 우선 처리</p>
                              <p className="text-lg font-bold text-teal-300 mt-2">₩9,900 <span className="text-xs text-slate-500 font-normal">/월</span></p>
                            </div>
                          </div>
                          <button
                            onClick={() => onNavigate && onNavigate('pricing')}
                            className="mt-4 w-full py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg transition-colors"
                          >
                            구독 시작하기 (데모)
                          </button>
                        </div>

                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex flex-col gap-2">
                          <div className="flex items-center gap-2 text-slate-300">
                            <Zap className="w-4 h-4 text-yellow-400" />
                            <span className="font-bold text-sm">10회 충전권</span>
                          </div>
                          <button
                            onClick={() => onNavigate && onNavigate('pricing')}
                            className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-lg transition-colors"
                          >
                            ₩1,000 결제 (데모)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ) : (
                <Reveal delay={300} direction="left">
                  {/* Normal Preview UI */}
                  <div className="bg-slate-800 rounded-3xl p-1 border border-slate-700 shadow-2xl">
                    <div className="bg-slate-900 rounded-[1.3rem] p-6">
                      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        <span className="text-sm font-bold text-slate-300">분석 결과 예시</span>
                      </div>

                      <div className="space-y-4 mb-6">
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-red-500/30">
                          <div className="flex items-start gap-3">
                             <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                             <div>
                               <h4 className="text-sm font-bold text-red-200 mb-1">위험 조항 발견</h4>
                               <p className="text-xs text-slate-400 leading-relaxed mb-2">
                                 "퇴사 시 후임자를 구하지 못하면 급여를 지급하지 않는다"
                               </p>
                               <div className="bg-red-500/10 rounded px-2 py-1 text-[10px] text-red-300 inline-block font-medium">
                                 근로기준법 제20조 위반 소지
                               </div>
                             </div>
                          </div>
                        </div>
                         <div className="bg-slate-800/50 rounded-xl p-4 border border-teal-500/20">
                          <div className="flex items-start gap-3">
                             <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                             <div>
                               <h4 className="text-sm font-bold text-teal-200 mb-1">3줄 요약</h4>
                               <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                                 <li>수습 기간 급여는 90%로 적법합니다.</li>
                                 <li>퇴직금 조항이 명시되어 있습니다.</li>
                                 <li>다만, 위약금 설정 조항은 삭제가 필요합니다.</li>
                               </ul>
                             </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <button
                          onClick={handleAnalyzeClick}
                          disabled={!isAuthenticated}
                          className={`w-full py-3 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm ${
                            !isAuthenticated
                              ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                              : 'bg-teal-600 hover:bg-teal-500'
                          }`}
                        >
                          {isAuthenticated ? '내 계약서 분석하기' : '로그인 후 분석 가능'} <ArrowRight className="w-4 h-4" />
                        </button>
                        <p className="mt-3 text-[10px] text-slate-500 leading-tight">
                          * 본 서비스는 법률 자문을 대신하지 않으며,<br/> 참고용 안내로만 활용해 주세요.
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              )}
            </div>
          </div>
        ) : (
          /* Analysis Result View */
          <div className="max-w-6xl mx-auto">
            <Reveal>
              {/* Summary Header */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 mb-8 flex flex-wrap gap-6 items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">분석 완료!</h2>
                  <p className="text-slate-300 text-sm">총 {results.length}개의 조항을 분석했습니다.</p>
                </div>
                <div className="flex gap-3">
                  <div className="bg-red-500/20 border border-red-500/30 px-4 py-2 rounded-xl text-center">
                    <span className="block text-xs text-red-300 font-bold">위험 (RED)</span>
                    <span className="text-xl font-black text-red-400">{riskCounts.RED}</span>
                  </div>
                  <div className="bg-orange-500/20 border border-orange-500/30 px-4 py-2 rounded-xl text-center">
                    <span className="block text-xs text-orange-300 font-bold">주의 (ORANGE)</span>
                    <span className="text-xl font-black text-orange-400">{riskCounts.ORANGE}</span>
                  </div>
                  <div className="bg-yellow-500/20 border border-yellow-500/30 px-4 py-2 rounded-xl text-center">
                    <span className="block text-xs text-yellow-300 font-bold">확인 (YELLOW)</span>
                    <span className="text-xl font-black text-yellow-400">{riskCounts.YELLOW}</span>
                  </div>
                </div>
              </div>

              {/* Filter & Sort Bar */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8 bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
                <div className="flex items-center gap-3 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                  <span className="text-sm font-bold text-slate-400 flex items-center gap-1"><Filter className="w-4 h-4" /> 필터:</span>

                  {['ALL', 'RED', 'ORANGE', 'YELLOW'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setRiskFilter(level as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                        riskFilter === level
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                      }`}
                    >
                      {level === 'ALL' ? '전체' : level}
                    </button>
                  ))}

                  <div className="h-6 w-px bg-slate-600 mx-1"></div>

                  <button
                    onClick={() => setShowKeyOnly(!showKeyOnly)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                      showKeyOnly
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-transparent border-slate-600 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    중요 조항만 보기
                  </button>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-xs text-slate-400">정렬:</span>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as any)}
                    className="bg-slate-900 border border-slate-600 text-slate-300 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-2"
                  >
                    <option value="DEFAULT">기본 순서</option>
                    <option value="HIGH_RISK">위험도 높은 순</option>
                    <option value="LOW_RISK">위험도 낮은 순</option>
                  </select>
                </div>
              </div>

              {/* Results List */}
              <div className="space-y-6">
                {filteredResults.map((clause) => (
                  <MockContractCard key={clause.id} clause={clause} />
                ))}

                {filteredResults.length === 0 && (
                  <div className="text-center py-12 text-slate-500">
                    해당 조건에 맞는 조항이 없습니다.
                  </div>
                )}
              </div>

              {/* Recommended Docs Section */}
              <div className="mt-16 pt-10 border-t border-slate-800">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <FileSearch className="w-6 h-6 text-teal-400" />
                  함께 확인하면 좋은 서류
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {RECOMMENDED_DOCS.map((doc, idx) => (
                    <div key={idx} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                      <h4 className="text-slate-900 font-bold mb-1">{doc.name}</h4>
                      <p className="text-sm text-slate-600">{doc.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Similar Cases Section */}
              <div className="mt-12">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-indigo-400" />
                  비슷한 판례·사례 (예시)
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {SAMPLE_CASES.map((item, idx) => (
                    <div key={idx} className="bg-slate-800 text-slate-50 rounded-2xl p-6 border border-slate-700 flex flex-col justify-between hover:border-slate-600 transition-colors">
                      <div>
                        <h4 className="font-bold text-lg mb-3 text-teal-200">{item.title}</h4>
                        <p className="text-sm text-slate-300 leading-relaxed mb-4">{item.summary}</p>
                      </div>
                      <button
                        onClick={() => alert('데모 버전에서는 상세 판례 내용을 제공하지 않습니다.')}
                        className="self-start text-xs font-bold text-indigo-300 hover:text-indigo-200 flex items-center gap-1"
                      >
                        자세히 보기 (데모) <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disclaimer Footer */}
              <div className="mt-12 text-xs text-slate-400 leading-relaxed border-t border-slate-800 pt-6 text-center">
                <p>조항줍줍의 분석 결과는 참고용 안내이며, 실제 법률 자문이 아닙니다.</p>
                <p>중요한 결정이나 분쟁 상황에서는 반드시 공인 노무사·변호사 및 고용노동부 등 공공기관에 상담하시기 바랍니다.</p>
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={() => {
                    setShowResults(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 font-bold transition-colors"
                >
                  다시 분석하기
                </button>
              </div>
            </Reveal>
          </div>
        )}
      </div>
    </section>
  );
};

// Helper Icon
const LockIcon = ({ className }: { className?: string }) => (
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
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export default PreCheckSection;
