-- ============================================
-- DreamTrack 전체 테이블 업데이트 스크립트
-- ============================================
-- 이 스크립트는 AI 분석, 심층 질문, 로드맵, 퀴즈 기능을 위한
-- 모든 테이블을 생성합니다.
--
-- 실행 방법:
-- mysql -u root -p dream_track < server/database/update_all_tables.sql
-- ============================================

USE dream_track;

-- ============================================
-- 1. AI 분석 관련 테이블
-- ============================================

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
    personality_traits TEXT COMMENT '성격 특성',
    recommended_fields JSON COMMENT '추천 분야',
    key_insights TEXT COMMENT '핵심 통찰',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (preliminary_result_id) REFERENCES preliminary_results(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_analysis (user_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. 심층 질문 관련 테이블
-- ============================================

-- 심층 질문 및 답변 테이블 (수정된 구조)
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

-- 심층 진단 완료 상태 테이블 (gap_summary 추가)
CREATE TABLE IF NOT EXISTS deep_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    analysis_id INT NOT NULL,
    gap_summary TEXT COMMENT '갭 분석 요약',
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (analysis_id) REFERENCES ai_analysis(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_completed (is_completed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. 로드맵 관련 테이블
-- ============================================

-- 로드맵 테이블
CREATE TABLE IF NOT EXISTS roadmaps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    analysis_id INT NOT NULL,
    deep_result_id INT NOT NULL,
    roadmap_data JSON NOT NULL COMMENT '전체 로드맵 데이터',
    title VARCHAR(255) COMMENT '로드맵 제목',
    description TEXT COMMENT '로드맵 설명',
    start_date DATE COMMENT '시작일',
    end_date DATE COMMENT '종료일',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (analysis_id) REFERENCES ai_analysis(id) ON DELETE CASCADE,
    FOREIGN KEY (deep_result_id) REFERENCES deep_results(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 로드맵 마일스톤 테이블 (캘린더에 표시될 세부 항목)
CREATE TABLE IF NOT EXISTS roadmap_milestones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roadmap_id INT NOT NULL,
    user_id INT NOT NULL,
    milestone_order INT NOT NULL COMMENT '순서',
    title VARCHAR(255) NOT NULL COMMENT '마일스톤 제목',
    description TEXT COMMENT '상세 설명',
    category VARCHAR(100) COMMENT '카테고리 (교외활동, 교내활동, 자기개발)',
    target_date DATE COMMENT '목표 완료일',
    duration_weeks INT COMMENT '예상 소요 기간(주)',
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    tasks JSON COMMENT '세부 작업 목록',
    resources JSON COMMENT '필요 자원 및 참고 자료',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (roadmap_id) REFERENCES roadmaps(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_roadmap_id (roadmap_id),
    INDEX idx_user_id (user_id),
    INDEX idx_target_date (target_date),
    INDEX idx_completed (is_completed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. 퀴즈 관련 테이블
-- ============================================

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

-- ============================================
-- 테이블 생성 확인
-- ============================================

SELECT 'ai_analysis 테이블 확인' AS step,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'dream_track' 
        AND table_name = 'ai_analysis'
    ) THEN '✓ 생성됨' ELSE '✗ 생성 실패' END AS status;

SELECT 'deep_questions 테이블 확인' AS step,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'dream_track' 
        AND table_name = 'deep_questions'
    ) THEN '✓ 생성됨' ELSE '✗ 생성 실패' END AS status;

SELECT 'deep_results 테이블 확인' AS step,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'dream_track' 
        AND table_name = 'deep_results'
    ) THEN '✓ 생성됨' ELSE '✗ 생성 실패' END AS status;

SELECT 'roadmaps 테이블 확인' AS step,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'dream_track' 
        AND table_name = 'roadmaps'
    ) THEN '✓ 생성됨' ELSE '✗ 생성 실패' END AS status;

SELECT 'roadmap_milestones 테이블 확인' AS step,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'dream_track' 
        AND table_name = 'roadmap_milestones'
    ) THEN '✓ 생성됨' ELSE '✗ 생성 실패' END AS status;

SELECT 'quizzes 테이블 확인' AS step,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'dream_track' 
        AND table_name = 'quizzes'
    ) THEN '✓ 생성됨' ELSE '✗ 생성 실패' END AS status;

SELECT 'quiz_submissions 테이블 확인' AS step,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'dream_track' 
        AND table_name = 'quiz_submissions'
    ) THEN '✓ 생성됨' ELSE '✗ 생성 실패' END AS status;

-- 전체 테이블 목록 표시
SELECT '=== 전체 테이블 목록 ===' AS info;
SHOW TABLES;

-- 완료 메시지
SELECT '데이터베이스 업데이트가 완료되었습니다!' AS message;

