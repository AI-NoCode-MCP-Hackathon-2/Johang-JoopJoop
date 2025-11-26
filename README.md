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
- 위험도를 시각적으로 표시 (위험/주의/양호)
- RAG(Retrieval-Augmented Generation) 기반 챗봇으로 근로법 관련 질문에 정확한 답변 제공
- 법률 용어를 쉬운 말로 풀어서 설명

---

## 주요 기능

### 1. 근로계약서 AI 분석
- 계약서 파일(PDF, TXT 등) 업로드
- Google Gemini AI를 활용한 조항별 위험도 분석
- 위험(RED), 주의(ORANGE), 양호(GREEN) 3단계 분류
- 근로기준법 위반 여부 자동 검출
- 분석 결과 3줄 요약 제공

### 2. RAG 기반 법률 상담 챗봇
- 근로기준법, 표준 근로계약서 등 법률 문서 기반 답변
- OpenAI 임베딩 + FAISS 벡터 검색으로 정확한 정보 검색
- Gemini AI 폴백으로 RAG에서 찾지 못한 질문도 처리
- 할루시네이션 방지를 위한 엄격한 프롬프트 설계

### 3. 사용자 계정 관리
- 회원가입/로그인 (이메일, 소셜 로그인)
- 하루 5회 무료 분석 제공 (자정 자동 리셋)
- 분석 이력 저장 및 조회
- 프로필 수정, 비밀번호 변경, 계정 삭제

### 4. 관리자 대시보드
- 가입자 통계, 분석 현황 모니터링
- 사용자 관리 및 신고 처리
- API 사용량 및 비용 모니터링 (Mock)

### 5. 부가 기능
- 전문가 연결 및 공공기관 안내 (고용노동부, 노동청 등)
- 요금제 안내 페이지
- 반응형 웹 디자인 (모바일, 태블릿, 데스크톱)

---

## 기술 스택

### Frontend
| 기술 | 버전 | 용도 |
|------|------|------|
| React | 19.2 | UI 라이브러리 |
| TypeScript | 5.8 | 정적 타입 |
| Vite | 6.4 | 빌드 도구 |
| Tailwind CSS | (CDN) | 스타일링 |
| Lucide React | 0.554 | 아이콘 |
| Axios | 1.13 | HTTP 클라이언트 |

### Backend
| 기술 | 버전 | 용도 |
|------|------|------|
| Node.js | 18+ | 런타임 |
| Express | 4.21 | 웹 프레임워크 |
| TypeScript | 5.9 | 정적 타입 |
| MySQL | 8.0 | 데이터베이스 |
| JWT | 9.0 | 인증 토큰 |
| bcrypt | 5.1 | 비밀번호 암호화 |

### RAG Server
| 기술 | 버전 | 용도 |
|------|------|------|
| Python | 3.10+ | 런타임 |
| Flask | 3.0 | 웹 프레임워크 |
| OpenAI API | 1.54 | 텍스트 임베딩 |
| FAISS | 1.9 | 벡터 검색 |
| pdfplumber | 0.11 | PDF 텍스트 추출 |
| pandas | 2.1 | 데이터 처리 |

### AI/ML
| 서비스 | 모델 | 용도 |
|--------|------|------|
| Google Gemini | gemini-3-pro-preview | 계약서 분석, 챗봇 폴백 |
| OpenAI | text-embedding-3-small | 문서 임베딩 |
| OpenAI | gpt-4.1-mini | RAG 답변 생성 |

### 인프라
| 서비스 | 용도 |
|--------|------|
| Naver Cloud | MySQL 데이터베이스 호스팅 |
| Render | 백엔드/프론트엔드 배포 |

---

## 프로젝트 구조

```
조항줍줍/
├── frontend/                # React 프론트엔드
│   ├── components/          # React 컴포넌트
│   │   ├── AuthContext.tsx      # 인증 상태 관리
│   │   ├── AuthModal.tsx        # 로그인/회원가입 모달
│   │   ├── ChatbotPage.tsx      # 챗봇 페이지
│   │   ├── PreCheckSection.tsx  # 계약서 분석 페이지
│   │   ├── MyPage.tsx           # 마이페이지
│   │   ├── AdminDashboardPage.tsx # 관리자 대시보드
│   │   ├── Navbar.tsx           # 네비게이션 바
│   │   └── ...
│   ├── utils/
│   │   ├── api.ts           # API 클라이언트 설정
│   │   └── gemini.ts        # Gemini API 유틸리티
│   ├── App.tsx              # 메인 앱 컴포넌트
│   ├── index.tsx            # 엔트리 포인트
│   └── package.json
│
├── backend/                 # Express 백엔드
│   └── src/
│       ├── config/
│       │   └── database.ts  # MySQL 연결 설정
│       ├── models/          # 데이터베이스 모델
│       ├── routes/
│       │   ├── authRoutes.ts    # 인증 API
│       │   ├── analysisRoutes.ts # 분석 API
│       │   └── chatbotRoutes.ts  # 챗봇 API
│       ├── utils/
│       │   ├── errors.ts    # 에러 핸들링
│       │   └── logger.ts    # 로깅 유틸리티
│       └── server.ts        # 서버 엔트리 포인트
│
├── rag-server/              # RAG 챗봇 서버
│   ├── pipeline.py          # RAG 파이프라인 (청킹, 임베딩, 검색)
│   ├── app.py               # Flask 서버
│   ├── requirements.txt     # Python 의존성
│   ├── 근로기준법.pdf          # 법률 문서
│   ├── 표준 근로계약서.pdf      # 표준 계약서
│   └── 근로법 요약-복사_OCR.pdf # OCR 처리된 요약 문서
│
└── README.md
```

