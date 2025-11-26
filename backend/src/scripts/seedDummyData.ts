import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

async function seedDummyData(): Promise<void> {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  console.log('🌱 더미 데이터 삽입 시작...\n');

  try {
    // 1. 더미 사용자 생성
    console.log('👤 사용자 데이터 생성 중...');
    const users = [
      { id: uuidv4(), name: '김철수', email: 'chulsoo@example.com', provider: 'email' },
      { id: uuidv4(), name: '이영희', email: 'younghee@example.com', provider: 'google' },
      { id: uuidv4(), name: '박민수', email: 'minsu@example.com', provider: 'kakao' },
      { id: uuidv4(), name: '정수진', email: 'sujin@example.com', provider: 'naver' },
      { id: uuidv4(), name: '최동현', email: 'donghyun@example.com', provider: 'email' },
    ];

    const hashedPassword = await bcrypt.hash('Test1234!@#', 10);

    for (const user of users) {
      try {
        await connection.query(
          `INSERT INTO users (id, name, email, password_hash, provider, role, remaining_checks_today, last_check_date)
           VALUES (?, ?, ?, ?, ?, 'user', ?, CURDATE())
           ON DUPLICATE KEY UPDATE name = name`,
          [user.id, user.name, user.email, hashedPassword, user.provider, Math.floor(Math.random() * 5) + 1]
        );
        console.log(`  ✅ ${user.name} (${user.email})`);
      } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`  ⚠️ ${user.email} 이미 존재`);
        } else {
          throw err;
        }
      }
    }

    // 기존 사용자 ID 조회 (분석 이력 생성용)
    const [existingUsers] = await connection.query<any[]>(
      `SELECT id, name FROM users WHERE role = 'user' LIMIT 5`
    );

    // 2. 분석 이력 생성
    console.log('\n📊 분석 이력 데이터 생성 중...');
    const riskLevels = ['low', 'medium', 'high'];
    const contractTitles = [
      '2024년 정규직 근로계약서',
      '파트타임 근로계약서',
      '프리랜서 용역 계약서',
      '인턴십 계약서',
      '단기 아르바이트 계약서',
      '재택근무 근로계약서',
      '계약직 고용 계약서',
    ];

    const analysisResults = {
      low: {
        summary: '전반적으로 양호한 계약서입니다.',
        highlights: [
          { type: 'positive', text: '근로시간이 법정 기준을 준수합니다.' },
          { type: 'positive', text: '최저임금 이상의 급여가 명시되어 있습니다.' },
        ],
        warnings: [],
        recommendations: ['계약서 사본을 반드시 보관하세요.'],
      },
      medium: {
        summary: '일부 조항에 주의가 필요합니다.',
        highlights: [
          { type: 'positive', text: '기본 근로조건이 명시되어 있습니다.' },
        ],
        warnings: [
          { type: 'warning', text: '초과근무 수당에 대한 명시가 불분명합니다.' },
          { type: 'warning', text: '휴가 규정이 모호하게 작성되어 있습니다.' },
        ],
        recommendations: ['초과근무 수당 계산 방식을 명확히 확인하세요.'],
      },
      high: {
        summary: '주의가 필요한 조항이 다수 발견되었습니다.',
        highlights: [],
        warnings: [
          { type: 'danger', text: '과도한 위약금 조항이 포함되어 있습니다.' },
          { type: 'danger', text: '일방적인 계약 해지 조항이 있습니다.' },
          { type: 'warning', text: '근로시간이 법정 기준을 초과합니다.' },
        ],
        recommendations: [
          '노동청 상담을 권장드립니다.',
          '계약 체결 전 전문가 검토를 받으세요.',
        ],
      },
    };

    if (existingUsers.length > 0) {
      for (let i = 0; i < 15; i++) {
        const user = existingUsers[Math.floor(Math.random() * existingUsers.length)];
        const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)] as 'low' | 'medium' | 'high';
        const title = contractTitles[Math.floor(Math.random() * contractTitles.length)];
        const daysAgo = Math.floor(Math.random() * 30);

        await connection.query(
          `INSERT INTO analysis_history (id, user_id, file_name, title, risk_level, analysis_result, created_at)
           VALUES (?, ?, ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY))`,
          [
            uuidv4(),
            user.id,
            `contract_${Date.now()}_${i}.pdf`,
            title,
            riskLevel,
            JSON.stringify(analysisResults[riskLevel]),
            daysAgo,
          ]
        );
        console.log(`  ✅ ${title} (${riskLevel}) - ${user.name}`);
      }
    }

    // 3. 문의 메시지 생성
    console.log('\n💬 문의 메시지 데이터 생성 중...');
    const contactMessages = [
      {
        name: '홍길동',
        email: 'hong@example.com',
        subject: '서비스 이용 문의',
        message: '서비스 이용 방법에 대해 자세히 알고 싶습니다. 특히 분석 기능의 정확도가 궁금합니다.',
        status: 'Open',
        daysAgo: 0,
      },
      {
        name: '김영수',
        email: 'kim@example.com',
        subject: '기능 제안',
        message: 'PDF 외에도 워드 파일 분석 기능을 추가해주시면 좋겠습니다. 많은 회사에서 워드 형식으로 계약서를 보내주거든요.',
        status: 'In Progress',
        daysAgo: 2,
      },
      {
        name: '이수연',
        email: 'lee@example.com',
        subject: '오류·버그 신고',
        message: '분석 결과 페이지에서 새로고침하면 결과가 사라지는 문제가 있습니다. 확인 부탁드립니다.',
        status: 'Open',
        daysAgo: 1,
      },
      {
        name: '박지민',
        email: 'park@example.com',
        subject: '제휴 문의',
        message: '저희 회사에서 조항줍줍 서비스를 도입하고 싶습니다. 기업용 요금제나 API 연동에 대해 상담 가능할까요?',
        status: 'In Progress',
        daysAgo: 3,
      },
      {
        name: '최민호',
        email: 'choi@example.com',
        subject: '서비스 이용 문의',
        message: '하루 분석 횟수 제한이 있나요? 무료 버전과 유료 버전의 차이점이 궁금합니다.',
        status: 'Resolved',
        daysAgo: 7,
      },
      {
        name: '정다은',
        email: 'jung@example.com',
        subject: '기타',
        message: '서비스 정말 유용하게 잘 쓰고 있습니다! 앞으로도 좋은 기능 많이 추가해주세요. 응원합니다!',
        status: 'Resolved',
        daysAgo: 5,
      },
    ];

    for (const contact of contactMessages) {
      await connection.query(
        `INSERT INTO contact_messages (id, name, email, subject, message, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY))`,
        [
          uuidv4(),
          contact.name,
          contact.email,
          contact.subject,
          contact.message,
          contact.status,
          contact.daysAgo,
        ]
      );
      console.log(`  ✅ ${contact.name}: ${contact.subject} (${contact.status})`);
    }

    console.log('\n🎉 더미 데이터 삽입 완료!');

    // 통계 출력
    const [userCount] = await connection.query<any[]>('SELECT COUNT(*) as count FROM users');
    const [analysisCount] = await connection.query<any[]>('SELECT COUNT(*) as count FROM analysis_history');
    const [contactCount] = await connection.query<any[]>('SELECT COUNT(*) as count FROM contact_messages');

    console.log('\n📈 데이터 통계:');
    console.log(`  - 전체 사용자: ${userCount[0].count}명`);
    console.log(`  - 분석 이력: ${analysisCount[0].count}건`);
    console.log(`  - 문의 메시지: ${contactCount[0].count}건`);

  } catch (error) {
    console.error('❌ 더미 데이터 삽입 실패:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

seedDummyData()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
