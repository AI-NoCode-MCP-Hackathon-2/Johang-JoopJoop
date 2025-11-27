import pool from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface ContactMessage {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  created_at: Date;
  updated_at: Date;
}

export interface CreateContactData {
  userId?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
}

export class ContactMessageModel {
  static async create(data: CreateContactData): Promise<ContactMessage> {
    const id = uuidv4();

    const result = await pool.query(
      `INSERT INTO contact_messages (id, user_id, name, email, subject, message, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'Open')
       RETURNING *`,
      [id, data.userId || null, data.name, data.email, data.subject, data.message]
    );

    if (result.rows.length === 0) {
      throw new Error('문의 등록에 실패했습니다');
    }

    return result.rows[0];
  }

  static async findById(id: string): Promise<ContactMessage | null> {
    const result = await pool.query(
      'SELECT * FROM contact_messages WHERE id = $1',
      [id]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  static async findAll(limit: number = 50, offset: number = 0): Promise<ContactMessage[]> {
    const result = await pool.query(
      `SELECT * FROM contact_messages
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  static async countAll(): Promise<number> {
    const result = await pool.query(
      'SELECT COUNT(*)::int as count FROM contact_messages'
    );
    return result.rows[0].count;
  }

  static async countByStatus(status: ContactMessage['status']): Promise<number> {
    const result = await pool.query(
      'SELECT COUNT(*)::int as count FROM contact_messages WHERE status = $1',
      [status]
    );
    return result.rows[0].count;
  }

  static async updateStatus(id: string, status: ContactMessage['status']): Promise<ContactMessage> {
    const result = await pool.query(
      'UPDATE contact_messages SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      throw new Error('문의 상태 변경에 실패했습니다');
    }

    return result.rows[0];
  }

  static async delete(id: string): Promise<void> {
    const result = await pool.query(
      'DELETE FROM contact_messages WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      throw new Error('문의 삭제에 실패했습니다');
    }
  }
}
