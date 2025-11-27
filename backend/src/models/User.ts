import pool from '../config/database';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash?: string;
  provider: 'email' | 'google' | 'kakao' | 'naver';
  role: 'user' | 'admin';
  remaining_checks_today: number;
  last_check_date: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  name: string;
  email: string;
  password?: string;
  provider?: 'email' | 'google' | 'kakao' | 'naver';
  role?: 'user' | 'admin';
}

export class UserModel {
  static async findById(id: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  static async create(userData: CreateUserData): Promise<User> {
    const id = uuidv4();
    const provider = userData.provider || 'email';
    const role = userData.role || 'user';

    let passwordHash: string | null = null;
    if (userData.password) {
      passwordHash = await bcrypt.hash(userData.password, 10);
    }

    const result = await pool.query(
      `INSERT INTO users (id, name, email, password_hash, provider, role, remaining_checks_today, last_check_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE)
       RETURNING *`,
      [id, userData.name, userData.email, passwordHash, provider, role, 5]
    );

    if (result.rows.length === 0) {
      throw new Error('사용자 생성에 실패했습니다');
    }

    return result.rows[0];
  }

  static async updatePassword(userId: string, newPassword: string): Promise<void> {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const result = await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [passwordHash, userId]
    );

    if (result.rowCount === 0) {
      throw new Error('비밀번호 변경에 실패했습니다');
    }
  }

  static async updateProfile(userId: string, name: string): Promise<User> {
    const result = await pool.query(
      'UPDATE users SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [name, userId]
    );

    if (result.rows.length === 0) {
      throw new Error('프로필 수정에 실패했습니다');
    }

    return result.rows[0];
  }

  static async delete(userId: string): Promise<void> {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1',
      [userId]
    );

    if (result.rowCount === 0) {
      throw new Error('사용자 삭제에 실패했습니다');
    }
  }

  static async verifyPassword(user: User, password: string): Promise<boolean> {
    if (!user.password_hash) {
      return false;
    }
    return bcrypt.compare(password, user.password_hash);
  }

  static async decrementRemainingChecks(userId: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const result = await client.query(
        'SELECT * FROM users WHERE id = $1 FOR UPDATE',
        [userId]
      );

      if (result.rows.length === 0) {
        throw new Error('사용자를 찾을 수 없습니다');
      }

      const user = result.rows[0];
      const today = new Date().toISOString().split('T')[0];
      const lastCheckDate = user.last_check_date
        ? new Date(user.last_check_date).toISOString().split('T')[0]
        : null;

      if (lastCheckDate !== today) {
        await client.query(
          'UPDATE users SET remaining_checks_today = $1, last_check_date = CURRENT_DATE WHERE id = $2',
          [4, userId]
        );
      } else {
        if (user.remaining_checks_today <= 0) {
          throw new Error('오늘의 분석 횟수를 모두 사용했습니다');
        }
        await client.query(
          'UPDATE users SET remaining_checks_today = remaining_checks_today - 1 WHERE id = $1',
          [userId]
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getRemainingChecks(userId: string): Promise<number> {
    const result = await pool.query(
      'SELECT remaining_checks_today, last_check_date FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('사용자를 찾을 수 없습니다');
    }

    const user = result.rows[0];
    const today = new Date().toISOString().split('T')[0];
    const lastCheckDate = user.last_check_date
      ? new Date(user.last_check_date).toISOString().split('T')[0]
      : null;

    if (lastCheckDate !== today) {
      return 5;
    }

    return user.remaining_checks_today;
  }
}
