import { Request, Response, NextFunction } from 'express';
import { AnalysisHistoryModel } from '../models/AnalysisHistory';
import { AppError } from '../utils/errors';
import { UserModel } from '../models/User';
import { validationResult } from 'express-validator';
import { analyzeContract as analyzeWithGemini, AnalysisResult } from '../services/geminiService';
import axios from 'axios';

export async function saveAnalysis(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('인증이 필요합니다', 401);
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('입력값이 유효하지 않습니다', 400);
    }

    const { fileName, title, riskLevel, analysisResult } = req.body;

    await UserModel.decrementRemainingChecks(req.user.userId);

    const analysis = await AnalysisHistoryModel.create({
      userId: req.user.userId,
      fileName,
      title,
      riskLevel,
      analysisResult,
    });

    res.status(201).json({
      success: true,
      message: '분석 결과가 저장되었습니다',
      data: { analysis },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAnalysisHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('인증이 필요합니다', 401);
    }

    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    const [analyses, total] = await Promise.all([
      AnalysisHistoryModel.findByUserId(req.user.userId, limit, offset),
      AnalysisHistoryModel.countByUserId(req.user.userId),
    ]);

    res.json({
      success: true,
      data: {
        analyses,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAnalysisById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('인증이 필요합니다', 401);
    }

    const { id } = req.params;

    const analysis = await AnalysisHistoryModel.findById(id);
    if (!analysis) {
      throw new AppError('분석 결과를 찾을 수 없습니다', 404);
    }

    if (analysis.user_id !== req.user.userId && req.user.role !== 'admin') {
      throw new AppError('접근 권한이 없습니다', 403);
    }

    res.json({
      success: true,
      data: { analysis },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteAnalysis(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('인증이 필요합니다', 401);
    }

    const { id } = req.params;

    const analysis = await AnalysisHistoryModel.findById(id);
    if (!analysis) {
      throw new AppError('분석 결과를 찾을 수 없습니다', 404);
    }

    if (analysis.user_id !== req.user.userId && req.user.role !== 'admin') {
      throw new AppError('접근 권한이 없습니다', 403);
    }

    await AnalysisHistoryModel.delete(id, req.user.userId);

    res.json({
      success: true,
      message: '분석 결과가 삭제되었습니다',
    });
  } catch (error) {
    next(error);
  }
}

export async function analyzeContract(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('인증이 필요합니다', 401);
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('입력값이 유효하지 않습니다', 400);
    }

    const { contractText, fileName } = req.body;

    // Gemini API로 계약서 분석
    const analysisResult = await analyzeWithGemini(contractText);

    // 사용자 할당량 차감
    await UserModel.decrementRemainingChecks(req.user.userId);

    // DB에 저장
    const analysis = await AnalysisHistoryModel.create({
      userId: req.user.userId,
      fileName: fileName || '업로드한 계약서',
      title: analysisResult.title,
      riskLevel: analysisResult.risk_level,
      analysisResult: analysisResult,
    });

    res.status(201).json({
      success: true,
      message: '분석이 완료되었습니다',
      data: { analysis, analysisResult },
    });
  } catch (error) {
    next(error);
  }
}

// n8n 웹훅을 통한 계약서 분석
export async function analyzeContractN8n(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('인증이 필요합니다', 401);
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('입력값이 유효하지 않습니다', 400);
    }

    const { text, fileName } = req.body;

    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!n8nWebhookUrl) {
      throw new AppError('n8n 웹훅 URL이 설정되지 않았습니다', 500);
    }

    // n8n 웹훅 호출
    const n8nResponse = await axios.post(n8nWebhookUrl, {
      filename: fileName || '계약서',
      text: text,
    }, {
      timeout: 60000, // 60초 타임아웃
    });

    // 응답 파싱
    const parsed = n8nResponse.data.parsed || [];

    // 전체 위험도 계산 (RED > ORANGE > YELLOW)
    let overallRisk: 'high' | 'medium' | 'low' = 'low';
    let hasHigh = false;
    for (const clause of parsed) {
      if (clause.risk === 'RED') {
        hasHigh = true;
        break;
      } else if (clause.risk === 'ORANGE') {
        overallRisk = 'medium';
      }
    }
    if (hasHigh) {
      overallRisk = 'high';
    }

    // n8n 결과를 AnalysisResult 형식으로 변환 (모든 정보 포함)
    const analysisResult: AnalysisResult = {
      title: `${fileName || '계약서'} 분석 결과`,
      risk_level: overallRisk,
      summary: parsed.length > 0
        ? `총 ${parsed.length}개의 조항이 분석되었습니다. ${parsed.filter((c: any) => c.risk === 'RED').length}개의 위험 조항이 발견되었습니다.`
        : '분석 결과가 없습니다.',
      risks: parsed.map((clause: any) => ({
        category: clause.name || '일반 조항',
        issue: clause.clause || '',
        severity: clause.risk === 'RED' ? 'high' : clause.risk === 'ORANGE' ? 'medium' : 'low',
        recommendation: clause.easyTranslation || '검토가 필요합니다.',
        summary: clause.summary || [],
        rank: clause.rank || 0,
        originalClause: clause.clause || '',
      })),
      legal_points: parsed
        .filter((c: any) => c.risk === 'RED' || c.risk === 'ORANGE')
        .map((c: any) => c.easyTranslation || c.clause || ''),
      overall_score: overallRisk === 'high' ? 30 : overallRisk === 'medium' ? 60 : 85,
    };

    // DB에 저장 (분석 결과만, 원문은 저장하지 않음)
    const analysis = await AnalysisHistoryModel.create({
      userId: req.user.userId,
      fileName: fileName || '계약서',
      title: `${fileName || '계약서'} 분석 결과`,
      riskLevel: overallRisk,
      analysisResult: analysisResult,
    });

    // 사용 횟수 차감
    await UserModel.decrementRemainingChecks(req.user.userId);

    res.status(201).json({
      success: true,
      message: '분석이 완료되었습니다',
      data: {
        analysis,
        clauses: parsed,
      },
    });
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      next(new AppError(`n8n 웹훅 호출 실패: ${error.message}`, 502));
    } else {
      next(error);
    }
  }
}
