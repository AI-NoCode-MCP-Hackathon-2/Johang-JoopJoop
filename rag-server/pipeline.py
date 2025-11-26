import os
import pdfplumber
import numpy as np
import faiss
import pandas as pd
import re
from dotenv import load_dotenv
from openai import OpenAI

# =========================
# 0. 기본 세팅
# =========================
load_dotenv()
client = OpenAI()

EMBED_MODEL = "text-embedding-3-small"   # 임베딩용
CHAT_MODEL = "gpt-4.1-mini"              # 답변용 (원하면 다른 모델 써도 됨)

# PDF 파일 경로 (현재 디렉토리 기준)
import pathlib
_BASE_DIR = pathlib.Path(__file__).parent
PDF_FILES = [
    str(_BASE_DIR / "표준 근로계약서.pdf"),
    str(_BASE_DIR / "근로기준법.pdf"),
    str(_BASE_DIR / "근로법 요약-복사_OCR.pdf"),
]

# =========================
# 1. PDF → 텍스트 추출
# =========================
def extract_text_from_pdf(path: str) -> str:
    """pdfplumber로 전체 텍스트 추출"""
    texts = []
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            t = page.extract_text() or ""
            texts.append(t)
    full_text = "\n".join(texts)
    return full_text

# =========================
# 2. 텍스트 청크 함수 (개선됨)
# =========================

def chunk_text_ocr(text: str, source_name: str = "") -> list[dict]:
    """
    OCR 문서용 스마트 청킹 (근로법 요약-복사_OCR)
    - OCR 특수문자 기준으로 분리: •, o, ■, Q, c
    - 제n조 패턴으로 조항 분리
    """
    _ = source_name
    chunks = []
    chunk_id = 0

    # 주요 구분자: •, ■, o, O, Q, ○ 또는 제n조
    major_split_pattern = r'(?=[•■oOQ○●]|\n제\d+조)'
    sections = re.split(major_split_pattern, text)

    current_header = ""
    current_content = []

    for section in sections:
        section = section.strip()
        if not section or len(section) < 20:
            continue

        # 제n조 패턴 감지
        article_match = re.search(r'제(\d+)조', section[:100])
        if article_match:
            # 이전 청크 저장
            if current_content:
                full_text = current_header + "\n" + "\n".join(current_content)
                if len(full_text.strip()) > 50:
                    chunks.append({
                        "chunk_id": chunk_id,
                        "text": full_text.strip(),
                        "article": article_match.group(0) if article_match else "unknown"
                    })
                    chunk_id += 1
                current_content = []

            current_header = f"【{article_match.group(0)}】"
            current_content.append(section)

        # OCR 특수문자로 시작하는 항목
        elif re.match(r'^[•■oOQ○●]', section):
            # 너무 길면 새 청크로
            if len("\n".join(current_content)) > 1500:
                if current_content:
                    full_text = current_header + "\n" + "\n".join(current_content)
                    chunks.append({
                        "chunk_id": chunk_id,
                        "text": full_text.strip(),
                        "article": "unknown"
                    })
                    chunk_id += 1
                current_content = [section]
            else:
                current_content.append(section)
        else:
            current_content.append(section)

    # 마지막 청크 저장
    if current_content:
        full_text = current_header + "\n" + "\n".join(current_content)
        if len(full_text.strip()) > 50:
            chunks.append({
                "chunk_id": chunk_id,
                "text": full_text.strip(),
                "article": "unknown"
            })

    return chunks if chunks else [{"chunk_id": 0, "text": text[:2000], "article": "unknown"}]

