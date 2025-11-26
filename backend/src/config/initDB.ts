import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

export async function initializeDatabase(): Promise<void> {
  try {
    // 데이터베이스 지정 없이 연결 (데이터베이스 생성을 위해)
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    console.log('[INFO] 데이터베이스 생성 시작...');

    // 데이터베이스 생성
    await connection.query(`
      CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}
      CHARACTER SET utf8mb4
      COLLATE utf8mb4_unicode_ci;
    `);
    console.log(`[SUCCESS] 데이터베이스 '${process.env.DB_NAME}' 생성 완료`);

    // 생성한 데이터베이스 선택
    await connection.query(`USE ${process.env.DB_NAME};`);
    console.log('[INFO] 테이블 생성 시작...');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        provider ENUM('email', 'google', 'kakao', 'naver') NOT NULL DEFAULT 'email',
        role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
        remaining_checks_today INT NOT NULL DEFAULT 5,
        last_check_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('[SUCCESS] users 테이블 생성 완료');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS analysis_history (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        title VARCHAR(500),
        risk_level ENUM('low', 'medium', 'high') NOT NULL,
        analysis_result JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_created_at (created_at),
        INDEX idx_risk_level (risk_level)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('[SUCCESS] analysis_history 테이블 생성 완료');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_token (token),
        INDEX idx_user_id (user_id),
        INDEX idx_expires_at (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('[SUCCESS] sessions 테이블 생성 완료');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36),
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(500) NOT NULL,
        message TEXT NOT NULL,
        status ENUM('Open', 'In Progress', 'Resolved') NOT NULL DEFAULT 'Open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('[SUCCESS] contact_messages 테이블 생성 완료');

    const [adminExists] = await connection.query<any[]>(
      `SELECT id FROM users WHERE email = ? LIMIT 1`,
      ['admin@johangjoopjoop.com']
    );

    if (!adminExists || adminExists.length === 0) {
      const adminId = uuidv4();
      const hashedPassword = await bcrypt.hash('admin123!@#', 10);

      await connection.query(
        `INSERT INTO users (id, name, email, password_hash, provider, role, remaining_checks_today, last_check_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())`,
        [adminId, '관리자', 'admin@johangjoopjoop.com', hashedPassword, 'email', 'admin', 999]
      );
      console.log('[SUCCESS] 관리자 계정 생성 완료');
      console.log('   이메일: admin@johangjoopjoop.com');
      console.log('   비밀번호: admin123!@#');
    } else {
      console.log('ℹ️  관리자 계정이 이미 존재합니다');
    }

    await connection.end();
    console.log('[SUCCESS] 데이터베이스 초기화 완료!');
  } catch (error) {
    console.error('[ERROR] 데이터베이스 초기화 실패:', error);
    throw error;
  }
}
