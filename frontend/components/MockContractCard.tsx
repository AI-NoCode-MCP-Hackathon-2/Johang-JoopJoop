import React from 'react';
import { FileText, Search, AlertTriangle, CheckCircle2, HelpCircle, Tag } from 'lucide-react';

// Re-export types if needed or define them locally to match PreCheckSection usage
export type RiskLevel = 'RED' | 'ORANGE' | 'YELLOW';

export interface ClauseResult {
  id: string;
  title: string;
  originalText: string;
  easyExplanation: string;
  summaryBullets: string[];
  riskLevel: RiskLevel;
  tags: string[];
  isKeyClause: boolean;
}

interface MockContractCardProps {
  showTooltips?: boolean;
  // If 'clause' is provided, we render the new detailed card style.
  // If not, we fallback to the original simplified mock card style (used in Hero/HowItWorks).
  clause?: ClauseResult;
}

const MockContractCard: React.FC<MockContractCardProps> = ({ showTooltips = false, clause }) => {

  // If we have a specific clause result to render (New Detailed Card)
  if (clause) {
    const riskColor =
      clause.riskLevel === 'RED' ? 'bg-red-50 text-red-700 border-red-100' :
      clause.riskLevel === 'ORANGE' ? 'bg-orange-50 text-orange-700 border-orange-100' :
      'bg-amber-50 text-amber-700 border-amber-100';

    const riskIcon =
      clause.riskLevel === 'RED' ? <AlertTriangle className="w-4 h-4" /> :
      clause.riskLevel === 'ORANGE' ? <HelpCircle className="w-4 h-4" /> :
      <CheckCircle2 className="w-4 h-4" />;

    const riskLabel =
      clause.riskLevel === 'RED' ? '높은 위험 (RED)' :
      clause.riskLevel === 'ORANGE' ? '주의 (ORANGE)' :
      '확인 필요 (YELLOW)';

    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col gap-6 transition-all hover:shadow-md">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${riskColor}`}>
              {riskIcon}
              {riskLabel}
            </span>
            {clause.isKeyClause && (
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                핵심 조항
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-slate-900 flex-1 text-right break-keep min-w-[120px]">
            {clause.title}
          </h3>
        </div>

        {/* Body */}
        <div className="space-y-5">
          {/* Original Text */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-2 flex items-center gap-1">
              <FileText className="w-3 h-3" />
              계약서 원문 일부
            </div>
            <p className="text-sm text-slate-600 leading-relaxed font-serif italic">
              "{clause.originalText}"
            </p>
          </div>

          {/* Easy Explanation */}
          <div>
            <div className="text-[10px] uppercase font-bold text-teal-600 mb-2 flex items-center gap-1">
              <Search className="w-3 h-3" />
              쉽게 말하면
            </div>
            <p className="text-sm text-slate-800 leading-relaxed break-keep font-medium">
              {clause.easyExplanation}
            </p>
          </div>

          {/* Summary Bullets */}
          <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">3줄 요약</div>
            <ul className="space-y-2">
              {clause.summaryBullets.map((bullet, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                  <span className="w-1 h-1 bg-teal-400 rounded-full mt-1.5 flex-shrink-0"></span>
                  <span className="leading-relaxed">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Tags */}
        <div className="pt-4 border-t border-slate-50 flex flex-wrap gap-2">
          {clause.tags.map((tag, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-500 text-[10px] font-medium">
              <Tag className="w-3 h-3" />
              {tag}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // Fallback: Original Simplified Card (for Hero / HowItWorks)
  return (
    <div className="group/card relative bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden transform transition-all duration-500 hover:scale-[1.01] hover:shadow-[0_30px_70px_-15px_rgba(0,0,0,0.15)]">
      {/* UI Header */}
      <div className="bg-white border-b border-slate-100 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-slate-500" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-900">표준근로계약서_final.pdf</div>
            <div className="text-[10px] text-slate-400">분석 완료 • 2.4MB</div>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/80 group-hover/card:bg-red-500 transition-colors"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80 group-hover/card:bg-yellow-500 transition-colors"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-400/80 group-hover/card:bg-green-500 transition-colors"></div>
        </div>
      </div>

      {/* UI Body - Split View */}
      <div className="p-6 grid grid-cols-1 gap-6">

        {/* Document Viewer Area */}
        <div className="space-y-4">
          {/* Mock Lines */}
          <div className="space-y-2.5">
            <div className="h-2 bg-slate-100 rounded-full w-3/4"></div>
            <div className="h-2 bg-slate-100 rounded-full w-full"></div>
            <div className="h-2 bg-slate-100 rounded-full w-5/6"></div>

            {/* Highlighted Dangerous Section (RED) */}
            <div className="relative group cursor-help transition-all duration-300">
              <div className="absolute -inset-1 bg-red-50 rounded-lg border border-red-100 opacity-100 group-hover:bg-red-100/80 transition-all duration-300"></div>
              <div className="relative">
                <div className="h-2 bg-red-200 rounded-full w-full mb-2 group-hover:bg-red-300 transition-colors"></div>
                <div className="h-2 bg-red-200 rounded-full w-4/5 group-hover:bg-red-300 transition-colors"></div>
              </div>

              {/* Red Tooltip Popup */}
              {/* Position: BELOW the line (top-full), RIGHT aligned to avoid overlap */}
              {showTooltips && (
                <div className="absolute right-0 top-full mt-3 w-64 bg-slate-900/95 backdrop-blur-sm text-white text-xs p-3 rounded-xl shadow-xl z-40 pointer-events-none animate-in fade-in slide-in-from-top-2 duration-500">
                  <div className="font-bold text-red-300 mb-1 flex items-center gap-1">
                    <AlertTriangleIcon className="w-3 h-3" />
                    위험 조항 (Risk)
                  </div>
                  <p className="leading-relaxed text-slate-300">
                    "수습기간 중 급여를 70%만 지급한다"는 조항은 1년 미만 계약 시 불법입니다.
                  </p>
                  {/* Arrow Pointing Up - Right aligned */}
                  <div className="absolute top-[-5px] right-6 w-2 h-2 bg-slate-900/95 rotate-45"></div>
                </div>
              )}
            </div>

            <div className="h-2 bg-slate-100 rounded-full w-11/12"></div>
            <div className="h-2 bg-slate-100 rounded-full w-full"></div>

            {/* Warning Section (ORANGE) */}
             <div className="relative group cursor-help mt-28 sm:mt-32 md:mt-36 transition-all duration-300">
               <div className="absolute -inset-1 bg-orange-50 rounded-lg border border-orange-100 opacity-100 group-hover:bg-orange-100/50 transition-all duration-300"></div>
              <div className="relative">
                <div className="h-2 bg-orange-200 rounded-full w-2/3 group-hover:bg-orange-300 transition-colors"></div>
              </div>

              {/* Orange Tooltip Popup */}
              {/* Position: ABOVE the line (bottom-full), LEFT aligned */}
              {showTooltips && (
                <div className="absolute left-0 bottom-full mb-3 w-64 bg-white/95 backdrop-blur-sm border border-orange-100 text-slate-800 text-xs p-3 rounded-xl shadow-xl z-30 pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="font-bold text-orange-600 mb-1 flex items-center gap-1">
                    <AlertCircleIcon className="w-3 h-3" />
                    주의 (Check)
                  </div>
                  <p className="leading-relaxed text-slate-600">
                    "포괄임금제" 문구가 포함되어 있습니다. 공짜 야근이 되지 않도록 고정 연장근로시간을 꼭 확인하세요.
                  </p>
                  {/* Arrow Pointing Down - Left aligned */}
                  <div className="absolute bottom-[-5px] left-6 w-2 h-2 bg-white border-b border-r border-orange-100 rotate-45"></div>
                </div>
              )}
            </div>

            <div className="h-2 bg-slate-100 rounded-full w-full mt-4"></div>
            <div className="h-2 bg-slate-100 rounded-full w-3/4"></div>
          </div>
        </div>

        {/* AI Analysis Summary Card (Embedded at bottom) */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 relative overflow-hidden group-hover/card:bg-slate-50/80 transition-colors mt-4">
          <div className="absolute top-0 left-0 w-1 h-full bg-teal-500"></div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-1">
              <Search className="w-4 h-4 text-teal-700" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-slate-800 mb-1 font-display">AI 요약 리포트</h4>
              <p className="text-xs text-slate-600 leading-relaxed break-keep">
                총 <span className="font-bold text-red-600">3개의 위험 조항</span>이 발견되었습니다. 특히 <span className="bg-red-100 px-1 rounded text-red-800 font-medium">임금 삭감</span> 관련 내용은 반드시 서명 전 수정이 필요합니다.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Decorative gradient overlay at bottom to imply scrolling */}
      <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
    </div>
  );
};

// Helper components for icons
const AlertTriangleIcon = ({ className }: { className?: string }) => (
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
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

const AlertCircleIcon = ({ className }: { className?: string }) => (
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
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export default MockContractCard;
