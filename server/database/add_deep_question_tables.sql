-- 심층 질문 기능 추가를 위한 마이그레이션 스크립트
-- AI 분석 결과와 심층 질문을 저장하는 테이블

USE dream_track;

-- AI 분석 결과 테이블
CREATE TABLE IF NOT EXISTS ai_analysis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    preliminary_result_id INT NOT NULL,
    analysis_data JSON NOT NULL COMMENT 'AI가 분석한 기본 진단 결과',
    strengths TEXT COMMENT '강점',
    interests TEXT COMMENT '관심사',
    career_direction TEXT COMMENT '진로 방향',
    areas_to_improve TEXT COMMENT '개선 필요 영역',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (preliminary_result_id) REFERENCES preliminary_results(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_analysis (user_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 심층 질문 테이블
CREATE TABLE IF NOT EXISTS deep_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    analysis_id INT NOT NULL,
    question_no INT NOT NULL,
    question_type VARCHAR(50) NOT NULL,
    question_text TEXT NOT NULL,
    question_purpose TEXT COMMENT '질문 의도/목적',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (analysis_id) REFERENCES ai_analysis(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_analysis_id (analysis_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 심층 질문 응답 테이블
CREATE TABLE IF NOT EXISTS deep_assessments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    question_id INT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES deep_questions(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_question_id (question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 심층 진단 완료 상태 테이블
CREATE TABLE IF NOT EXISTS deep_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    analysis_id INT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    result_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (analysis_id) REFERENCES ai_analysis(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_completed (is_completed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 테이블 생성 확인
SELECT 'ai_analysis 테이블이 생성되었습니다.' AS message
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'dream_track' 
    AND table_name = 'ai_analysis'
);

SELECT 'deep_questions 테이블이 생성되었습니다.' AS message
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'dream_track' 
    AND table_name = 'deep_questions'
);

SELECT 'deep_assessments 테이블이 생성되었습니다.' AS message
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'dream_track' 
    AND table_name = 'deep_assessments'
);

SELECT 'deep_results 테이블이 생성되었습니다.' AS message
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'dream_track' 
    AND table_name = 'deep_results'
);

