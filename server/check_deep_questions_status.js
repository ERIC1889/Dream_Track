// 심층 질문 상태 확인 스크립트
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function checkStatus() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dream_track',
  });

  try {
    console.log('\n=== 심층 질문 상태 확인 ===\n');

    // 1. deep_questions 테이블 구조 확인
    const [columns] = await connection.query(
      "SHOW COLUMNS FROM deep_questions"
    );
    console.log('📋 deep_questions 테이블 구조:');
    console.table(columns);

    // 2. 사용자별 질문 현황
    const [questions] = await connection.query(`
      SELECT 
        user_id,
        question_id,
        LEFT(question_text, 50) as question_preview,
        answer IS NOT NULL as has_answer,
        answered_at
      FROM deep_questions
      ORDER BY user_id, question_id
    `);
    console.log('\n📝 심층 질문 목록:');
    console.table(questions);

    // 3. deep_results 상태
    const [results] = await connection.query(`
      SELECT 
        user_id,
        is_completed,
        completed_at,
        LEFT(gap_summary, 50) as gap_preview
      FROM deep_results
    `);
    console.log('\n✅ deep_results 상태:');
    console.table(results);

    // 4. 사용자별 답변 완료 통계
    const [stats] = await connection.query(`
      SELECT 
        user_id,
        COUNT(*) as total_questions,
        SUM(CASE WHEN answer IS NOT NULL THEN 1 ELSE 0 END) as answered,
        SUM(CASE WHEN answer IS NULL THEN 1 ELSE 0 END) as remaining
      FROM deep_questions
      GROUP BY user_id
    `);
    console.log('\n📊 사용자별 답변 통계:');
    console.table(stats);

  } catch (error) {
    console.error('❌ 오류:', error);
  } finally {
    await connection.end();
  }
}

checkStatus();

