import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error('VITE_GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey || '');

export interface ContractAnalysisResult {
  riskLevel: 'low' | 'medium' | 'high';
  summary: string[];
  riskyClause?: string;
  legalIssue?: string;
}

export async function analyzeContract(contractText: string): Promise<ContractAnalysisResult> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `
당신은 대한민국 근로기준법 전문가입니다. 다음 계약서를 분석하고 위험 조항을 찾아주세요.

계약서 내용:
${contractText}

다음 형식으로 JSON 응답을 제공해주세요:
{
  "riskLevel": "low" | "medium" | "high",
  "summary": ["요약 1", "요약 2", "요약 3"],
  "riskyClause": "발견된 위험 조항 (있을 경우)",
  "legalIssue": "관련 법률 위반 사항 (있을 경우)"
}

위험도 판단 기준:
- high: 명백한 근로기준법 위반 조항이 있는 경우
- medium: 불공정하거나 논란의 여지가 있는 조항이 있는 경우
- low: 대체로 적법하고 공정한 계약서인 경우
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysisResult = JSON.parse(jsonMatch[0]) as ContractAnalysisResult;
      return analysisResult;
    }

    return {
      riskLevel: 'medium',
      summary: ['분석 결과를 파싱할 수 없습니다.'],
    };
  } catch (error) {
    console.error('Contract analysis error:', error);
    throw new Error('계약서 분석 중 오류가 발생했습니다.');
  }
}

export async function testGeminiAPI(): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const result = await model.generateContent('Explain how AI works in a few words');
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API test error:', error);
    throw error;
  }
}
