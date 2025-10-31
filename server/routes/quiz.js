import express from 'express';
import { pool } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { generateQuiz } from '../utils/openai.js';

const router = express.Router();

/**
 * POST /api/quiz/generate
 * 퀴즈 생성 (분석 결과 + 로드맵 기반)
 */
router.post('/generate', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const userId = req.user.id;

    // 기본 진단 분석 결과 조회
    const [analysisResults] = await connection.query(
      'SELECT * FROM ai_analysis WHERE user_id = ?',
      [userId]
    );

    if (analysisResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: '기본 진단 분석 결과가 없습니다.'
      });
    }

    const analysisRecord = analysisResults[0];
    const analysisResult = typeof analysisRecord.analysis_data === 'string'
      ? JSON.parse(analysisRecord.analysis_data)
      : analysisRecord.analysis_data;

    // 로드맵 조회
    const [roadmaps] = await connection.query(
      'SELECT * FROM roadmaps WHERE user_id = ?',
      [userId]
    );

    if (roadmaps.length === 0) {
      return res.status(404).json({
        success: false,
        message: '로드맵이 없습니다. 먼저 심층 진단을 완료해주세요.'
      });
    }

    const roadmap = roadmaps[0];
    const roadmapData = typeof roadmap.roadmap_data === 'string'
      ? JSON.parse(roadmap.roadmap_data)
      : roadmap.roadmap_data;

    // 심층 진단 결과 조회
    const [deepResults] = await connection.query(
      'SELECT gap_summary FROM deep_results WHERE user_id = ?',
      [userId]
    );

    const deepQuestionData = {
      gapSummary: deepResults.length > 0 ? deepResults[0].gap_summary : ''
    };

    // 오늘 생성된 퀴즈가 있는지 확인
    const today = new Date().toISOString().split('T')[0];
    const [existingQuizzes] = await connection.query(
      `SELECT * FROM quizzes 
       WHERE user_id = ? AND DATE(created_at) = ?
       ORDER BY created_at DESC LIMIT 1`,
      [userId, today]
    );

    if (existingQuizzes.length > 0) {
      // 오늘 이미 생성된 퀴즈 반환
      const existingQuiz = existingQuizzes[0];
      const quizData = typeof existingQuiz.quiz_data === 'string'
        ? JSON.parse(existingQuiz.quiz_data)
        : existingQuiz.quiz_data;

      return res.status(200).json({
        success: true,
        message: '오늘 생성된 퀴즈를 반환합니다.',
        data: {
          quizId: existingQuiz.id,
          questions: quizData.questions,
          isNew: false
        }
      });
    }

    // AI로 퀴즈 생성
    console.log('퀴즈 생성 시작...');
    const quizResult = await generateQuiz(analysisResult, roadmapData, deepQuestionData);

    if (!quizResult.success) {
      throw new Error('퀴즈 생성에 실패했습니다.');
    }

    const quiz = quizResult.quiz;
    
    console.log('📊 생성된 퀴즈 구조:', JSON.stringify(quiz, null, 2).substring(0, 800));
    console.log('❓ questions 필드 존재 여부:', !!quiz.questions);
    console.log('❓ quiz.quiz 필드 존재 여부:', !!quiz.quiz);
    console.log('❓ quiz 타입:', typeof quiz);

    // 퀴즈 데이터 정규화
    let normalizedQuiz = quiz;
    
    if (quiz.questions && Array.isArray(quiz.questions)) {
      // 이미 올바른 형식: { quizTitle: "...", questions: [...] }
      console.log('✅ 표준 형식 감지 (questions 배열)');
      normalizedQuiz = {
        title: quiz.quizTitle || quiz.title || '오늘의 퀴즈',
        questions: quiz.questions.map((q, index) => ({
          question_number: q.question_number || (index + 1),
          question: q.question,
          options: q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
          type: q.type || 'general'
        }))
      };
    } else if (quiz.quiz && !quiz.questions) {
      // 구버전 프롬프트 형식: { quizTitle: "...", quiz: {...} }
      console.log('✅ 구버전 단일 퀴즈 객체 감지, 배열로 변환');
      normalizedQuiz = {
        title: quiz.quizTitle || '오늘의 퀴즈',
        questions: [{
          question_number: 1,
          question: quiz.quiz.question,
          options: quiz.quiz.options,
          correct_answer: quiz.quiz.options[quiz.quiz.answerIndex],
          explanation: quiz.quiz.explanation,
          type: quiz.quiz.type || 'trend'
        }]
      };
    } else if (Array.isArray(quiz)) {
      // quiz가 배열이면 questions로 감싸기
      console.log('✅ 배열 형식 감지, questions로 감싸기');
      normalizedQuiz = { 
        title: '오늘의 퀴즈',
        questions: quiz 
      };
    } else if (!quiz.questions && quiz.question) {
      // 단일 질문 객체
      console.log('✅ 단일 질문 객체 감지, 배열로 변환');
      normalizedQuiz = { 
        title: '오늘의 퀴즈',
        questions: [quiz] 
      };
    }
    
    console.log(`✅ 정규화 완료: ${normalizedQuiz.questions?.length || 0}개 문제`);

    // 퀴즈 저장
    await connection.beginTransaction();

    const [quizInsert] = await connection.query(
      `INSERT INTO quizzes 
       (user_id, roadmap_id, quiz_data, total_questions)
       VALUES (?, ?, ?, ?)`,
      [
        userId,
        roadmap.id,
        JSON.stringify(normalizedQuiz),
        normalizedQuiz.questions?.length || 10
      ]
    );

    await connection.commit();

    console.log('퀴즈 생성 및 저장 완료');

    res.status(200).json({
      success: true,
      message: '퀴즈가 생성되었습니다.',
      data: {
        quizId: quizInsert.insertId,
        questions: quiz.questions,
        tokensUsed: quizResult.tokensUsed,
        isNew: true
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('퀴즈 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: error.message || '퀴즈 생성 중 오류가 발생했습니다.'
    });
  } finally {
    connection.release();
  }
});

