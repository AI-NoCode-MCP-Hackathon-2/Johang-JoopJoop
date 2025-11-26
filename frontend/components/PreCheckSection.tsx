import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle, ArrowRight, Lock, Crown, Zap, FileSearch, Shield, X } from 'lucide-react';
import Reveal from './Reveal';
import Loader from './Loader';
import { useAuth } from './AuthContext';
import { Page } from '../App';
import { ClauseResult, RiskLevel } from './MockContractCard';
import TextHighlightViewer from './TextHighlightViewer';
import api from '../utils/api';
import { maskSensitiveInfo } from '../utils/masking';
import * as pdfjsLib from 'pdfjs-dist';

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

// PDF.js 워커 설정
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

// 유효한 문자인지 확인하는 함수
const isValidChar = (char: string): boolean => {
  const code = char.charCodeAt(0);

  // 제어문자 제외 (줄바꿈, 탭 제외)
  if (code < 0x20 && char !== '\n' && char !== '\t') return false;

  // Private Use Area (PUA) 제외 - 깨진 문자의 주범
  if (code >= 0xE000 && code <= 0xF8FF) return false;

  return (
    // 기본 ASCII
    (code >= 0x20 && code <= 0x007E) ||
    // 일반 구두점/기호 (전각 등)
    (code >= 0x2000 && code <= 0x206F) ||
    // 한글 자모 (U+1100~U+11FF, U+3130~318F)
    (code >= 0x1100 && code <= 0x11FF) ||
    (code >= 0x3130 && code <= 0x318F) ||
    // 한글 음절
    (code >= 0xAC00 && code <= 0xD7AF) ||
    // 공백류
    char === '\n' || char === '\t' || char === ' '
  );
};

