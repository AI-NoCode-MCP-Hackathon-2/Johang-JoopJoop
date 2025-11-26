import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

const router = Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const RAG_API_URL = process.env.RAG_API_URL || 'http://localhost:5002/ask';

const SYSTEM_PROMPT = `당신은 '조항줍줍' 서비스의 근로계약서 전문 상담 챗봇입니다.

역할:
- 근로계약서 관련 법률 상담 (근로기준법 기반)
- 계약서 조항에 대한 위험성 설명
- 노동자 권리에 대한 안내

답변 원칙:
1. 반드시 대한민국 근로기준법 및 실제 법령에 근거하여 답변할 것
2. 정확한 사실만 답변하고, 모르거나 불확실한 내용은 절대 지어내지 말 것
3. 친절하고 이해하기 쉬운 말로 설명
4. 법률 용어는 풀어서 설명
5. 불확실한 내용은 "전문가 상담을 권장드립니다"라고 안내
6. 답변은 간결하게 (3-5문장)
7. 필요시 관련 법 조항(예: 근로기준법 제OO조)을 정확히 언급
8. 가독성을 위해 문맥에 맞게 적절히 줄바꿈을 사용할 것

주요 상담 주제:
- 주휴수당, 연차휴가
- 수습기간 급여
- 포괄임금제
- 퇴직금
- 해고/권고사직
- 4대보험
- 최저임금
- 초과근무수당

중요:
- 법적 조언이 아닌 일반적인 정보 제공임을 명시하고, 구체적인 법적 분쟁은 노동청(1350)이나 변호사 상담을 권장하세요.
- 허위 정보나 추측성 답변은 절대 금지합니다. 확실하지 않으면 "정확한 답변을 드리기 어렵습니다"라고 안내하세요.`;

// RAG 응답이 불충분한지 확인하는 함수
function isRAGResponseInsufficient(answer: string): boolean {
  const insufficientPatterns = [
    '찾을 수 없습니다',
    '해당 정보를 찾을 수 없',
    '문서에서 관련 정보를',
    '제공된 문서에서',
    '모르겠습니다',
    '확인할 수 없',
  ];

  // 답변이 너무 짧거나 불충분한 패턴 포함 시
  if (answer.length < 50) return true;
  return insufficientPatterns.some(pattern => answer.includes(pattern));
}

// RAG API 호출 함수
async function callRAGAPI(question: string): Promise<string | null> {
  try {
    const response = await axios.post(RAG_API_URL, { question }, { timeout: 30000 });
    if (response.data.success && response.data.answer) {
      const answer = response.data.answer;
      // RAG 응답이 불충분하면 null 반환하여 Gemini로 폴백
      if (isRAGResponseInsufficient(answer)) {
        console.log('RAG 응답이 불충분합니다. Gemini로 폴백합니다.');
        return null;
      }
      return answer;
    }
    return null;
  } catch (error) {
    console.log('RAG API 호출 실패, Gemini로 폴백합니다.');
    return null;
  }
}

// Gemini API 호출 함수 (gemini-3-pro 사용)
async function callGeminiAPI(message: string, conversationHistory: any[]): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-3-pro-preview' });

  let chatHistory = '';
  if (conversationHistory && Array.isArray(conversationHistory)) {
    chatHistory = conversationHistory
      .slice(-6)
      .map((msg: { role: string; content: string }) =>
        `${msg.role === 'user' ? '사용자' : '챗봇'}: ${msg.content}`
      )
      .join('\n');
  }

  const prompt = `${SYSTEM_PROMPT}

${chatHistory ? `이전 대화:\n${chatHistory}\n\n` : ''}사용자: ${message}

챗봇:`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text().trim();
}

router.post(
  '/',
  [
    body('message').trim().notEmpty().withMessage('메시지를 입력해주세요'),
  ],
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: '메시지를 입력해주세요',
          errors: errors.array(),
        });
        return;
      }

      const { message, conversationHistory } = req.body;

      // 1. RAG API 우선 호출
      let responseText = await callRAGAPI(message);

      // 2. RAG 실패 시 Gemini로 폴백
      if (!responseText) {
        responseText = await callGeminiAPI(message, conversationHistory || []);
      }

      res.json({
        success: true,
        data: {
          message: responseText,
        },
      });
    } catch (error) {
      console.error('Chatbot error:', error);
      next(error);
    }
  }
);

export default router;
