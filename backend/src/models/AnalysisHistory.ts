import pool from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { AnalysisResult } from '../services/geminiService';

export interface AnalysisHistory {
  id: string;
  user_id: string;
  file_name: string;
  masked_text?: string;
  title: string;
  risk_level: 'low' | 'medium' | 'high';
  analysis_result: AnalysisResult;
  created_at: Date;
}

export interface CreateAnalysisData {
  userId: string;
  fileName: string;
  maskedText?: string;
  title: string;
  riskLevel: 'low' | 'medium' | 'high';
  analysisResult: AnalysisResult;
}

export class AnalysisHistoryModel {
  static async create(data: CreateAnalysisData): Promise<AnalysisHistory> {
    const id = uuidv4();

    const result = await pool.query(
      `INSERT INTO analysis_history (id, user_id, file_name, masked_text, title, risk_level, analysis_result)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        id,
        data.userId,
        data.fileName,
        data.maskedText || null,
        data.title,
        data.riskLevel,
        JSON.stringify(data.analysisResult),
      ]
    );

    if (result.rows.length === 0) {
      throw new Error('분석 이력 저장에 실패했습니다');
    }

    const row = result.rows[0];
    return {
      ...row,
      analysis_result:
        typeof row.analysis_result === 'string'
          ? JSON.parse(row.analysis_result)
          : row.analysis_result,
    };
  }

  static async findById(id: string): Promise<AnalysisHistory | null> {
    const result = await pool.query(
      'SELECT * FROM analysis_history WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      ...row,
      analysis_result:
        typeof row.analysis_result === 'string'
          ? JSON.parse(row.analysis_result)
          : row.analysis_result,
    };
  }

  static async findByUserId(
    userId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<AnalysisHistory[]> {
    const result = await pool.query(
      `SELECT * FROM analysis_history
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return result.rows.map((row: any) => ({
      ...row,
      analysis_result:
        typeof row.analysis_result === 'string'
          ? JSON.parse(row.analysis_result)
          : row.analysis_result,
    }));
  }

  static async countByUserId(userId: string): Promise<number> {
    const result = await pool.query(
      'SELECT COUNT(*)::int as count FROM analysis_history WHERE user_id = $1',
      [userId]
    );
    return result.rows[0].count;
  }

  static async delete(id: string, userId: string): Promise<void> {
    const result = await pool.query(
      'DELETE FROM analysis_history WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rowCount === 0) {
      throw new Error('분석 이력 삭제에 실패했습니다');
    }
  }

  static async getAllRecent(limit: number = 10): Promise<AnalysisHistory[]> {
    const result = await pool.query(
      `SELECT * FROM analysis_history
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows.map((row: any) => ({
      ...row,
      analysis_result:
        typeof row.analysis_result === 'string'
          ? JSON.parse(row.analysis_result)
          : row.analysis_result,
    }));
  }

  static async getStatsByRiskLevel(): Promise<{
    low: number;
    medium: number;
    high: number;
  }> {
    const result = await pool.query(
      `SELECT risk_level, COUNT(*)::int as count
       FROM analysis_history
       GROUP BY risk_level`
    );

    const stats = { low: 0, medium: 0, high: 0 };
    result.rows.forEach((row: any) => {
      stats[row.risk_level as 'low' | 'medium' | 'high'] = row.count;
    });

    return stats;
  }
}
