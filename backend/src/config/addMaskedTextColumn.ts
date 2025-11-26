import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export async function addMaskedTextColumn(): Promise<void> {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('📦 masked_text 컬럼 추가 시작...');

    // Check if column already exists
    const [columns] = await connection.query<any[]>(
      `SHOW COLUMNS FROM analysis_history LIKE 'masked_text'`
    );

    if (columns.length > 0) {
      console.log('ℹ️  masked_text 컬럼이 이미 존재합니다');
      await connection.end();
      return;
    }

    // Add masked_text column after file_name
    await connection.query(`
      ALTER TABLE analysis_history
      ADD COLUMN masked_text TEXT AFTER file_name;
    `);

    console.log('✅ masked_text 컬럼 추가 완료!');
    console.log('   - 위치: file_name 다음');
    console.log('   - 타입: TEXT');
    console.log('   - 용도: 마스킹된 계약서 텍스트 저장');

    await connection.end();
  } catch (error) {
    console.error('❌ masked_text 컬럼 추가 실패:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  addMaskedTextColumn()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
