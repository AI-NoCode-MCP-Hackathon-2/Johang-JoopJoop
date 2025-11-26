import { Router } from 'express';
import { body } from 'express-validator';
import {
  saveAnalysis,
  getAnalysisHistory,
  getAnalysisById,
  deleteAnalysis,
  analyzeContract,
  analyzeContractN8n,
} from '../controllers/analysisController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post(
  '/analyze',
  [
    body('contractText').trim().notEmpty().withMessage('계약서 내용을 입력해주세요'),
    body('fileName').optional().trim(),
  ],
  analyzeContract
);

// n8n 웹훅을 통한 분석 (마스킹된 텍스트 전송)
router.post(
  '/analyze-n8n',
  [
    body('text').trim().notEmpty().withMessage('분석할 텍스트를 입력해주세요'),
    body('fileName').optional().trim(),
  ],
  analyzeContractN8n
);

router.post(
  '/',
  [
    body('fileName').trim().notEmpty().withMessage('파일 이름을 입력해주세요'),
    body('title').trim().notEmpty().withMessage('제목을 입력해주세요'),
    body('riskLevel')
      .isIn(['low', 'medium', 'high'])
      .withMessage('위험도는 low, medium, high 중 하나여야 합니다'),
    body('analysisResult').notEmpty().withMessage('분석 결과를 입력해주세요'),
  ],
  saveAnalysis
);

router.get('/', getAnalysisHistory);

router.get('/:id', getAnalysisById);

router.delete('/:id', deleteAnalysis);

export default router;
