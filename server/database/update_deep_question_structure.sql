-- 심층 질문 구조 변경
-- gapSummary와 deepDiveQuestions 형식으로 변경

USE dream_track;

-- 기존 테이블 삭제하고 새로 생성
DROP TABLE IF EXISTS deep_assessments;
DROP TABLE IF EXISTS deep_results;
DROP TABLE IF EXISTS deep_questions;

-- ai_analysis 테이블에 gap_summary 필드 추가
ALTER TABLE ai_analysis 
ADD COLUMN IF NOT EXISTS gap_summary TEXT COMMENT '현재 상태와 목표 사이의 갭 분석';

-- 심층 질문 테이블 (새로운 구조)
CREATE TABLE IF NOT EXISTS deep_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    analysis_id INT NOT NULL,
    question_id INT NOT NULL COMMENT '질문 순번 (1-5)',
    question_text TEXT NOT NULL COMMENT '질문 내용',
    answer TEXT COMMENT '사용자 답변',
    answered_at TIMESTAMP NULL COMMENT '답변 일시',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (analysis_id) REFERENCES ai_analysis(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_question (user_id, question_id),
    INDEX idx_user_id (user_id),
    INDEX idx_analysis_id (analysis_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 심층 진단 완료 상태 테이블
CREATE TABLE IF NOT EXISTS deep_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    analysis_id INT NOT NULL,
    gap_summary TEXT NOT NULL COMMENT '갭 분석 요약',
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (analysis_id) REFERENCES ai_analysis(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_completed (is_completed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 테이블 생성 확인
SELECT 'deep_questions 테이블이 재생성되었습니다.' AS message;
SELECT 'deep_results 테이블이 재생성되었습니다.' AS message;

