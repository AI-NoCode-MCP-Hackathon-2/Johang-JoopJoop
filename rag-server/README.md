# 🤖 근로기준법 AI 챗봇 (RAG 시스템)

근로기준법, 표준 근로계약서, 근로법 요약을 기반으로 질문에 답변하는 AI 챗봇입니다.

## 📋 주요 기능

- ✅ **스마트 청킹**: 법률 문서 구조에 맞춘 조항 단위 청킹
- ✅ **하이브리드 검색**: 의미론적 검색 + 키워드 매칭
- ✅ **OCR 문서 지원**: 특수문자 기반 청킹
- ✅ **웹 인터페이스**: Flask 기반 채팅 UI
- ✅ **정확한 답변**: 법 조항 번호와 근거 명시

---

## 🚀 설치 방법

### 1. Python 패키지 설치
```bash
pip install -r requirements.txt
```

**requirements.txt 내용:**
```
pdfplumber
numpy
faiss-cpu
pandas
python-dotenv
openai
flask
```

### 2. OpenAI API 키 설정
`.env` 파일을 만들고 API 키를 입력하세요:
```
OPENAI_API_KEY=sk-your-api-key-here
```

### 3. PDF 파일 준비
다음 PDF 파일들이 있어야 합니다:
- `표준 근로계약서.pdf`
- `근로기준법.pdf`
- `근로법 요약-복사_OCR.pdf`

---

## 💻 실행 방법

### 방법 1: 웹 인터페이스 (추천)
```bash
python app.py
```

그 다음 브라우저에서:
```
http://localhost:5000
```

### 방법 2: 터미널 대화형
```bash
python pipeline.py
```

---

## 📁 파일 구조

```
RAG만들기/
├── app.py                          # Flask 웹 서버
├── pipeline.py                     # RAG 엔진 (청킹, 검색, 답변)
├── requirements.txt                # Python 패키지 목록
├── .env                           # OpenAI API 키
├── templates/
│   └── chat.html                  # 채팅 UI
├── static/                        # CSS, JS (있으면)
├── 표준 근로계약서.pdf
├── 근로기준법.pdf
└── 근로법 요약-복사_OCR.pdf
```

---

## 🎯 사용 예시

**질문 예시:**
- "1주일 근로시간은 몇 시간까지 가능해?"
- "연차휴가는 며칠 받을 수 있어?"
- "제50조가 뭐야?"
- "임금 체불하면 어떻게 돼?"

**답변 예시:**
```
제50조(근로시간)에 따르면, 1주 간의 근로시간은 휴게시간을
제외하고 40시간을 초과할 수 없습니다. 또한 1일의 근로시간은
휴게시간을 제외하고 8시간을 초과할 수 없습니다.

[출처: 근로기준법.pdf]
```

---

## ⚙️ 기술 스택

- **Python 3.8+**
- **OpenAI API** (GPT-4.1-mini, text-embedding-3-small)
- **FAISS** (벡터 검색)
- **pdfplumber** (PDF 텍스트 추출)
- **Flask** (웹 프레임워크)
- **Pandas** (데이터 처리)

---

## 🔧 커스터마이징

### PDF 파일 변경
`pipeline.py`와 `app.py`의 `PDF_FILES` 변수를 수정하세요:
```python
PDF_FILES = [
    r"C:\경로\파일1.pdf",
    r"C:\경로\파일2.pdf",
]
```

### 검색 결과 개수 조정
`app.py`의 `top_k` 파라미터 변경:
```python
answer = answer_question(question, df_chunks, index, top_k=8)  # 기본값: 8
```

### 청킹 방식 변경
`pipeline.py`의 청킹 함수 수정:
- `chunk_text_smart()`: 일반 법률 문서
- `chunk_text_ocr()`: OCR 문서
- `chunk_text()`: 기본 청킹

---

## 🐛 문제 해결

### Q: "OpenAI API 키 오류"
`.env` 파일에 API 키가 제대로 설정되어 있는지 확인하세요.

### Q: "PDF 파일을 찾을 수 없음"
파일 경로가 정확한지 확인하고, 절대 경로를 사용하세요.

### Q: "faiss 설치 오류"
Windows에서는 `faiss-cpu`를 사용하세요:
```bash
pip install faiss-cpu
```

### Q: "답변이 이상해요"
- 검색 결과가 관련 없는 경우: `top_k` 값을 조정하거나 키워드를 추가하세요
- 청킹이 이상한 경우: PDF 구조에 맞는 청킹 함수를 사용하세요

---

## 📝 라이선스

이 프로젝트는 학습 및 개인 사용 목적으로 제작되었습니다.

---

## 🙏 크레딧

- **OpenAI GPT-4.1-mini**: 답변 생성
- **FAISS**: 벡터 검색
- **pdfplumber**: PDF 텍스트 추출
