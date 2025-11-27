import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

export async function testConnection(): Promise<void> {
  try {
    const client = await pool.connect();
    console.log('PostgreSQL 데이터베이스 연결 성공');
    client.release();
  } catch (error) {
    console.error('PostgreSQL 데이터베이스 연결 실패:', error);
    throw error;
  }
}

export default pool;
