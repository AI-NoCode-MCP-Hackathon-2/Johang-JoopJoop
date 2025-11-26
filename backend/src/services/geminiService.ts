import { GoogleGenerativeAI } from '@google/generative-ai';
import { AppError } from '../utils/errors';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface AnalysisResult {
  title: string;
  risk_level: 'low' | 'medium' | 'high';
  summary: string;
  risks: Array<{
    category: string;
    issue: string;
    severity: 'low' | 'medium' | 'high';
    recommendation: string;
  }>;
  legal_points: string[];
  overall_score: number;
}

export async function analyzeContract(contractText: string): Promise<AnalysisResult> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `
당신은 대한민국 근로기준법 전문가입니다. 다음 근로계약서를 분석하여 JSON 형식으로 결과를 제공해주세요.

분석할 계약서:
${contractText}

다음 JSON 형식으로 응답해주세요:
{
  "title": "계약서 제목 또는 주요 특징",
  "risk_level": "low/medium/high",
  "summary": "계약서 전체 요약 (2-3문장)",
  "risks": [
    {
      "category": "위험 카테고리 (예: 근로시간, 임금, 퇴직금 등)",
      "issue": "발견된 문제점",
      "severity": "low/medium/high",
      "recommendation": "개선 방안"
    }
  ],
  "legal_points": ["근로기준법 준수 여부 및 법적 참고사항 목록"],
  "overall_score": 0-100 사이의 점수
}

주의사항:
1. 근로기준법 위반 사항을 우선적으로 찾아주세요
2. 근로자에게 불리한 조항을 명확히 지적해주세요
3. 모호하거나 해석이 필요한 조항도 언급해주세요
4. 반드시 유효한 JSON 형식으로만 응답해주세요
`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new AppError('AI 응답을 파싱할 수 없습니다', 500);
    }

    const analysisResult: AnalysisResult = JSON.parse(jsonMatch[0]);

    if (!analysisResult.title || !analysisResult.risk_level || !analysisResult.summary) {
      throw new AppError('AI 응답이 완전하지 않습니다', 500);
    }

    return analysisResult;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Gemini API 오류:', error);
    throw new AppError('계약서 분석 중 오류가 발생했습니다', 500);
  }
}
