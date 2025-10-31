// is_completed 상태를 수동으로 업데이트
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function fixCompletedStatus() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dream_track',
  });

  try {
    console.log('\n=== is_completed 상태 수정 ===\n');

    // 모든 질문에 답변한 사용자 찾기
    const [users] = await connection.query(`
      SELECT 
        user_id,
        COUNT(*) as total,
        SUM(CASE WHEN answer IS NOT NULL THEN 1 ELSE 0 END) as answered
      FROM deep_questions
      GROUP BY user_id
      HAVING total = answered
    `);

    console.log('📊 모든 질문에 답변한 사용자:');
    console.table(users);

    // 해당 사용자들의 deep_results 업데이트
    for (const user of users) {
      const [result] = await connection.query(
        `UPDATE deep_results 
         SET is_completed = TRUE, completed_at = NOW()
         WHERE user_id = ? AND is_completed = FALSE`,
        [user.user_id]
      );
      
      console.log(`✅ user_id=${user.user_id} 업데이트 완료 (affectedRows=${result.affectedRows})`);
    }

    // 업데이트 후 상태 확인
    const [results] = await connection.query(`
      SELECT 
        user_id,
        is_completed,
        completed_at
      FROM deep_results
    `);
    
    console.log('\n✅ 업데이트 후 deep_results 상태:');
    console.table(results);

  } catch (error) {
    console.error('❌ 오류:', error);
  } finally {
    await connection.end();
  }
}

fixCompletedStatus();