---

## 로컬 실행 방법

### 사전 요구사항
- Node.js 18.0 이상
- Python 3.10 이상
- MySQL 8.0
- npm 또는 yarn

### 1. 저장소 클론

```bash
git clone https://github.com/AI-NoCode-MCP-Hackathon-2/Johang-JoopJoop.git
cd Johang-JoopJoop
```

### 2. 환경 변수 설정

**Frontend (.env.local)**
```env
VITE_API_URL=http://localhost:5001
VITE_GEMINI_API_KEY=your_gemini_api_key
```

**Backend (.env)**
```env
PORT=5001
DB_HOST=your_mysql_host
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=johang_joopjoop
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
RAG_API_URL=http://localhost:5002/ask
```

**RAG Server (.env)**
```env
OPENAI_API_KEY=your_openai_api_key
```

### 3. 의존성 설치 및 실행

**Frontend**
```bash
cd frontend
npm install
npm run dev
# http://localhost:3000
```

**Backend**
```bash
cd backend
npm install
npm run dev
# http://localhost:5001
```

**RAG Server**
```bash
cd rag-server
pip install -r requirements.txt
python app.py
# http://localhost:5002
```

---

## 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│                    React + TypeScript + Vite                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
          ┌───────────┴───────────┐
          │                       │
          ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│  Backend API    │     │   RAG Server    │
│  (Express.js)   │     │   (Flask)       │
│  Port: 5001     │     │   Port: 5002    │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │              ┌────────┴────────┐
         │              │                 │
         ▼              ▼                 ▼
┌─────────────────┐  ┌──────────┐  ┌─────────────┐
│  MySQL (Naver)  │  │  FAISS   │  │  PDF Docs   │
│  - Users        │  │  Vector  │  │  (근로기준법, │
│  - Analysis     │  │  Index   │  │   계약서)    │
│  - History      │  └──────────┘  └─────────────┘
└─────────────────┘
         │
         └──────────────────┐
                            ▼
                  ┌─────────────────┐
                  │  External APIs  │
                  │  - Gemini AI    │
                  │  - OpenAI       │
                  └─────────────────┘
```

---

## API 명세

### 인증 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | /api/auth/signup | 회원가입 |
| POST | /api/auth/login | 로그인 |
| GET | /api/auth/me | 현재 사용자 정보 |

### 분석 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | /api/analysis | 계약서 분석 요청 |
| GET | /api/analysis/history | 분석 이력 조회 |

### 챗봇 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | /api/chatbot | 챗봇 메시지 전송 |

### RAG API

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | /ask | 법률 질문 처리 |

---

## 주요 구현 사항

### RAG 파이프라인

1. **문서 전처리**: PDF에서 텍스트 추출 (pdfplumber)
2. **스마트 청킹**: 법률 문서 특성에 맞는 조항 단위 분리
   - 일반 법률 문서: 제n조 단위 분리
   - OCR 문서: 특수문자 기반 분리
3. **임베딩**: OpenAI text-embedding-3-small 모델 사용
4. **벡터 검색**: FAISS IndexFlatL2로 유사 문서 검색
5. **하이브리드 검색**: 의미론적 검색 + 키워드 매칭 결합
6. **답변 생성**: GPT-4.1-mini로 문맥 기반 답변 생성

### 할루시네이션 방지

- 프롬프트에 "대한민국 근로기준법에 근거하여 답변" 명시
- "모르거나 불확실한 내용은 절대 지어내지 말 것" 지시
- RAG 응답 불충분 시에만 Gemini 폴백 사용
- 출처(PDF 파일명) 노출 금지

### 보안

- JWT 기반 인증
- bcrypt 비밀번호 암호화
- 환경 변수로 민감 정보 관리
- Rate Limiting으로 API 남용 방지

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