def chunk_text_smart(text: str, source_name: str = "") -> list[dict]:
    """
    법률 문서용 스마트 청킹
    - 조항 단위로 분리 (제XX조)
    - 각 조항이 너무 길면 항 단위로 추가 분리
    - 문맥 보존을 위해 제목과 조항번호 포함
    """
    _ = source_name  # 향후 확장용
    chunks = []

    # 조항 패턴: 제1조, 제23조 등
    article_pattern = r'(제\d+조(?:의\d+)?)\(([^)]+)\)'

    # 전체 텍스트를 조항으로 분리
    articles = re.split(r'(?=제\d+조)', text)

    chunk_id = 0
    for article_text in articles:
        if not article_text.strip():
            continue

        # 조항 번호와 제목 추출
        match = re.search(article_pattern, article_text[:200])  # 앞부분만 검색

        if match:
            article_num = match.group(1)
            article_title = match.group(2)
            header = f"【{article_num}({article_title})】\n"
        else:
            header = ""

        # 조항이 너무 길면 항(①②③) 단위로 분리
        if len(article_text) > 1500:
            # 항 패턴: ①, ②, ③ 등
            paragraphs = re.split(r'(?=[①②③④⑤⑥⑦⑧⑨⑩])', article_text)

            for para in paragraphs:
                if len(para.strip()) > 50:  # 너무 짧은 건 스킵
                    chunks.append({
                        "chunk_id": chunk_id,
                        "text": header + para.strip(),
                        "article": match.group(1) if match else "unknown"
                    })
                    chunk_id += 1
        else:
            # 조항이 적당한 길이면 그대로 사용
            chunks.append({
                "chunk_id": chunk_id,
                "text": header + article_text.strip(),
                "article": match.group(1) if match else "unknown"
            })
            chunk_id += 1

    return chunks

def chunk_text(text: str,
               max_chars: int = 800,
               overlap: int = 200) -> list[dict]:
    """
    폴백용 기본 청킹 (법률 문서가 아닌 경우)
    """
    cleaned = " ".join(text.split())
    chunks = []
    start = 0
    idx = 0

    while start < len(cleaned):
        end = start + max_chars
        chunk = cleaned[start:end]

        last_dot = chunk.rfind(".")
        if last_dot != -1 and last_dot > max_chars * 0.4:
            end = start + last_dot + 1
            chunk = cleaned[start:end]

        chunks.append({
            "chunk_id": idx,
            "text": chunk
        })
        idx += 1
        start = end - overlap
        if start < 0:
            start = 0

    return chunks

# =========================
# 3. 모든 PDF → 청크 + DataFrame (개선됨)
# =========================
def build_chunks_from_pdfs(pdf_paths: list[str]) -> pd.DataFrame:
    rows = []
    doc_id = 0

    for path in pdf_paths:
        doc_id += 1
        raw_text = extract_text_from_pdf(path)

        # 법률 문서면 스마트 청킹 사용
        source_name = os.path.basename(path)
        if "OCR" in source_name or "요약" in source_name:
            # OCR 문서는 특수문자 기반 청킹
            chunks = chunk_text_ocr(raw_text, source_name)
        elif "법" in source_name or "계약서" in source_name:
            # 일반 법률 문서는 조항 기반 청킹
            chunks = chunk_text_smart(raw_text, source_name)
        else:
            # 기타는 기본 청킹
            chunks = chunk_text(raw_text)

        for c in chunks:
            rows.append({
                "doc_id": doc_id,
                "source": source_name,
                "chunk_id": c["chunk_id"],
                "text": c["text"],
                "article": c.get("article", "unknown")
            })

    df = pd.DataFrame(rows)
    return df

# =========================
# 4. 임베딩 + FAISS 인덱스 구축
# =========================
def embed_texts(texts: list[str]) -> np.ndarray:
    """
    OpenAI 임베딩 API 호출
    """
    # 한 번에 여러 개 입력 가능
    resp = client.embeddings.create(
        model=EMBED_MODEL,
        input=texts
    )
    vectors = [d.embedding for d in resp.data]
    return np.array(vectors, dtype="float32")

def build_faiss_index(df: pd.DataFrame):
    """
    df["text"] 전부 임베딩해서 FAISS 인덱스 생성
    """
    embeddings = embed_texts(df["text"].tolist())
    dim = embeddings.shape[1]

    index = faiss.IndexFlatL2(dim)
    index.add(embeddings)

    return index, embeddings

# =========================
# 5. 질의 시: 하이브리드 검색 (의미론적 + 키워드)
# =========================
def keyword_search(query: str, df: pd.DataFrame, top_k: int = 10) -> set:
    """키워드 기반 검색 - 조항 번호나 중요 키워드 매칭"""
    matched_indices = set()

    # 조항 번호 검색 (예: "제50조")
    article_match = re.search(r'제\d+조', query)
    if article_match:
        article_num = article_match.group(0)
        matches = df[df['text'].str.contains(article_num, na=False)]
        matched_indices.update(matches.index.tolist()[:top_k])

    # 주요 키워드 검색
    keywords = ['임금', '휴가', '근로시간', '해고', '계약', '휴일', '수당']
    for keyword in keywords:
        if keyword in query:
            matches = df[df['text'].str.contains(keyword, na=False)]
            matched_indices.update(matches.head(5).index.tolist())

    return matched_indices

