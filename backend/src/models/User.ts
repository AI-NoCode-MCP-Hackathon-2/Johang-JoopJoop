import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
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
    const [rows] = await pool.query<(User & RowDataPacket)[]>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const [rows] = await pool.query<(User & RowDataPacket)[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  static async create(userData: CreateUserData): Promise<User> {
    const id = uuidv4();
    const provider = userData.provider || 'email';
    const role = userData.role || 'user';

    let passwordHash: string | null = null;
    if (userData.password) {
      passwordHash = await bcrypt.hash(userData.password, 10);
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO users (id, name, email, password_hash, provider, role, remaining_checks_today, last_check_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())`,
      [id, userData.name, userData.email, passwordHash, provider, role, 5]
    );

    if (result.affectedRows === 0) {
      throw new Error('사용자 생성에 실패했습니다');
    }

    const user = await this.findById(id);
    if (!user) {
      throw new Error('생성된 사용자를 찾을 수 없습니다');
    }

    return user;
  }

  static async updatePassword(userId: string, newPassword: string): Promise<void> {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [passwordHash, userId]
    );

    if (result.affectedRows === 0) {
      throw new Error('비밀번호 변경에 실패했습니다');
    }
  }

  static async updateProfile(userId: string, name: string): Promise<User> {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE users SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, userId]
    );

    if (result.affectedRows === 0) {
      throw new Error('프로필 수정에 실패했습니다');
    }

    const user = await this.findById(userId);
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다');
    }

    return user;
  }

  static async delete(userId: string): Promise<void> {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM users WHERE id = ?',
      [userId]
    );

    if (result.affectedRows === 0) {
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
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [users] = await connection.query<(User & RowDataPacket)[]>(
        'SELECT * FROM users WHERE id = ? FOR UPDATE',
        [userId]
      );

      if (users.length === 0) {
        throw new Error('사용자를 찾을 수 없습니다');
      }

      const user = users[0];
      const today = new Date().toISOString().split('T')[0];
      const lastCheckDate = user.last_check_date
        ? new Date(user.last_check_date).toISOString().split('T')[0]
        : null;

      if (lastCheckDate !== today) {
        await connection.query(
          'UPDATE users SET remaining_checks_today = ?, last_check_date = CURDATE() WHERE id = ?',
          [4, userId]
        );
      } else {
        if (user.remaining_checks_today <= 0) {
          throw new Error('오늘의 분석 횟수를 모두 사용했습니다');
        }
        await connection.query(
          'UPDATE users SET remaining_checks_today = remaining_checks_today - 1 WHERE id = ?',
          [userId]
        );
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getRemainingChecks(userId: string): Promise<number> {
    const [users] = await pool.query<(User & RowDataPacket)[]>(
      'SELECT remaining_checks_today, last_check_date FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      throw new Error('사용자를 찾을 수 없습니다');
    }

    const user = users[0];
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
