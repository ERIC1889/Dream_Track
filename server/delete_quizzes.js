// 모든 퀴즈 삭제 스크립트
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function deleteQuizzes() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dream_track',
  });

  try {
    console.log('\n=== 퀴즈 삭제 ===\n');

    // 기존 퀴즈 조회
    const [quizzes] = await connection.query('SELECT id, user_id, created_at FROM quizzes');
    console.log('📝 삭제할 퀴즈 목록:');
    console.table(quizzes);

    // 모든 퀴즈 삭제
    const [result] = await connection.query('DELETE FROM quizzes');
    console.log(`\n✅ ${result.affectedRows}개의 퀴즈가 삭제되었습니다.`);

  } catch (error) {
    console.error('❌ 오류:', error);
  } finally {
    await connection.end();
  }
}

deleteQuizzes();

