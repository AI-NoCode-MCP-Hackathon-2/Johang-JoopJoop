import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const isExternalConnection = process.env.DATABASE_URL?.includes('.render.com');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isExternalConnection ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
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
