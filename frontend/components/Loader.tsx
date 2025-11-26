import React from 'react';

const Loader: React.FC = () => {
  return (
    <>
      <style>{`
        .loader-card {
          /* color used to softly clip top and bottom of the .words container */
          --bg-color: #1e293b; /* slate-800 to match dark theme */
          background-color: var(--bg-color);
          padding: 1rem 2rem;
          border-radius: 1.25rem;
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
        }
        .loader-content {
          color: rgb(124, 124, 124);
          font-family: "Space Grotesk", "Noto Sans KR", sans-serif;
          font-weight: 500;
          font-size: 25px;
          -webkit-box-sizing: content-box;
          box-sizing: content-box;
          height: 40px;
          padding: 10px 10px;
          display: -webkit-box;
          display: -ms-flexbox;
          display: flex;
          border-radius: 8px;
        }
        
        .loader-text {
          margin-right: 8px;
          color: #fff;
        }

        .words {
          overflow: hidden;
          position: relative;
          min-width: 180px;
        }
        
        /* Gradient mask removed to prevent light bleed/blur effect */

        .word {
          display: block;
          height: 100%;
          padding-left: 6px;
          color: #2dd4bf; /* teal-400 */
          animation: spin_words 4s infinite;
          white-space: nowrap;
        }

        @keyframes spin_words {
          10% {
            -webkit-transform: translateY(-102%);
            transform: translateY(-102%);
          }

          25% {
            -webkit-transform: translateY(-100%);
            transform: translateY(-100%);
          }

          35% {
            -webkit-transform: translateY(-202%);
            transform: translateY(-202%);
          }

          50% {
            -webkit-transform: translateY(-200%);
            transform: translateY(-200%);
          }

          60% {
            -webkit-transform: translateY(-302%);
            transform: translateY(-302%);
          }

          75% {
            -webkit-transform: translateY(-300%);
            transform: translateY(-300%);
          }

          85% {
            -webkit-transform: translateY(-402%);
            transform: translateY(-402%);
          }

          100% {
            -webkit-transform: translateY(-400%);
            transform: translateY(-400%);
          }
        }
      `}</style>
      
      <div className="loader-card">
        <div className="loader-content">
          <p className="loader-text">AI 분석중:</p>
          <div className="words">
            <span className="word">계약서 스캔</span>
            <span className="word">독소조항 탐지</span>
            <span className="word">판례 데이터 대조</span>
            <span className="word">요약 리포트 생성</span>
            <span className="word">계약서 스캔</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default Loader;