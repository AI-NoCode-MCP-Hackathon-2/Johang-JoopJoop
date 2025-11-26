import React, { useState, useEffect, useMemo } from 'react';

interface N8nClauseData {
  clause: string;
  name?: string;
  rank?: number;
  risk: string;
  easyTranslation?: string;
  summary?: string[];
}

interface TextHighlightViewerProps {
  maskedText: string;
  clauses: N8nClauseData[];
  onClauseClick?: (clauseIndex: number) => void;
}

const normalizeText = (text: string): string => {
  return text.replace(/\s+/g, '').toLowerCase();
};

// 정규화된 인덱스 → 원본 인덱스 매핑 생성
const buildNormalizedToOriginalMap = (original: string): number[] => {
  const map: number[] = [];
  let normalizedIndex = 0;

  for (let i = 0; i < original.length; i++) {
    const char = original[i];
    if (!/\s/.test(char)) {
      map[normalizedIndex] = i;
      normalizedIndex++;
    }
  }

  return map;
};

interface HighlightSegment {
  text: string;
  riskClass?: string;
  clauseIndex?: number;
}

const TextHighlightViewer: React.FC<TextHighlightViewerProps> = ({
  maskedText,
  clauses,
  onClauseClick,
}) => {
  const [activeClauseIndex, setActiveClauseIndex] = useState<number | null>(null);

  // 하이라이트 매핑 계산
  const highlightedSegments = useMemo(() => {
    if (!maskedText || !clauses || clauses.length === 0) {
      return [{ text: maskedText, riskClass: undefined, clauseIndex: undefined }];
    }

    const normalizedFullText = normalizeText(maskedText);
    const segments: HighlightSegment[] = [];
    const matches: Array<{ start: number; end: number; riskClass: string; clauseIndex: number }> = [];

    // 각 조항별 매칭 위치 찾기
    clauses.forEach((clause, clauseIndex) => {
      let targetText = clause.clause || '';
      if (!targetText) return;

      // 콜론 뒤 내용만 사용 (n8n출력.txt 로직)
      if (targetText.includes(':')) {
        targetText = targetText.split(':').slice(1).join(':').trim();
      }

      const normalizedTarget = normalizeText(targetText);
      if (normalizedTarget.length < 5) return;

      // 위험도별 색상 결정
      const riskKey = String(clause.risk || '').toUpperCase();
      let highlightClass = '';

      if (riskKey.includes('RED')) {
        highlightClass = 'highlight-red';
      } else if (riskKey.includes('ORANGE')) {
        highlightClass = 'highlight-orange';
      } else if (riskKey.includes('YELLOW')) {
        highlightClass = 'highlight-yellow';
      }

      if (!highlightClass) return;

      // 매칭 위치 찾기
      let pos = normalizedFullText.indexOf(normalizedTarget);
      while (pos !== -1) {
        matches.push({
          start: pos,
          end: pos + normalizedTarget.length,
          riskClass: highlightClass,
          clauseIndex: clauseIndex,
        });
        pos = normalizedFullText.indexOf(normalizedTarget, pos + normalizedTarget.length);
      }
    });

    // 매칭 위치 정렬 (시작 위치 기준)
    matches.sort((a, b) => a.start - b.start);

    // 원본 텍스트에서 실제 위치 계산하여 세그먼트 생성
    let lastIndex = 0;
    const normalizedToOriginalMap = buildNormalizedToOriginalMap(maskedText);

    matches.forEach((match) => {
      const originalStart = normalizedToOriginalMap[match.start] || 0;
      const originalEnd = normalizedToOriginalMap[match.end - 1] + 1 || maskedText.length;

      // 이전 매칭과 현재 매칭 사이의 일반 텍스트
      if (lastIndex < originalStart) {
        segments.push({
          text: maskedText.substring(lastIndex, originalStart),
          riskClass: undefined,
          clauseIndex: undefined,
        });
      }

      // 하이라이트 텍스트
      segments.push({
        text: maskedText.substring(originalStart, originalEnd),
        riskClass: match.riskClass,
        clauseIndex: match.clauseIndex,
      });

      lastIndex = originalEnd;
    });

    // 마지막 세그먼트 이후 남은 텍스트
    if (lastIndex < maskedText.length) {
      segments.push({
        text: maskedText.substring(lastIndex),
        riskClass: undefined,
        clauseIndex: undefined,
      });
    }

    return segments.length > 0 ? segments : [{ text: maskedText, riskClass: undefined, clauseIndex: undefined }];
  }, [maskedText, clauses]);

  const handleClauseClick = (clauseIndex: number) => {
    setActiveClauseIndex(clauseIndex);
    if (onClauseClick) {
      onClauseClick(clauseIndex);
    }
  };

  return (
    <div className="text-highlight-viewer">
      <div className="text-container">
        {highlightedSegments.map((segment, index) => {
          if (segment.riskClass && segment.clauseIndex !== undefined) {
            const isActive = activeClauseIndex === segment.clauseIndex;
            return (
              <mark
                key={index}
                className={`${segment.riskClass} ${isActive ? 'highlight-active' : ''}`}
                onClick={() => handleClauseClick(segment.clauseIndex!)}
              >
                {segment.text}
              </mark>
            );
          }
          return <span key={index}>{segment.text}</span>;
        })}
      </div>

      <style>{`
        .text-highlight-viewer {
          width: 100%;
          height: 100%;
          overflow-y: auto;
        }

        .text-container {
          background: white;
          color: #0f172a;
          padding: 24px;
          border-radius: 12px;
          line-height: 2;
          font-size: 15px;
          white-space: pre-wrap;
          word-wrap: break-word;
          overflow-wrap: break-word;
          font-family: 'Noto Sans KR', 'Malgun Gothic', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          word-break: keep-all;
          text-align: left;
        }

        .text-container mark {
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 2px 0;
          border-radius: 2px;
        }

        .text-container mark.highlight-red {
          background: rgba(239, 68, 68, 0.28);
          border-bottom: 2px solid #ef4444;
        }

        .text-container mark.highlight-red:hover {
          background: rgba(239, 68, 68, 0.4);
        }

        .text-container mark.highlight-orange {
          background: rgba(249, 115, 22, 0.25);
          border-bottom: 2px solid #f97316;
        }

        .text-container mark.highlight-orange:hover {
          background: rgba(249, 115, 22, 0.35);
        }

        .text-container mark.highlight-yellow {
          background: rgba(234, 179, 8, 0.25);
          border-bottom: 2px solid #eab308;
        }

        .text-container mark.highlight-yellow:hover {
          background: rgba(234, 179, 8, 0.35);
        }

        .text-container mark.highlight-active {
          animation: pulse 2s infinite;
          box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.5);
          z-index: 1;
          position: relative;
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.5);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(34, 211, 238, 0.3);
          }
        }

        .text-highlight-viewer::-webkit-scrollbar {
          width: 8px;
        }

        .text-highlight-viewer::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 4px;
        }

        .text-highlight-viewer::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
        }

        .text-highlight-viewer::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </div>
  );
};

export default TextHighlightViewer;
