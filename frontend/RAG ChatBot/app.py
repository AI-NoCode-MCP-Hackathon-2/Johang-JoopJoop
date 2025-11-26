from flask import Flask, render_template, request, jsonify
import os
from pipeline import build_chunks_from_pdfs, build_faiss_index, answer_question

app = Flask(__name__)

# PDF 경로
PDF_FILES = [
    r"C:\Users\User\Desktop\RAG만들기\근로법 요약.pdf",
    r"C:\Users\User\Desktop\RAG만들기\표준 근로계약서.pdf",
]

# 전역 변수로 인덱스와 데이터프레임 저장
df_chunks = None
index = None

def initialize_rag():
    """RAG 시스템 초기화"""
    global df_chunks, index
    print("📚 PDF 청크 생성 중...")
    df_chunks = build_chunks_from_pdfs(PDF_FILES)
    print(f"총 청크 개수: {len(df_chunks)}")

    print("🧠 임베딩 및 FAISS 인덱스 구축 중...")
    index, _ = build_faiss_index(df_chunks)
    print("✅ 초기화 완료!")

@app.route('/')
def home():
    """메인 채팅 페이지"""
    return render_template('chat.html')

@app.route('/ask', methods=['POST'])
def ask():
    """질문 처리 API"""
    try:
        data = request.json
        question = data.get('question', '').strip()

        if not question:
            return jsonify({'error': '질문을 입력해주세요.'}), 400

        # RAG 시스템으로 답변 생성
        answer = answer_question(question, df_chunks, index, top_k=5)

        return jsonify({
            'answer': answer,
            'success': True
        })

    except Exception as e:
        return jsonify({
            'error': f'오류가 발생했습니다: {str(e)}',
            'success': False
        }), 500

if __name__ == '__main__':
    # 앱 시작 전 RAG 초기화
    initialize_rag()

    # Flask 서버 실행
    print("\n🚀 웹 서버 시작!")
    print("브라우저에서 http://localhost:5000 으로 접속하세요\n")
    app.run(debug=True, host='0.0.0.0', port=5000)
