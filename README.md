# 조항줍줍 (Johang-JoopJoop)

AI 기반 근로계약서 사전 점검 서비스

---

## 프로젝트 개요

**조항줍줍**은 사회 초년생, 아르바이트생, 취업 준비생 등 근로계약 경험이 부족한 사람들을 위한 AI 기반 근로계약서 분석 서비스입니다.

근로계약서에 숨어 있는 위험 조항을 사전에 발견하고, 대한민국 근로기준법에 기반한 법률 정보를 쉽게 이해할 수 있도록 돕습니다.

### 문제 인식

- 근로계약서를 처음 접하는 사람들은 어떤 조항이 불리한지 판단하기 어려움
- 법률 용어가 어렵고 전문가 상담 비용이 부담됨
- 계약 체결 후 문제가 발생해도 이미 늦은 경우가 많음

### 해결 방안

- AI를 활용하여 계약서 조항을 자동 분석
- 위험도를 시각적으로 표시 (RED/ORANGE/YELLOW)
- n8n 워크플로우를 통한 효율적인 AI 처리
- 텍스트 하이라이트 기능으로 위험 조항을 시각적으로 강조
- 개인정보 마스킹으로 안전한 분석 환경 제공

---

## 주요 기능

### 1. 근로계약서 AI 분석
- 계약서 파일(PDF, TXT) 업로드
- PDF.js를 활용한 정확한 텍스트 추출
- Private Use Area(PUA) 문자 필터링으로 깨진 문자 방지
- n8n 웹훅을 통한 Google Gemini AI 분석
- 위험(RED), 주의(ORANGE), 양호(YELLOW) 3단계 분류
- 근로기준법 위반 여부 자동 검출
- 조항별 쉬운 해석 및 요약 제공

### 2. 텍스트 하이라이트 뷰어
- 원본 계약서 텍스트에 위험도별 하이라이트 표시
- 정규화된 텍스트 매칭으로 정확한 위치 표시
- 클릭 시 해당 조항의 상세 설명으로 이동
- 반응형 높이로 긴 계약서도 편리하게 확인

### 3. 개인정보 보호
- 이름, 주소, 전화번호, 이메일 자동 마스킹
- 주민등록번호 완전 마스킹
- 금액 정보는 분석을 위해 유지
- 마스킹된 텍스트는 데이터베이스에 저장되어 재사용 가능

### 4. 사용자 계정 관리
- 회원가입/로그인 (JWT 인증)
- 하루 5회 무료 분석 제공 (자정 자동 리셋)
- 분석 이력 저장 및 조회
- 마이페이지에서 이전 분석 결과 확인

### 5. 관리자 대시보드
- 가입자 통계, 분석 현황 모니터링
- 사용자 관리
- 시스템 상태 확인

---

## 기술 스택

### Frontend
| 기술 | 버전 | 용도 |
|------|------|------|
| React | 19.2 | UI 라이브러리 |
| TypeScript | 5.8 | 정적 타입 |
| Vite | 6.2 | 빌드 도구 |
| Tailwind CSS | (CDN) | 스타일링 |
| Lucide React | 0.554 | 아이콘 |
| Axios | 1.13 | HTTP 클라이언트 |
| PDF.js | 3.11.174 | PDF 텍스트 추출 |

### Backend
| 기술 | 버전 | 용도 |
|------|------|------|
| Node.js | 18+ | 런타임 |
| Express | 4.21 | 웹 프레임워크 |
| TypeScript | 5.9 | 정적 타입 |
| MySQL | 8.0 | 데이터베이스 |
| JWT | 9.0 | 인증 토큰 |
| bcrypt | 5.1 | 비밀번호 암호화 |

### AI/ML
| 서비스 | 모델 | 용도 |
|--------|------|------|
| Google Gemini | gemini-2.0-flash-exp | 계약서 조항 분석 |
| n8n | Workflow Automation | AI 분석 파이프라인 |

### 인프라
| 서비스 | 용도 |
|--------|------|
| Naver Cloud | MySQL 데이터베이스 호스팅 |
| n8n Cloud | 웹훅 기반 AI 워크플로우 |

---

## 프로젝트 구조

