// 퀴즈 상태 확인 스크립트
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function checkQuizStatus() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dream_track',
  });

  try {
    console.log('\n=== 퀴즈 상태 확인 ===\n');

    // 1. 모든 퀴즈 목록
    const [quizzes] = await connection.query(`
      SELECT 
        id,
        user_id,
        total_questions,
        created_at,
        DATE(created_at) as created_date
      FROM quizzes
      ORDER BY created_at DESC
    `);
    
    console.log('📝 생성된 퀴즈 목록:');
    console.table(quizzes);

    // 2. 오늘 날짜 확인
    const today = new Date().toISOString().split('T')[0];
    console.log('\n📅 오늘 날짜:', today);

    // 3. 오늘의 퀴즈 조회 (실제 쿼리와 동일)
    const [todayQuizzes] = await connection.query(
      `SELECT * FROM quizzes 
       WHERE user_id = ? AND DATE(created_at) = ?
       ORDER BY created_at DESC LIMIT 1`,
      [2, today]
    );
    
    console.log('\n🎯 오늘의 퀴즈 조회 결과 (user_id=2):');
    if (todayQuizzes.length > 0) {
      console.table(todayQuizzes);
    } else {
      console.log('❌ 오늘의 퀴즈가 없습니다.');
      
      // 가장 최근 퀴즈 확인
      const [latestQuiz] = await connection.query(
        `SELECT id, user_id, created_at, DATE(created_at) as created_date
         FROM quizzes 
         WHERE user_id = ?
         ORDER BY created_at DESC LIMIT 1`,
        [2]
      );
      
      if (latestQuiz.length > 0) {
        console.log('\n📌 가장 최근 퀴즈:');
        console.table(latestQuiz);
        console.log(`\n비교: 오늘(${today}) vs 퀴즈 날짜(${latestQuiz[0].created_date})`);
      }
    }

  } catch (error) {
    console.error('❌ 오류:', error);
  } finally {
    await connection.end();
  }
}

checkQuizStatus();

