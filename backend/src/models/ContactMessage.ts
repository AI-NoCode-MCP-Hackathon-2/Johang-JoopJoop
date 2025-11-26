import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
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

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO contact_messages (id, user_id, name, email, subject, message, status)
       VALUES (?, ?, ?, ?, ?, ?, 'Open')`,
      [id, data.userId || null, data.name, data.email, data.subject, data.message]
    );

    if (result.affectedRows === 0) {
      throw new Error('문의 등록에 실패했습니다');
    }

    const contact = await this.findById(id);
    if (!contact) {
      throw new Error('등록된 문의를 찾을 수 없습니다');
    }

    return contact;
  }

  static async findById(id: string): Promise<ContactMessage | null> {
    const [rows] = await pool.query<(ContactMessage & RowDataPacket)[]>(
      'SELECT * FROM contact_messages WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  static async findAll(limit: number = 50, offset: number = 0): Promise<ContactMessage[]> {
    const [rows] = await pool.query<(ContactMessage & RowDataPacket)[]>(
      `SELECT * FROM contact_messages
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return rows;
  }

  static async countAll(): Promise<number> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM contact_messages'
    );
    return rows[0].count;
  }

  static async countByStatus(status: ContactMessage['status']): Promise<number> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM contact_messages WHERE status = ?',
      [status]
    );
    return rows[0].count;
  }

  static async updateStatus(id: string, status: ContactMessage['status']): Promise<ContactMessage> {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE contact_messages SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      throw new Error('문의 상태 변경에 실패했습니다');
    }

    const contact = await this.findById(id);
    if (!contact) {
      throw new Error('문의를 찾을 수 없습니다');
    }

    return contact;
  }

  static async delete(id: string): Promise<void> {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM contact_messages WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      throw new Error('문의 삭제에 실패했습니다');
    }
  }
}
