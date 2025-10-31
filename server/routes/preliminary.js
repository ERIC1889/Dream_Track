import express from 'express';
import { pool } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/preliminary/status
 * 기본 진단 완료 여부 확인 API
 */
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // 사용자의 기본 진단 결과 조회
    const [results] = await pool.query(
      'SELECT is_completed, completed_at FROM preliminary_results WHERE user_id = ?',
      [userId]
    );

    if (results.length === 0) {
      // 기본 진단을 진행하지 않은 경우
      return res.status(200).json({
        success: true,
        data: {
          isCompleted: false,
          completedAt: null
        }
      });
    }

    const result = results[0];
    res.status(200).json({
      success: true,
      data: {
        isCompleted: result.is_completed,
        completedAt: result.completed_at
      }
    });
  } catch (error) {
    console.error('기본 진단 상태 확인 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * GET /api/preliminary/questions
 * 기본 진단 질문 목록 조회 API
 */
router.get('/questions', authenticateToken, async (req, res) => {
  try {
    // 질문세트_완성본.json에서 질문 목록 불러오기
    const fs = await import('fs/promises');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    const questionsPath = path.join(__dirname, '../../Data/basicquiz.json');
    const questionsData = await fs.readFile(questionsPath, 'utf-8');
    const questions = JSON.parse(questionsData);

    res.status(200).json({
      success: true,
      data: {
        questions
      }
    });
  } catch (error) {
    console.error('질문 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '질문 목록을 불러오는 중 오류가 발생했습니다.'
    });
  }
});

/**
 * POST /api/preliminary/submit
 * 기본 진단 제출 API
 */
router.post('/submit', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const userId = req.user.id;
    const { answers } = req.body;

    // 필수 필드 검증
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: '답변 데이터가 올바르지 않습니다.'
      });
    }

    await connection.beginTransaction();

    // 기존 기본 진단 데이터 삭제 (재진단 허용)
    await connection.query(
      'DELETE FROM preliminary_assessments WHERE user_id = ?',
      [userId]
    );

    // 새로운 답변들 저장
    for (const answer of answers) {
      await connection.query(
        `INSERT INTO preliminary_assessments 
         (user_id, question_no, question_type, question_text, answer)
         VALUES (?, ?, ?, ?, ?)`,
        [
          userId,
          answer.questionNo,
          answer.questionType,
          answer.questionText,
          typeof answer.answer === 'object' ? JSON.stringify(answer.answer) : answer.answer
        ]
      );
    }

    // 결과 데이터 분석 (간단한 통계)
    const resultData = {
      totalQuestions: answers.length,
      submittedAt: new Date().toISOString(),
      answerSummary: answers.map(a => ({
        questionNo: a.questionNo,
        answer: a.answer
      }))
    };

    // 기본 진단 결과 저장 또는 업데이트
    await connection.query(
      `INSERT INTO preliminary_results 
       (user_id, is_completed, completed_at, result_data)
       VALUES (?, TRUE, NOW(), ?)
       ON DUPLICATE KEY UPDATE 
       is_completed = TRUE,
       completed_at = NOW(),
       result_data = ?`,
      [userId, JSON.stringify(resultData), JSON.stringify(resultData)]
    );

    await connection.commit();

    res.status(200).json({
      success: true,
      message: '기본 진단이 성공적으로 제출되었습니다.',
      data: {
        result: resultData
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('기본 진단 제출 오류:', error);
    res.status(500).json({
      success: false,
      message: '기본 진단 제출 중 오류가 발생했습니다.'
    });
  } finally {
    connection.release();
  }
});

/**
 * GET /api/preliminary/result
 * 사용자의 기본 진단 결과 조회 API
 */
router.get('/result', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // 기본 진단 결과 조회
    const [results] = await pool.query(
      `SELECT is_completed, completed_at, result_data 
       FROM preliminary_results 
       WHERE user_id = ? AND is_completed = TRUE`,
      [userId]
    );

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: '완료된 기본 진단 결과가 없습니다.'
      });
    }

    const result = results[0];
    
    // 기본 진단 응답 조회
    const [assessments] = await pool.query(
      `SELECT question_no, question_type, question_text, answer, created_at
       FROM preliminary_assessments
       WHERE user_id = ?
       ORDER BY question_no ASC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      data: {
        isCompleted: result.is_completed,
        completedAt: result.completed_at,
        resultData: typeof result.result_data === 'string' 
          ? JSON.parse(result.result_data) 
          : result.result_data,
        assessments: assessments.map(a => ({
          questionNo: a.question_no,
          questionType: a.question_type,
          questionText: a.question_text,
          answer: a.answer,
          createdAt: a.created_at
        }))
      }
    });
  } catch (error) {
    console.error('기본 진단 결과 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '기본 진단 결과 조회 중 오류가 발생했습니다.'
    });
  }
});

export default router;

