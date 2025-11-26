import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

interface ClauseData {
  '조항 번호'?: string;
  '조항 제목'?: string;
  '조항': string;
  '위험도 색상': string;
  '설명': string;
}

interface PDFHighlightViewerProps {
  pdfFile: File;
  clauses: ClauseData[];
}

const PDFHighlightViewer: React.FC<PDFHighlightViewerProps> = ({ pdfFile, clauses }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfStatus, setPdfStatus] = useState<string>('PDF를 불러오는 중...');

  const normalizeText = (text = '') => text.replace(/\s+/g, '').toLowerCase();

  const highlightTextLayer = (textLayerDiv: HTMLDivElement, clausesToHighlight: ClauseData[]) => {
    if (!textLayerDiv || !clausesToHighlight || clausesToHighlight.length === 0) return;

    const spans = Array.from(textLayerDiv.querySelectorAll('span'));
    // console.log(`하이라이트 시작 - span 개수: ${spans.length}, 조항 개수: ${clausesToHighlight.length}`);

    // 1) 페이지 전체 문자열 + span 인덱스 테이블 만들기
    let pageTextNorm = '';
    const spanInfos = spans.map((span) => {
      const raw = span.textContent || '';
      const norm = normalizeText(raw);
      const start = pageTextNorm.length;
      const end = start + norm.length;

      pageTextNorm += norm;
      return { span, start, end };
    });

    // console.log('📏 페이지 전체 문자열 길이:', pageTextNorm.length);

    let matchCount = 0;

    // 2) 각 위험 조항을 페이지 문자열에서 위치 검색
    clausesToHighlight.forEach((clause, clauseIdx) => {
      const targetText = clause['조항'] || '';
      if (!targetText) {
        // console.log(`조항 #${clauseIdx + 1}: 텍스트 없음`);
        return;
      }

      const riskKey = String(clause['위험도 색상'] || '').toUpperCase();
      let highlightClass = '';

      if (riskKey.includes('RED')) {
        highlightClass = 'highlight-red';
      } else if (riskKey.includes('ORANGE')) {
        highlightClass = 'highlight-orange';
      } else if (riskKey.includes('YELLOW')) {
        highlightClass = 'highlight-yellow';
      }

      if (!highlightClass) {
        // console.log(`조항 #${clauseIdx + 1}: 알 수 없는 위험도 '${riskKey}'`);
        return;
      }

      // console.log(`\n🎯 조항 #${clauseIdx + 1} (${riskKey}): ${targetText.slice(0, 80)}...`);

      // "제목: 내용" 형태면 콜론 뒤 내용만 사용
      let coreText = targetText;
      if (targetText.includes(':')) {
        coreText = targetText.split(':').slice(1).join(':').trim();
      }

      const normalizedTarget = normalizeText(coreText);
      if (!normalizedTarget || normalizedTarget.length < 5) {
        // console.log('   ✗ 텍스트가 너무 짧아서 스킵');
        return;
      }

      // 3) 페이지 문자열에서 이 조항이 나오는 위치 찾기
      let pos = pageTextNorm.indexOf(normalizedTarget);
      if (pos === -1) {
        // console.log('   ✗ 매칭 실패 - 페이지 문자열에서 찾을 수 없음');
        return;
      }

      while (pos !== -1) {
        const targetStart = pos;
        const targetEnd = pos + normalizedTarget.length;

        // console.log(`   ✓ 매칭 구간: [${targetStart}, ${targetEnd})`);

        // 4) 이 구간과 겹치는 span에만 하이라이트 적용
        spanInfos.forEach(info => {
          if (info.end <= targetStart) return; // info가 타깃 앞
          if (info.start >= targetEnd) return; // info가 타깃 뒤
          // 여기 도달하면 구간이 겹치는 span
          info.span.classList.add(highlightClass);
        });

        matchCount++;
        // 같은 문장이 여러 번 있을 수도 있으니 다음 위치도 탐색
        pos = pageTextNorm.indexOf(normalizedTarget, targetEnd);
      }
    });

    // console.log(`\n하이라이트 완료: ${matchCount}/${clausesToHighlight.length}개 조항 매칭됨\n`);
  };

  useEffect(() => {
    const renderPDF = async () => {
      if (!pdfFile || !containerRef.current) return;

      try {
        setPdfStatus('PDF를 불러오는 중...');

        const buffer = await pdfFile.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({
          data: buffer,
          cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
          cMapPacked: true,
        }).promise;

        // console.log('사용 중인 분석 데이터:', clauses);
        // console.log('위험 조항 수:', clauses.length);

        const viewer = containerRef.current;
        viewer.innerHTML = '';

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);

          const viewport = page.getViewport({ scale: 1.5 });
          const pageDiv = document.createElement('div');
          pageDiv.className = 'pdf-page';
          pageDiv.style.width = viewport.width + 'px';
          pageDiv.style.height = viewport.height + 'px';

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          pageDiv.appendChild(canvas);
          viewer.appendChild(pageDiv);

          if (context) {
            await page.render({
              canvasContext: context,
              viewport: viewport,
            }).promise;
          }

          const textLayerDiv = document.createElement('div');
          textLayerDiv.className = 'textLayer';
          textLayerDiv.style.width = viewport.width + 'px';
          textLayerDiv.style.height = viewport.height + 'px';
          textLayerDiv.style.setProperty('--scale-factor', String(viewport.scale));
          pageDiv.appendChild(textLayerDiv);

          const textContent = await page.getTextContent();
          const textLayer = pdfjsLib.renderTextLayer({
            textContentSource: textContent,
            container: textLayerDiv,
            viewport: viewport,
          });

          await textLayer.promise;

          // console.log(`📄 페이지 ${pageNum} 텍스트 레이어 렌더 완료 → 하이라이트`);
          highlightTextLayer(textLayerDiv, clauses);
        }

        setPdfStatus(`✓ PDF ${pdf.numPages}페이지 로드 완료 (위험 조항 ${clauses.length}개)`);
      } catch (err: any) {
        console.error('PDF 렌더링 오류:', err);
        setPdfStatus(`불러오기 실패: ${err.message}`);
      }
    };

    renderPDF();
  }, [pdfFile, clauses]);

  return (
    <div className="w-full">
      <p className="text-sm text-slate-400 mb-4">{pdfStatus}</p>
      <div ref={containerRef} className="flex flex-col gap-4"></div>
    </div>
  );
};

export default PDFHighlightViewer;