def search_similar_chunks(query: str,
                          df: pd.DataFrame,
                          index,
                          top_k: int = 8):
    """하이브리드 검색: 의미론적 + 키워드"""
    # 1) 의미론적 검색
    q_vec = embed_texts([query])
    distances, indices = index.search(q_vec, top_k * 2)  # 넉넉하게 가져오기

    # 2) 키워드 검색
    keyword_idxs = keyword_search(query, df, top_k=5)

    # 3) 결합 (키워드 매칭은 우선순위 높임)
    combined_idxs = list(keyword_idxs) + [idx for idx in indices[0] if idx not in keyword_idxs]
    final_idxs = combined_idxs[:top_k]

    results = df.iloc[final_idxs].copy()
    results["score"] = [distances[0][list(indices[0]).index(idx)] if idx in indices[0] else 999
                        for idx in final_idxs]

    # 관련성 필터링: 너무 거리가 먼 것 제외
    results = results[results["score"] < 1.5]

    return results

def answer_question(query: str,
                    df: pd.DataFrame,
                    index,
                    top_k: int = 8) -> str:
    # 1) 관련 청크 찾기
    hits = search_similar_chunks(query, df, index, top_k=top_k)

    if len(hits) == 0:
        return "죄송합니다. 제공된 문서에서 관련 정보를 찾을 수 없습니다."

    # 2) context 문자열 만들기 (중복 제거)
    context_parts = []
    seen_texts = set()

    for _, row in hits.iterrows():
        text = row["text"]
        # 중복된 텍스트는 제외
        if text not in seen_texts:
            seen_texts.add(text)
            context_parts.append(text)

    context = "\n\n---\n\n".join(context_parts)

    # 3) 개선된 프롬프트로 GPT에 질의
    system_prompt = """당신은 근로기준법 전문가입니다.

**역할**:
- 근로기준법, 근로계약서 등 노동법 관련 문서를 기반으로 정확한 답변 제공
- 법조항을 인용할 때는 조항 번호를 명시 (예: 근로기준법 제50조)
- 근로자의 권리와 의무를 명확히 설명

**답변 원칙**:
1. 제공된 문서 내용에만 근거하여 답변
2. 조항 번호가 있으면 반드시 명시
3. 복잡한 법률 용어는 쉽게 풀어서 설명
4. 확실하지 않거나 문서에 없는 내용은 "문서에서 해당 정보를 찾을 수 없습니다"라고 명시
5. 답변은 3~5문장으로 간결하게 작성
6. 출처나 파일명(예: PDF 파일명)은 절대 언급하지 말 것
7. 가독성을 위해 문맥에 맞게 적절히 줄바꿈을 사용할 것 (예: 핵심 내용, 예시, 주의사항 등을 구분)"""

    user_prompt = f"""다음 근로기준법 문서를 참고하여 질문에 답변하세요:

{context}

---

**질문**: {query}

**답변 형식**:
- 해당 조항이 있다면 조항 번호(예: 근로기준법 제OO조)를 먼저 언급
- 핵심 내용을 명확하게 설명
- 필요시 예시 포함
- 출처나 파일명은 언급하지 말 것"""

    chat_resp = client.chat.completions.create(
        model=CHAT_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.0,  # 법률 답변은 일관성이 중요
    )

    return chat_resp.choices[0].message.content.strip()

# =========================
# 6. 실행 예시
# =========================
if __name__ == "__main__":
    print("📚 PDF에서 텍스트 추출 & 청크 생성 중...")
    df_chunks = build_chunks_from_pdfs(PDF_FILES)
    print(f"총 청크 개수: {len(df_chunks)}")

    print("🧠 임베딩 생성 & FAISS 인덱스 구축 중...")
    index, _ = build_faiss_index(df_chunks)
    print("완료!")

    # 샘플 질의
    while True:
        q = input("\n질문을 입력하세요 (종료하려면 'quit'): ").strip()
        if q.lower() in ("quit", "exit"):
            break

        print("\n🔍 검색 중...")
        answer = answer_question(q, df_chunks, index, top_k=8)
        print("\n=== 답변 ===")
        print(answer)
        print("\n" + "="*50)