```
조항줍줍/
├── frontend/                # React 프론트엔드
│   ├── components/          # React 컴포넌트
│   │   ├── AuthContext.tsx         # 인증 상태 관리
│   │   ├── AuthModal.tsx           # 로그인/회원가입 모달
│   │   ├── PreCheckSection.tsx     # 계약서 분석 페이지
│   │   ├── TextHighlightViewer.tsx # 텍스트 하이라이트 뷰어
│   │   ├── AnalysisHistoryContext.tsx # 분석 이력 관리
│   │   ├── MyPage.tsx              # 마이페이지
│   │   ├── AdminDashboardPage.tsx  # 관리자 대시보드
│   │   ├── Navbar.tsx              # 네비게이션 바
│   │   └── ...
│   ├── utils/
│   │   ├── api.ts           # API 클라이언트 설정
│   │   └── masking.ts       # 개인정보 마스킹 유틸리티
│   ├── public/
│   │   └── pdfjs/           # PDF.js CMap 및 폰트 파일
│   ├── App.tsx              # 메인 앱 컴포넌트
│   ├── index.tsx            # 엔트리 포인트
│   └── package.json
│
└── backend/                 # Express 백엔드
    └── src/
        ├── config/
        │   ├── database.ts      # MySQL 연결 설정
        │   └── initDB.ts        # 데이터베이스 초기화
        ├── models/              # 데이터베이스 모델
        │   ├── User.ts
        │   └── AnalysisHistory.ts
        ├── controllers/
        │   ├── authController.ts     # 인증 컨트롤러
        │   ├── analysisController.ts # 분석 컨트롤러
        │   └── userController.ts     # 사용자 컨트롤러
        ├── routes/
        │   ├── authRoutes.ts    # 인증 API
        │   ├── analysisRoutes.ts # 분석 API
        │   └── userRoutes.ts     # 사용자 API
        ├── middleware/
        │   └── auth.ts          # JWT 인증 미들웨어
        ├── utils/
        │   ├── errors.ts        # 에러 핸들링
        │   ├── logger.ts        # 로깅 유틸리티
        │   └── jwt.ts           # JWT 유틸리티
        └── server.ts            # 서버 엔트리 포인트
```

---

## 로컬 실행 방법

### 사전 요구사항
- Node.js 18.0 이상
- MySQL 8.0
- npm 또는 yarn
- n8n 웹훅 URL (또는 자체 워크플로우 설정)

### 1. 저장소 클론

```bash
git clone https://github.com/AI-NoCode-MCP-Hackathon-2/Johang-JoopJoop.git
cd Johang-JoopJoop
```

### 2. 환경 변수 설정

**Backend (.env)**
```env
PORT=5001
NODE_ENV=development

# Database (Naver Cloud MySQL)
DB_HOST=your_mysql_host
DB_PORT=3306
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=johang_joopjoop_db

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d

# Gemini API
GEMINI_API_KEY=your_gemini_api_key

# n8n Webhook
N8N_WEBHOOK_URL=https://n8n.example.com/webhook/your-webhook-id

# CORS
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. 의존성 설치 및 실행

**Backend**
```bash
cd backend
npm install
npm run dev
# http://localhost:5001
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
# http://localhost:3000
```

### 4. 데이터베이스 초기화

백엔드 서버 시작 시 자동으로 데이터베이스와 테이블이 생성됩니다.
관리자 계정도 자동으로 생성됩니다:
- 이메일: admin@johangjoopjoop.com
- 비밀번호: admin1234!

---

## 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│                    React + TypeScript + Vite                 │
│                         PDF.js                               │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
            ┌─────────────────┐
            │  Backend API    │
            │  (Express.js)   │
            │  Port: 5001     │
            └────────┬────────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
         ▼           ▼           ▼
┌─────────────┐  ┌──────────┐  ┌────────────┐
│  MySQL      │  │  n8n     │  │  Gemini AI │
│  (Naver)    │  │  Webhook │  │  API       │
│  - Users    │  │          │  └────────────┘
│  - Analysis │  └──────────┘
│  - History  │
└─────────────┘
```

---

## 주요 구현 사항

### PDF 텍스트 추출

- PDF.js를 사용하여 클라이언트에서 직접 텍스트 추출
- CMap 및 표준 폰트 파일 포함으로 한글 지원 강화
- Private Use Area(PUA, 0xE000-0xF8FF) 문자 필터링
- 80% 이상 깨진 텍스트는 자동 제거
- Y 좌표 기반 줄바꿈 처리로 레이아웃 보존

### 개인정보 마스킹

