import pool from './database';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

export async function initializeDatabase(): Promise<void> {
  const client = await pool.connect();

  try {
    console.log('[INFO] 테이블 생성 시작...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        provider VARCHAR(20) NOT NULL DEFAULT 'email',
        role VARCHAR(20) NOT NULL DEFAULT 'user',
        remaining_checks_today INT NOT NULL DEFAULT 5,
        last_check_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_email ON users(email);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_role ON users(role);
    `);

    console.log('[SUCCESS] users 테이블 생성 완료');

    await client.query(`
      CREATE TABLE IF NOT EXISTS analysis_history (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        title VARCHAR(500),
        risk_level VARCHAR(20) NOT NULL,
        analysis_result JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_id ON analysis_history(user_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_created_at ON analysis_history(created_at);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_risk_level ON analysis_history(risk_level);
    `);

    console.log('[SUCCESS] analysis_history 테이블 생성 완료');

    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_token ON sessions(token);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_id_sessions ON sessions(user_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_expires_at ON sessions(expires_at);
    `);

    console.log('[SUCCESS] sessions 테이블 생성 완료');

    await client.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36),
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(500) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'Open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_status ON contact_messages(status);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_created_at_contact ON contact_messages(created_at);
    `);

    console.log('[SUCCESS] contact_messages 테이블 생성 완료');

    const adminExists = await client.query(
      `SELECT id FROM users WHERE email = $1 LIMIT 1`,
      ['admin@johangjoopjoop.com']
    );

    if (adminExists.rows.length === 0) {
      const adminId = uuidv4();
      const hashedPassword = await bcrypt.hash('admin123!@#', 10);

      await client.query(
        `INSERT INTO users (id, name, email, password_hash, provider, role, remaining_checks_today, last_check_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE)`,
        [adminId, '관리자', 'admin@johangjoopjoop.com', hashedPassword, 'email', 'admin', 999]
      );
      console.log('[SUCCESS] 관리자 계정 생성 완료');
      console.log('   이메일: admin@johangjoopjoop.com');
      console.log('   비밀번호: admin123!@#');
    } else {
      console.log('ℹ️  관리자 계정이 이미 존재합니다');
    }

    console.log('[SUCCESS] 데이터베이스 초기화 완료!');
  } catch (error) {
    console.error('[ERROR] 데이터베이스 초기화 실패:', error);
    throw error;
  } finally {
    client.release();
  }
}