/**
 * GET /api/quiz/today
 * 오늘의 퀴즈 조회
 */
router.get('/today', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 한국 시간 기준 오늘 날짜
    const now = new Date();
    const koreaTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    const today = koreaTime.toISOString().split('T')[0];

    console.log(`퀴즈 조회: user_id=${userId}, 오늘 날짜=${today}`);

    // CONVERT_TZ를 사용하여 한국 시간으로 변환 후 비교
    const [quizzes] = await pool.query(
      `SELECT * FROM quizzes 
       WHERE user_id = ? 
       AND DATE(CONVERT_TZ(created_at, '+00:00', '+09:00')) = ?
       ORDER BY created_at DESC LIMIT 1`,
      [userId, today]
    );

    if (quizzes.length === 0) {
      console.log(`❌ 오늘의 퀴즈 없음: user_id=${userId}`);
      return res.status(404).json({
        success: false,
        message: '오늘의 퀴즈가 없습니다.'
      });
    }
    
    console.log(`✅ 퀴즈 찾음: quiz_id=${quizzes[0].id}`);

    const quiz = quizzes[0];
    let quizData = typeof quiz.quiz_data === 'string'
      ? JSON.parse(quiz.quiz_data)
      : quiz.quiz_data;

    // 퀴즈 데이터 정규화 (구버전 호환)
    let questions = [];
    if (Array.isArray(quizData)) {
      // quizData가 배열이면 그대로 사용
      questions = quizData;
    } else if (quizData.questions && Array.isArray(quizData.questions)) {
      // questions 필드가 있으면 사용
      questions = quizData.questions;
    } else if (quizData.quiz) {
      // { quizTitle: "...", quiz: {...} } 형식
      questions = [{
        question_number: 1,
        question: quizData.quiz.question,
        options: quizData.quiz.options,
        correct_answer: quizData.quiz.options[quizData.quiz.answerIndex],
        explanation: quizData.quiz.explanation,
        type: quizData.quiz.type || 'trend'
      }];
    } else if (quizData && quizData.question) {
      // 단일 객체면 배열로 감싸기
      questions = [quizData];
    }

    // question_number 자동 할당 (없는 경우)
    questions = questions.map((q, index) => ({
      ...q,
      question_number: q.question_number || (index + 1)
    }));

    console.log(`📊 반환할 질문 수: ${questions.length}`);

    res.status(200).json({
      success: true,
      data: {
        quizId: quiz.id,
        questions: questions,
        totalQuestions: quiz.total_questions,
        createdAt: quiz.created_at
      }
    });

  } catch (error) {
    console.error('퀴즈 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '퀴즈 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * POST /api/quiz/submit
 * 퀴즈 제출 및 채점
 */
router.post('/submit', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const userId = req.user.id;
    const { quizId, answers } = req.body;

    if (!quizId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: '퀴즈 ID와 답변이 필요합니다.'
      });
    }

    // 퀴즈 조회
    const [quizzes] = await connection.query(
      'SELECT * FROM quizzes WHERE id = ? AND user_id = ?',
      [quizId, userId]
    );

    if (quizzes.length === 0) {
      return res.status(404).json({
        success: false,
        message: '퀴즈를 찾을 수 없습니다.'
      });
    }

    const quiz = quizzes[0];
    const quizData = typeof quiz.quiz_data === 'string'
      ? JSON.parse(quiz.quiz_data)
      : quiz.quiz_data;

    // 채점
    let correctAnswers = 0;
    const totalQuestions = quizData.questions.length;

    answers.forEach((userAnswer) => {
      const question = quizData.questions.find(q => q.question_number === userAnswer.questionNumber);
      if (question && question.correct_answer === userAnswer.answer) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / totalQuestions) * 100);

    // 제출 기록 저장
    await connection.beginTransaction();

    await connection.query(
      `INSERT INTO quiz_submissions 
       (user_id, quiz_id, answers, score, total_questions, correct_answers)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        quizId,
        JSON.stringify(answers),
        score,
        totalQuestions,
        correctAnswers
      ]
    );

    await connection.commit();

    // 점수에 따른 메시지 생성
    let message = '';
    let encouragement = '';

    if (score >= 90) {
      message = '완벽해요!';
      encouragement = '목표를 향해 확실히 나아가고 있어요';
    } else if (score >= 70) {
      message = '잘하고 있어요!';
      encouragement = '조금씩 성장하고 있어요';
    } else if (score >= 50) {
      message = '좋은 시작이에요!';
      encouragement = '꾸준히 하면 더 나아질 거예요';
    } else {
      message = '괜찮아요!';
      encouragement = '처음이 어려운 법이에요, 포기하지 마세요';
    }

    res.status(200).json({
      success: true,
      message: '퀴즈 제출이 완료되었습니다.',
      data: {
        score,
        correctAnswers,
        totalQuestions,
        message,
        encouragement
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('퀴즈 제출 오류:', error);
    res.status(500).json({
      success: false,
      message: error.message || '퀴즈 제출 중 오류가 발생했습니다.'
    });
  } finally {
    connection.release();
  }
});

/**
 * GET /api/quiz/history
 * 퀴즈 제출 기록 조회
 */
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [submissions] = await pool.query(
      `SELECT qs.*, q.created_at as quiz_date
       FROM quiz_submissions qs
       JOIN quizzes q ON qs.quiz_id = q.id
       WHERE qs.user_id = ?
       ORDER BY qs.completed_at DESC
       LIMIT 30`,
      [userId]
    );

    res.status(200).json({
      success: true,
      data: {
        submissions: submissions.map(s => ({
          id: s.id,
          score: s.score,
          correctAnswers: s.correct_answers,
          totalQuestions: s.total_questions,
          completedAt: s.completed_at,
          quizDate: s.quiz_date
        }))
      }
    });

  } catch (error) {
    console.error('퀴즈 기록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '퀴즈 기록 조회 중 오류가 발생했습니다.'
    });
  }
});

export default router;