정규식 기반 마스킹으로 개인정보 보호:
- 주민등록번호: `******-*******`
- 전화번호: `***-****-****`
- 이메일: `***@***.***`
- 주소: `서울시 ○○동` (시/도는 유지, 구체적 정보 마스킹)
- 이름: `성명: ○○○`
- 날짜: `YYYY년 MM월 DD일`
- 계좌번호: `******` (금액은 마스킹하지 않음)

### 텍스트 하이라이트

- 정규화된 텍스트 매칭 (공백 제거, 소문자 변환)
- 원본 텍스트 인덱스 매핑으로 정확한 위치 표시
- 위험도별 색상 구분 (RED/ORANGE/YELLOW)
- 클릭 시 해당 조항 상세 정보 표시
- Pulse 애니메이션으로 활성 조항 강조

### n8n 워크플로우

1. 프론트엔드에서 마스킹된 텍스트를 백엔드로 전송
2. 백엔드가 n8n 웹훅으로 분석 요청
3. n8n이 Gemini AI에 분석 의뢰
4. 구조화된 JSON 결과를 반환
5. 백엔드가 결과를 데이터베이스에 저장
6. 프론트엔드가 하이라이트 뷰어로 표시

### 보안

- JWT 기반 인증 (Access Token + Refresh Token)
- bcrypt 비밀번호 암호화 (Salt 10 rounds)
- 환경 변수로 민감 정보 관리
- CORS 설정으로 허용된 Origin만 접근
- Rate Limiting으로 API 남용 방지
- SQL Injection 방지 (Parameterized Queries)

---

## API 명세

### 인증 API

| Method | Endpoint | 설명 | 인증 필요 |
|--------|----------|------|----------|
| POST | /api/auth/signup | 회원가입 | X |
| POST | /api/auth/login | 로그인 | X |
| GET | /api/auth/me | 현재 사용자 정보 | O |
| POST | /api/auth/refresh | 토큰 갱신 | O |

### 분석 API

| Method | Endpoint | 설명 | 인증 필요 |
|--------|----------|------|----------|
| POST | /api/analysis | 계약서 분석 요청 | O |
| GET | /api/analysis/history | 분석 이력 조회 | O |
| GET | /api/analysis/:id | 특정 분석 결과 조회 | O |
| DELETE | /api/analysis/:id | 분석 결과 삭제 | O |

### 사용자 API

| Method | Endpoint | 설명 | 인증 필요 |
|--------|----------|------|----------|
| GET | /api/user/profile | 프로필 조회 | O |
| PUT | /api/user/profile | 프로필 수정 | O |
| PUT | /api/user/password | 비밀번호 변경 | O |
| DELETE | /api/user/account | 계정 삭제 | O |

### 관리자 API

| Method | Endpoint | 설명 | 인증 필요 |
|--------|----------|------|----------|
| GET | /api/admin/dashboard | 대시보드 통계 | O (Admin) |
| GET | /api/admin/users | 사용자 목록 조회 | O (Admin) |

---

## 데이터베이스 스키마

### users 테이블
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  remaining_checks_today INT DEFAULT 5,
  last_check_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### analysis_history 테이블
```sql
CREATE TABLE analysis_history (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  file_name VARCHAR(255),
  masked_text TEXT,
  analysis_result JSON,
  risk_level ENUM('LOW', 'MEDIUM', 'HIGH') DEFAULT 'LOW',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 발표 자료

프로젝트 발표 자료는 다음 파일에서 확인하실 수 있습니다:

**[아차싶더라구요..._발표 PPT.pdf](./아차싶더라구요..._발표%20PPT.pdf)**

발표 자료에는 다음 내용이 포함되어 있습니다:
- 프로젝트 배경 및 문제 정의
- 솔루션 개요 및 주요 기능
- 기술 스택 및 시스템 아키텍처
- 시연 화면 및 주요 기능 설명
- 향후 계획 및 개선 방향

---

## 팀 정보

**팀명**: 아차 싶더라구요...

| 이름 | 역할 |
|------|------|
| 송민지 | 팀장 |
| 김현웅 | 팀원 |
| 강지나 | 팀원 |
| 신주용 | 팀원 |

---

## 라이선스

MIT License

---

## 법적 고지

본 서비스는 근로계약서에 대한 일반적인 정보 제공을 목적으로 하며, 법률 자문을 대체하지 않습니다.

AI 분석 결과는 참고용이며 법적 효력이 없습니다. 구체적인 법률 문제는 반드시 공인노무사, 변호사 등 전문가와 상담하시기 바랍니다.

노동 관련 문의: 고용노동부 상담센터 1350
