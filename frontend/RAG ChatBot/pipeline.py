import os
import pdfplumber
import textwrap
import numpy as np
import faiss
import pandas as pd
from dotenv import load_dotenv
from openai import OpenAI

# =========================
# 0. 기본 세팅
# =========================
load_dotenv()
client = OpenAI()

EMBED_MODEL = "text-embedding-3-small"   # 임베딩용
CHAT_MODEL = "gpt-4.1-mini"              # 답변용 (원하면 다른 모델 써도 됨)

# 형님이 가진 pdf 경로로 바꿔줘
PDF_FILES = [
    r"C:\Users\User\Desktop\RAG만들기\근로법 요약.pdf",
    r"C:\Users\User\Desktop\RAG만들기\표준 근로계약서.pdf",
    r"C:\Users\User\Desktop\RAG만들기\근로기준법.pdf"
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
# 2. 텍스트 청크 함수
# =========================
def chunk_text(text: str,
               max_chars: int = 800,
               overlap: int = 200) -> list[dict]:
    """
    단순 char 기준 청크.
    - max_chars: 청크 최대 길이
    - overlap : 앞 청크와 겹치는 부분(문맥 유지용)
    """
    cleaned = " ".join(text.split())  # 줄바꿈/공백 정리
    chunks = []
    start = 0
    idx = 0

    while start < len(cleaned):
        end = start + max_chars
        chunk = cleaned[start:end]

        # 문장 중간에서 끊기면 마지막 마침표 기준으로 자르기
        last_dot = chunk.rfind(".")
        if last_dot != -1 and last_dot > max_chars * 0.4:
            end = start + last_dot + 1
            chunk = cleaned[start:end]

        chunks.append({
            "chunk_id": idx,
            "text": chunk
        })
        idx += 1
        start = end - overlap  # overlap 만큼 겹치게
        if start < 0:
            start = 0

    return chunks

# =========================
# 3. 모든 PDF → 청크 + DataFrame
# =========================
def build_chunks_from_pdfs(pdf_paths: list[str]) -> pd.DataFrame:
    rows = []
    doc_id = 0

    for path in pdf_paths:
        doc_id += 1
        raw_text = extract_text_from_pdf(path)
        chunks = chunk_text(raw_text)

        for c in chunks:
            rows.append({
                "doc_id": doc_id,
                "source": os.path.basename(path),
                "chunk_id": c["chunk_id"],
                "text": c["text"]
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
# 5. 질의 시: 유사 청크 검색 + GPT 호출
# =========================
def search_similar_chunks(query: str,
                          df: pd.DataFrame,
                          index,
                          top_k: int = 5):
    q_vec = embed_texts([query])
    distances, indices = index.search(q_vec, top_k)
    idxs = indices[0]

    results = df.iloc[idxs].copy()
    results["score"] = distances[0]
    return results

def answer_question(query: str,
                    df: pd.DataFrame,
                    index,
                    top_k: int = 5) -> str:
    # 1) 관련 청크 찾기
    hits = search_similar_chunks(query, df, index, top_k=top_k)

    # 2) context 문자열 만들기
    context_parts = []
    for _, row in hits.iterrows():
        header = f"[{row['source']} / chunk {row['chunk_id']}]"
        context_parts.append(header + "\n" + row["text"])
    context = "\n\n".join(context_parts)

    # 3) GPT에 질의
    system_prompt = (
        "너는 한국 근로계약서와 근로기준법 안내 문서를 기반으로 "
        "질문에 답하는 법률 설명 도우미야. "
        "반드시 아래 제공된 문서 내용만 근거로 삼아서, "
        "쉬운 한국어로 요약해서 설명해줘. "
        "확실하지 않은 부분은 모른다고 말해."
    )

    user_prompt = f"""
다음은 참고해야 할 문서 일부야:

{context}

위 문서를 바탕으로, 아래 질문에 답변해줘.

질문: {query}
"""

    chat_resp = client.chat.completions.create(
        model=CHAT_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.1,
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

        answer = answer_question(q, df_chunks, index, top_k=5)
        print("\n=== 답변 ===")
        print(textwrap.fill(answer, width=80))
