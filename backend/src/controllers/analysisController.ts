import { Request, Response, NextFunction } from 'express';
import { AnalysisHistoryModel } from '../models/AnalysisHistory';
import { AppError } from '../utils/errors';
import { UserModel } from '../models/User';
import { validationResult } from 'express-validator';
import { analyzeContract as analyzeWithGemini } from '../services/geminiService';

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
