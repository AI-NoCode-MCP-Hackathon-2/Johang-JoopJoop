import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import pool from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { AnalysisResult } from '../services/geminiService';

export interface AnalysisHistory {
  id: string;
  user_id: string;
  file_name: string;
  title: string;
  risk_level: 'low' | 'medium' | 'high';
  analysis_result: AnalysisResult;
  created_at: Date;
}

export interface CreateAnalysisData {
  userId: string;
  fileName: string;
  title: string;
  riskLevel: 'low' | 'medium' | 'high';
  analysisResult: AnalysisResult;
}

export class AnalysisHistoryModel {
  static async create(data: CreateAnalysisData): Promise<AnalysisHistory> {
    const id = uuidv4();

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO analysis_history (id, user_id, file_name, title, risk_level, analysis_result)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.userId,
        data.fileName,
        data.title,
        data.riskLevel,
        JSON.stringify(data.analysisResult),
      ]
    );

    if (result.affectedRows === 0) {
      throw new Error('분석 이력 저장에 실패했습니다');
    }

    const analysis = await this.findById(id);
    if (!analysis) {
      throw new Error('저장된 분석 이력을 찾을 수 없습니다');
    }

    return analysis;
  }

  static async findById(id: string): Promise<AnalysisHistory | null> {
    const [rows] = await pool.query<(AnalysisHistory & RowDataPacket)[]>(
      'SELECT * FROM analysis_history WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
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
    const [rows] = await pool.query<(AnalysisHistory & RowDataPacket)[]>(
      `SELECT * FROM analysis_history
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    return rows.map((row) => ({
      ...row,
      analysis_result:
        typeof row.analysis_result === 'string'
          ? JSON.parse(row.analysis_result)
          : row.analysis_result,
    }));
  }

  static async countByUserId(userId: string): Promise<number> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM analysis_history WHERE user_id = ?',
      [userId]
    );
    return rows[0].count;
  }

  static async delete(id: string, userId: string): Promise<void> {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM analysis_history WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (result.affectedRows === 0) {
      throw new Error('분석 이력 삭제에 실패했습니다');
    }
  }

  static async getAllRecent(limit: number = 10): Promise<AnalysisHistory[]> {
    const [rows] = await pool.query<(AnalysisHistory & RowDataPacket)[]>(
      `SELECT * FROM analysis_history
       ORDER BY created_at DESC
       LIMIT ?`,
      [limit]
    );

    return rows.map((row) => ({
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
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT risk_level, COUNT(*) as count
       FROM analysis_history
       GROUP BY risk_level`
    );

    const stats = { low: 0, medium: 0, high: 0 };
    rows.forEach((row) => {
      stats[row.risk_level as 'low' | 'medium' | 'high'] = row.count;
    });

    return stats;
  }
}