// PDF 텍스트 추출 함수 (개선된 설정 + 확장된 필터)
const extractTextFromPDF = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({
    data: buffer,
    cMapUrl: `${window.location.origin}/pdfjs/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `${window.location.origin}/pdfjs/standard_fonts/`,
  }).promise;

  let fullText = '';
  let filteredCount = 0;
  let totalChars = 0;

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    let lastY = -1;
    let lineText = '';

    textContent.items.forEach((item: any) => {
      const currentY = item.transform[5];
      const original = item.str;
      totalChars += original.length;

      // 개선된 필터: 확장된 유니코드 범위 허용
      const filtered = original.split('').filter(isValidChar).join('');

      const removedCount = original.length - filtered.length;
      filteredCount += removedCount;

      // 디버깅: 필터링된 텍스트 로그
      if (!filtered.trim() && original.trim()) {
        console.debug(
          'Filtered out text:',
          JSON.stringify(original),
          'charCodes:',
          original.split('').map((c: string) => '0x' + c.charCodeAt(0).toString(16))
        );
      }

      if (!filtered.trim()) return;

      // 쓰레기 데이터 필터링: 원본의 80% 이상이 필터링되고 남은 텍스트가 3자 이하면 제거
      if (original.length >= 5 && removedCount >= original.length * 0.8 && filtered.length <= 3) {
        console.debug(`쓰레기 데이터로 판단하여 제거: "${filtered}"`);
        filteredCount += filtered.length; // 남은 문자도 필터링 카운트에 추가
        return;
      }

      // Y 좌표가 많이 바뀌면 줄바꿈
      if (lastY !== -1 && Math.abs(currentY - lastY) > 5) {
        fullText += lineText.trim() + '\n';
        lineText = '';
      }

      lineText += filtered + ' ';
      lastY = currentY;
    });

    if (lineText.trim()) {
      fullText += lineText.trim() + '\n';
    }
    fullText += '\n';
  }

  // 필터링 비율 계산
  const filterRatio = totalChars > 0 ? (filteredCount / totalChars) * 100 : 0;

  if (filteredCount > 0) {
    console.warn(`${filteredCount}개 문자 필터링됨 (PDF 인코딩 문제, ${filterRatio.toFixed(1)}%)`);
  }

  // 필터링 비율이 30% 이상이면 경고
  if (filterRatio > 30) {
    console.error('PDF 텍스트 인코딩이 심각하게 손상되었습니다. OCR이 필요할 수 있습니다.');
  }

  return fullText.trim();
};

interface N8nClauseData {
  clause: string;
  name?: string;
  rank?: number;
  risk: string;
  easyTranslation?: string;
  summary?: string[];
}

const PreCheckSection: React.FC<PreCheckSectionProps> = ({ onNavigate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<ClauseResult[]>([]);
  const [contractText, setContractText] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [n8nClauses, setN8nClauses] = useState<N8nClauseData[]>([]);
  const [loadedAnalysisId, setLoadedAnalysisId] = useState<string | null>(null);
  const [maskedText, setMaskedText] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user, isAuthenticated, canUseCheck, refreshUser } = useAuth();

  const isLimitReached = isAuthenticated && !canUseCheck();

  // URL에서 analysisId 파라미터 읽어서 저장된 분석 결과 로드
  useEffect(() => {
    const loadAnalysisFromUrl = async () => {
      const params = new URLSearchParams(window.location.hash.split('?')[1]);
      const analysisId = params.get('analysisId');

      // analysisId가 없으면 상태 초기화 (새 분석 모드)
      if (!analysisId) {
        setLoadedAnalysisId(null);
        setMaskedText('');
        setResults([]);
        setN8nClauses([]);
        setShowResults(false);
        setSelectedFile(null);
        setContractText('');
        return;
      }

      if (analysisId && analysisId !== loadedAnalysisId) {
        setIsLoading(true);
        try {
          const { data } = await api.get(`/analysis/${analysisId}`);
          const analysis = data.data.analysis;

          // console.log('분석 데이터 로드:', {
          //   id: analysis.id,
          //   file_name: analysis.file_name,
          //   has_masked_text: !!analysis.masked_text,
          //   masked_text_length: analysis.masked_text?.length || 0,
          //   risks_count: analysis.analysis_result?.risks?.length || 0,
          // });

          setLoadedAnalysisId(analysisId);

          // 마스킹된 텍스트 복원
          if (analysis.masked_text) {
            // console.log('maskedText 설정:', analysis.masked_text.substring(0, 100) + '...');
            setMaskedText(analysis.masked_text);
          } else {
            console.warn('masked_text가 없습니다. 레거시 데이터일 수 있습니다.');
          }

          // analysis_result에서 조항 정보 추출 (모든 정보 포함)
          const analysisResult = analysis.analysis_result;
          if (analysisResult && analysisResult.risks) {
            const convertedResults: ClauseResult[] = analysisResult.risks.map((risk: any, idx: number) => ({
              id: `clause-${idx + 1}`,
              title: risk.category || '조항',
              originalText: risk.originalClause || risk.issue || '',
              easyExplanation: risk.recommendation || '',
              summaryBullets: risk.summary || [],
              riskLevel: (risk.severity === 'high' ? 'RED' : risk.severity === 'medium' ? 'ORANGE' : 'YELLOW') as RiskLevel,
              tags: [risk.category || '일반'],
              isKeyClause: risk.severity === 'high' || risk.severity === 'medium',
            }));

            // n8nClauses 데이터 복원
            const n8nClauseData: N8nClauseData[] = analysisResult.risks.map((risk: any) => ({
              clause: risk.originalClause || risk.issue || '',
              name: risk.category || '',
              rank: risk.rank || 0,
              risk: risk.severity === 'high' ? 'RED' : risk.severity === 'medium' ? 'ORANGE' : 'YELLOW',
              easyTranslation: risk.recommendation || '',
              summary: risk.summary || [],
            }));

            setN8nClauses(n8nClauseData);
            setResults(convertedResults);
            setShowResults(true);
          }
        } catch (error) {
          console.error('분석 결과 로드 실패:', error);
          alert('분석 결과를 불러오는데 실패했습니다.');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadAnalysisFromUrl();
  }, [window.location.hash]);

  // 파일 선택 핸들러
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    // PDF 파일인 경우 텍스트 추출
    if (file.type === 'application/pdf') {
      try {
        const text = await extractTextFromPDF(file);
        // console.log('PDF 텍스트 추출 완료:', text.substring(0, 200) + '...');
        // console.log('총 길이:', text.length, '문자');
        setContractText(text);
      } catch (error) {
        alert('PDF 파일을 읽는 중 오류가 발생했습니다.');
        console.error(error);
      }
    } else if (file.type === 'text/plain') {
      // TXT 파일인 경우
      const text = await file.text();
      // console.log('TXT 파일 읽기 완료:', text.substring(0, 200) + '...');
      setContractText(text);
    }
  };

  // 파일 삭제 핸들러
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setContractText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyzeClick = async () => {
    if (!isAuthenticated) {
      alert("계약서 점검은 로그인 후 이용하실 수 있습니다.\n상단의 '로그인' 버튼을 눌러주세요.");
      return;
    }

    if (isLimitReached) {
      alert("오늘 무료 점검 횟수를 모두 사용하셨습니다.\n내일 다시 이용하거나 유료 플랜을 확인해 주세요.");
      return;
    }

    // console.log('분석 버튼 클릭 - contractText 상태:', {
    //   length: contractText.length,
    //   isEmpty: !contractText.trim(),
    //   preview: contractText.substring(0, 100)
    // });

    if (!contractText.trim()) {
      alert("계약서 내용을 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      // 마스킹 적용 (민감정보 제거)
      const maskedTextValue = maskSensitiveInfo(contractText);
      const fileName = selectedFile?.name || '계약서';

      // n8n 웹훅을 통한 분석
      const { data } = await api.post('/analysis/analyze-n8n', {
        text: maskedTextValue,
        fileName: fileName,
      });

      // n8n 응답 처리
      const clauses = data.data.clauses || [];
      const returnedMaskedText = data.data.maskedText || maskedTextValue;

      // 마스킹된 텍스트 저장
      setMaskedText(returnedMaskedText);

      // n8n 원본 데이터를 TextHighlightViewer용으로 변환
      const n8nClauseData: N8nClauseData[] = clauses.map((c: any) => ({
        clause: c.clause || '',
        name: c.name || '',
        rank: c.rank || 0,
        risk: (c.risk || '').toUpperCase(),
        easyTranslation: c.easyTranslation || '',
        summary: c.summary || [],
      }));

      // ClauseResult 형식으로도 변환 (사이드바 표시용)
      const convertedResults: ClauseResult[] = clauses.map((c: any, idx: number) => ({
        id: `clause-${idx + 1}`,
        title: c.name,
        originalText: c.clause,
        easyExplanation: c.easyTranslation || c.reason || '',
        summaryBullets: c.summary || [],
        riskLevel: c.risk as RiskLevel,
        tags: [c.name],
        isKeyClause: c.risk === 'RED' || c.risk === 'ORANGE',
      }));

      setN8nClauses(n8nClauseData);
      setResults(convertedResults);
      setShowResults(true);

      // 백엔드에서 이미 분석 횟수 차감 및 MySQL 저장 완료
      // user 정보를 새로고침하여 남은 횟수 업데이트
      await refreshUser();
    } catch (error: any) {
      console.error('분석 오류:', error);
      alert(error.response?.data?.message || '분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
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
                    오늘 남은 점검 횟수: <span className={`font-bold ${user && user.remainingChecksToday > 0 ? 'text-teal-400' : 'text-red-400'}`}>{user?.remainingChecksToday ?? 0}</span> / 5
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
                    <label className="block text-sm font-bold text-slate-700 mb-2">계약서 파일 업로드</label>
                    <div className={`border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center hover:bg-slate-50 hover:border-teal-400 transition-all ${(!isAuthenticated || isLimitReached) ? 'opacity-50 pointer-events-none' : ''}`}>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.txt"
                        onChange={handleFileSelect}
                        disabled={!isAuthenticated || isLimitReached}
                        className="hidden"
                        id="contract-file-input"
                      />
                      {selectedFile ? (
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                            <FileText className="w-8 h-8 text-teal-600" />
                          </div>
                          <div className="text-center">
                            <p className="text-base font-semibold text-slate-700">{selectedFile.name}</p>
                            <p className="text-sm text-slate-500 mt-1">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                          </div>
                          <button
                            onClick={handleRemoveFile}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-slate-600"
                          >
                            <X className="w-4 h-4" />
                            <span className="text-sm font-medium">파일 제거</span>
                          </button>
                        </div>
                      ) : (
                        <label htmlFor="contract-file-input" className="cursor-pointer">
                          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Upload className="w-8 h-8 text-teal-600" />
                          </div>
                          <p className="text-slate-700 font-semibold text-base mb-2">
                            PDF 또는 TXT 파일을 업로드하세요
                          </p>
                          <p className="text-slate-500 text-sm">
                            클릭하여 파일 선택
                          </p>
                        </label>
                      )}
                    </div>
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
          /* Analysis Result View - PDF Highlight */
          <div className="max-w-7xl mx-auto">
            <Reveal>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-block px-4 py-1 bg-teal-500/20 border border-teal-500/30 rounded-full mb-4">
                  <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">Live Highlight</span>
                </div>
                <h2 className="text-3xl font-bold mb-2">근로계약서 위험도 하이라이트</h2>
                <p className="text-slate-400 mb-6">
                  <strong className="text-teal-400">분석 파일:</strong> {selectedFile?.name || '계약서'}
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-slate-700">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <span className="text-sm font-bold">RED 위험</span>
                  </span>
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-slate-700">
                    <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                    <span className="text-sm font-bold">ORANGE 위험</span>
                  </span>
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-slate-700">
                    <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                    <span className="text-sm font-bold">YELLOW 위험</span>
                  </span>
                </div>
              </div>

              {/* Main Layout: PDF + Clause List (n8n.html 방식) */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', alignItems: 'start' }}>
                {/* Text Viewer (Left - 2fr) */}
                <section style={{
                  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.01))',
                  border: '1px solid rgba(31, 41, 55, 1)',
                  borderRadius: '16px',
                  padding: '14px',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.35)',
                  minHeight: '400px'
                }}>
                  {maskedText ? (
                    <TextHighlightViewer maskedText={maskedText} clauses={n8nClauses} />
                  ) : (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '400px',
                      padding: '24px',
                      textAlign: 'center'
                    }}>
                      <FileText className="w-12 h-12 text-slate-500 mb-4" />
                      <h4 style={{ color: '#94a3b8', fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                        텍스트 하이라이트를 사용할 수 없습니다
                      </h4>
                      <p style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.6', maxWidth: '400px' }}>
                        이 분석 결과는 구버전에서 저장되어 원본 텍스트가 없습니다.<br/>
                        우측의 조항 카드를 통해 분석 내용을 확인하실 수 있습니다.<br/><br/>
                        새로운 분석을 진행하시면 텍스트 하이라이트 기능을 사용하실 수 있습니다.
                      </p>
                    </div>
                  )}
                </section>

                {/* Clause List (Right - 1fr) */}
                <aside style={{
                  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.01))',
                  border: '1px solid rgba(31, 41, 55, 1)',
                  borderRadius: '16px',
                  padding: '14px',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.35)'
                }}>
                  <div style={{ marginBottom: '10px' }}>
                    <div className="flex items-center justify-between">
                      <h3 style={{ margin: 0, fontWeight: 'bold', fontSize: '1.125rem' }}>위험 조항</h3>
                      <span className="px-3 py-1 rounded-full text-xs font-bold" style={{
                        background: 'rgba(34,211,238,0.12)',
                        borderColor: '#22d3ee',
                        color: '#67e8f9',
                        border: '1px solid #22d3ee'
                      }}>
                        자동 하이라이트
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {results.map((clause, idx) => {
                      const riskColors = {
                        RED: { border: '#ef4444', bg: 'rgba(239,68,68,0.28)', label: 'RED' },
                        ORANGE: { border: '#f97316', bg: 'rgba(249,115,22,0.25)', label: 'ORANGE' },
                        YELLOW: { border: '#eab308', bg: 'rgba(234,179,8,0.25)', label: 'YELLOW' },
                      };
                      const color = riskColors[clause.riskLevel];

                      return (
                        <article
                          key={clause.id}
                          className="border rounded-xl p-3"
                          style={{
                            borderColor: color.border,
                            background: 'rgba(255, 255, 255, 0.03)',
                            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.04)'
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className="px-2 py-1 rounded text-xs font-bold"
                              style={{
                                borderColor: color.border,
                                color: color.border,
                                border: `1px solid ${color.border}`,
                                background: color.bg
                              }}
                            >
                              {color.label}
                            </span>
                            <span style={{ color: 'var(--muted)', fontSize: '12px' }}>#{idx + 1}</span>
                          </div>
                          <h4 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 'bold' }}>{clause.title || '조항 없음'}</h4>
                          <p className="text-xs leading-relaxed" style={{ margin: '6px 0 0', color: '#cbd5e1', fontSize: '13px', lineHeight: '1.4' }}>
                            {clause.easyExplanation}
                          </p>
                        </article>
                      );
                    })}

                    {results.length === 0 && (
                      <div className="text-center py-12 text-sm" style={{ color: 'var(--muted)' }}>
                        위험 조항이 발견되지 않았습니다.
                      </div>
                    )}
                  </div>
                </aside>
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
