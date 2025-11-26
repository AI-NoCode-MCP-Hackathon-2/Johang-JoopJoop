"""
로컬 공유용 파일 압축 스크립트
실행: python package_for_share.py
"""
import zipfile
import os
from pathlib import Path

# 포함할 파일/폴더
INCLUDE_FILES = [
    'pipeline.py',
    'app.py',
    'requirements.txt',
    'README.md',
    '.env.example',  # .env는 예시만
    'templates/chat.html',
]

INCLUDE_FOLDERS = [
    'static/',
    'templates/',
]

INCLUDE_PDFS = [
    '표준 근로계약서.pdf',
    '근로기준법.pdf',
    '근로법 요약-복사_OCR.pdf',
]

def create_package():
    output_file = 'RAG_근로법_챗봇_공유용.zip'

    with zipfile.ZipFile(output_file, 'w', zipfile.ZIP_DEFLATED) as zipf:
        print("📦 파일 압축 중...")

        # Python 코드
        for file in INCLUDE_FILES:
            if os.path.exists(file):
                zipf.write(file)
                print(f"  ✅ {file}")

        # 폴더
        for folder in INCLUDE_FOLDERS:
            if os.path.exists(folder):
                for root, dirs, files in os.walk(folder):
                    for file in files:
                        filepath = os.path.join(root, file)
                        zipf.write(filepath)
                        print(f"  ✅ {filepath}")

        # PDF
        for pdf in INCLUDE_PDFS:
            if os.path.exists(pdf):
                zipf.write(pdf)
                print(f"  ✅ {pdf}")

    # 파일 크기 확인
    size_mb = os.path.getsize(output_file) / (1024 * 1024)
    print(f"\n✅ 완료! {output_file} ({size_mb:.1f} MB)")
    print(f"\n📍 위치: {os.path.abspath(output_file)}")

if __name__ == '__main__':
    # .env.example 생성 (실제 API 키 제외)
    with open('.env.example', 'w', encoding='utf-8') as f:
        f.write("OPENAI_API_KEY=sk-your-api-key-here\n")

    create_package()
