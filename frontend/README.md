# 조항줍줍 (Johang JoopJoop)

근로계약서 및 알바 계약서 속 위험한 조항을 AI 기반으로 사전 점검하는 웹 서비스입니다.
복잡한 법률 용어를 누구나 이해할 수 있는 우리말 설명과 시각적인 위험도 표시로 제공합니다.

## 주요 안내

본 서비스는 법률 자문을 대체하지 않으며, 중요한 결정 전에는 반드시 노무사 및 변호사 등 전문가와 상의해야 합니다.

---

## 주요 기능

### 1. 랜딩 페이지 및 서비스 소개
- 히어로 섹션: "근로계약서, 사인하기 전에 미리 점검해 보세요" 메시지 전달
- 서비스 소개 섹션: 문제 정의, 솔루션, 타겟 사용자, 경쟁 서비스 대비 차별점
- 주요 타겟: 대학생, 사회초년생, 직장인 등

### 2. 계약서 분석
- 파일 업로드: TXT, PDF 형식 지원
- AI 기반 분석: Google Gemini API를 활용한 실시간 계약서 분석
- 위험도 표시: 위험(high), 주의(medium), 양호(low) 3단계 분류
- 위험 조항 하이라이팅 및 관련 법률 위반 사항 안내
- 3줄 요약 제공

### 3. 사용자 인증 및 마이페이지
- 이메일 및 소셜 로그인(카카오, 구글, 네이버) 지원
- 마이페이지: 사용자 프로필, 잔여 점검 횟수, 분석 이력 조회
- 1일 5회 무료 분석 제한

### 4. 정보 섹션
- 작동 방식: 업로드부터 결과 확인까지의 단계 설명
- 주요 기능 소개: 핵심 기능 시각화
- FAQ: 자주 묻는 질문 정리
- 개인정보 처리 안내

### 5. 정책 및 문의
- 개인정보처리방침 페이지
- 이용약관 페이지
- 문의하기 페이지: 문의 폼 UI 제공

---

## 기술 스택

- **Frontend Framework**: React 19.2 + TypeScript 5.8
- **Build Tool**: Vite 6.2
- **Styling**: Tailwind CSS
- **Icons**: lucide-react
- **AI Integration**: Google Generative AI SDK (Gemini 2.0 Flash)
- **State Management**: React Context API
- **Storage**: LocalStorage (사용자 인증, 분석 이력)

---

## 프로젝트 구조

```
.
├── App.tsx                      # 메인 애플리케이션 컴포넌트
├── index.tsx                    # 앱 진입점
├── index.html                   # HTML 템플릿
├── .env                         # 환경 변수 (API 키)
├── utils/
│   └── gemini.ts               # Gemini API 유틸리티
└── components/
    ├── AboutSection.tsx
    ├── AnalysisHistoryContext.tsx  # 분석 이력 관리
    ├── AuthContext.tsx             # 인증 상태 관리
    ├── AuthModal.tsx               # 로그인/회원가입 모달
    ├── ContactPage.tsx
    ├── FAQSection.tsx
    ├── FeatureSection.tsx
    ├── Footer.tsx
    ├── Hero.tsx
    ├── HowItWorksSection.tsx
    ├── Loader.tsx
    ├── MockContractCard.tsx
    ├── MyPage.tsx                  # 마이페이지
    ├── Navbar.tsx
    ├── PreCheckSection.tsx         # 계약서 분석 섹션
    ├── PrivacyPolicyPage.tsx
    ├── PrivacySection.tsx
    ├── Reveal.tsx
    ├── ServiceIntroSection.tsx
    └── TermsPage.tsx
```

---

## 로컬 실행 방법

### 1. 저장소 클론

```bash
git clone https://github.com/AI-NoCode-MCP-Hackathon-2/Johang-JoopJoop.git
cd Johang-JoopJoop
```

### 2. 의존성 설치

```bash
npm install --include=dev
```

### 3. 환경 변수 설정

`.env` 파일을 생성하고 Gemini API 키를 설정합니다:

```
VITE_GEMINI_API_KEY=your_api_key_here
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

### 5. 프로덕션 빌드

```bash
npm run build
npm run preview
```

---

## 주요 구현 내용

### AI 계약서 분석
- Google Gemini 2.0 Flash API를 활용한 실시간 분석
- 대한민국 근로기준법 기반 위험 조항 탐지
- 법률 위반 사항 및 개선 제안 제공

### 사용자 경험
- 반응형 디자인으로 모바일 및 데스크톱 최적화
- 애니메이션을 활용한 자연스러운 UI/UX
- 직관적인 파일 업로드 인터페이스

### 데이터 관리
- LocalStorage 기반 사용자 인증 상태 유지
- 분석 이력 자동 저장 및 조회
- 사용자별 데이터 분리 관리

---

## 향후 개발 계획

### 인증 및 계정 관리
- 실제 백엔드 서버 연동
- OAuth 2.0 기반 소셜 로그인 구현
- 비밀번호 변경 및 재설정 기능
- 회원 탈퇴 기능

### 분석 기능 고도화
- PDF 파일 텍스트 추출 기능 개선
- 다양한 계약서 유형 지원 확대
- 판례 데이터베이스 연동
- 분석 결과 PDF 다운로드 기능

### 추가 기능
- 챗봇 페이지: 근로기준 및 노동 상식 Q&A
- 전문가 연결: 제휴 노무사 및 변호사 연결 플로우
- 국가 기관 안내: 고용노동부, 노동청 링크 및 신고 안내
- 구독 및 결제 시스템: 초과 사용 시 횟수 충전

---

## 법적 책임 한계

- 본 프로젝트는 해커톤 및 프로토타입 용도로 개발되었습니다.
- 화면에 표시되는 모든 분석, 설명, 조언은 실제 법률 자문이 아니며 법적 효력을 가지지 않습니다.
- 근로계약 및 노동 분쟁과 같이 중요한 사안은 반드시 공인 노무사, 변호사 및 국가기관에 상담하시기 바랍니다.

---

## 라이선스

MIT License

---

## 문의

- 개발자: 신주용
- GitHub: [@robotshin96](https://github.com/robotshin96)
- 프로젝트 저장소: [Johang-JoopJoop](https://github.com/AI-NoCode-MCP-Hackathon-2/Johang-JoopJoop)

PR, 이슈, 피드백을 환영합니다.