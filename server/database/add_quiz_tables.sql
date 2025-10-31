-- 퀴즈 기능 추가를 위한 테이블

USE dream_track;

-- 생성된 퀴즈 테이블
CREATE TABLE IF NOT EXISTS quizzes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    roadmap_id INT NOT NULL,
    quiz_data JSON NOT NULL COMMENT '전체 퀴즈 데이터 (문제 및 정답)',
    total_questions INT NOT NULL COMMENT '총 문제 수',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (roadmap_id) REFERENCES roadmaps(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 퀴즈 제출 기록 테이블
CREATE TABLE IF NOT EXISTS quiz_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    quiz_id INT NOT NULL,
    answers JSON NOT NULL COMMENT '사용자 답변',
    score INT NOT NULL COMMENT '점수',
    total_questions INT NOT NULL,
    correct_answers INT NOT NULL COMMENT '정답 개수',
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_quiz_id (quiz_id),
    INDEX idx_completed_at (completed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 테이블 생성 확인
SELECT 'quizzes 테이블이 생성되었습니다.' AS message
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'dream_track' 
    AND table_name = 'quizzes'
);

SELECT 'quiz_submissions 테이블이 생성되었습니다.' AS message
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'dream_track' 
    AND table_name = 'quiz_submissions'
);

