-- 로드맵 기능 추가를 위한 테이블

USE dream_track;

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
    category VARCHAR(100) COMMENT '카테고리 (예: 학습, 프로젝트, 자격증)',
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
    INDEX idx_target_date (target_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 테이블 생성 확인
SELECT 'roadmaps 테이블이 생성되었습니다.' AS message
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'dream_track' 
    AND table_name = 'roadmaps'
);

SELECT 'roadmap_milestones 테이블이 생성되었습니다.' AS message
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'dream_track' 
    AND table_name = 'roadmap_milestones'
);

