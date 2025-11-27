import { Router, Request, Response, NextFunction } from 'express';
import pool from '../config/database';
import { authenticate, requireAdmin } from '../middleware/auth';
import { ContactMessageModel } from '../models/ContactMessage';
import { AnalysisHistoryModel } from '../models/AnalysisHistory';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

// 대시보드 통계
router.get('/stats', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // 전체 사용자 수
    const userCountResult = await pool.query(
      'SELECT COUNT(*)::int as count FROM users'
    );

    // 오늘 가입한 사용자 수
    const newUsersTodayResult = await pool.query(
      'SELECT COUNT(*)::int as count FROM users WHERE DATE(created_at) = CURRENT_DATE'
    );

    // 전체 분석 수
    const analysisCountResult = await pool.query(
      'SELECT COUNT(*)::int as count FROM analysis_history'
    );

    // 오늘 분석 수
    const analysesTodayResult = await pool.query(
      'SELECT COUNT(*)::int as count FROM analysis_history WHERE DATE(created_at) = CURRENT_DATE'
    );

    // 열린 문의 수
    const openReports = await ContactMessageModel.countByStatus('Open');

    res.json({
      success: true,
      data: {
        totalUsers: userCountResult.rows[0].count,
        newUsersToday: newUsersTodayResult.rows[0].count,
        totalAnalyses: analysisCountResult.rows[0].count,
        analysesToday: analysesTodayResult.rows[0].count,
        openReports,
      },
    });
  } catch (error) {
    next(error);
  }
});

// 최근 사용자 목록
router.get('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    const usersResult = await pool.query(
      `SELECT id, name, email, role, provider, remaining_checks_today, created_at
       FROM users
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const totalCountResult = await pool.query(
      'SELECT COUNT(*)::int as count FROM users'
    );

    res.json({
      success: true,
      data: {
        users: usersResult.rows,
        total: totalCountResult.rows[0].count,
        limit,
        offset,
      },
    });
  } catch (error) {
    next(error);
  }
});

// 최근 분석 이력
router.get('/analyses', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    const analysesResult = await pool.query(
      `SELECT ah.id, ah.user_id, ah.file_name, ah.title, ah.risk_level, ah.created_at, u.name as user_name
       FROM analysis_history ah
       LEFT JOIN users u ON ah.user_id = u.id
       ORDER BY ah.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const totalCountResult = await pool.query(
      'SELECT COUNT(*)::int as count FROM analysis_history'
    );

    // 위험도별 통계
    const riskStats = await AnalysisHistoryModel.getStatsByRiskLevel();

    res.json({
      success: true,
      data: {
        analyses: analysesResult.rows,
        total: totalCountResult.rows[0].count,
        riskStats,
        limit,
        offset,
      },
    });
  } catch (error) {
    next(error);
  }
});

// 문의 목록
router.get('/contacts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const contacts = await ContactMessageModel.findAll(limit, offset);
    const total = await ContactMessageModel.countAll();

    res.json({
      success: true,
      data: {
        contacts,
        total,
        limit,
        offset,
      },
    });
  } catch (error) {
    next(error);
  }
});

// 문의 상태 변경
router.patch('/contacts/:id/status', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Open', 'In Progress', 'Resolved'].includes(status)) {
      res.status(400).json({
        success: false,
        message: '유효하지 않은 상태입니다',
      });
      return;
    }

    const contact = await ContactMessageModel.updateStatus(id, status);

    res.json({
      success: true,
      message: '상태가 변경되었습니다',
      data: { contact },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
