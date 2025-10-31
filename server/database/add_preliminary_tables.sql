-- 기본 진단 기능 추가를 위한 마이그레이션 스크립트
-- 기존 데이터베이스에 새로운 테이블만 추가합니다

USE dream_track;

-- 기본 진단 응답 테이블
CREATE TABLE IF NOT EXISTS preliminary_assessments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    question_no INT NOT NULL,
    question_type VARCHAR(50) NOT NULL,
    question_text TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 기본 진단 결과 테이블
CREATE TABLE IF NOT EXISTS preliminary_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    result_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_completed (is_completed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 테이블 생성 확인
SELECT 
    'preliminary_assessments 테이블이 생성되었습니다.' AS message
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'dream_track' 
    AND table_name = 'preliminary_assessments'
);

SELECT 
    'preliminary_results 테이블이 생성되었습니다.' AS message
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'dream_track' 
    AND table_name = 'preliminary_results'
);

