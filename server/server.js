import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/db.js';
import authRoutes from './routes/auth.js';
import preliminaryRoutes from './routes/preliminary.js';
import analysisRoutes from './routes/analysis.js';
import quizRoutes from './routes/quiz.js';

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS 설정 - 여러 origin 허용
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  process.env.CORS_ORIGIN
].filter(Boolean);

// 미들웨어 설정
app.use(cors({
  origin: function (origin, callback) {
    // origin이 없는 경우(Postman 등) 또는 허용된 origin인 경우
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 로깅 미들웨어
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// API 라우트
app.use('/api/auth', authRoutes);
app.use('/api/preliminary', preliminaryRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/quiz', quizRoutes);

// 루트 엔드포인트
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Dream Track API Server',
    version: '1.0.0',
    endpoints: {
      auth: {
        signup: 'POST /api/auth/signup',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me (인증 필요)',
        updateMe: 'PUT /api/auth/me (인증 필요)'
      },
      preliminary: {
        status: 'GET /api/preliminary/status (인증 필요)',
        questions: 'GET /api/preliminary/questions (인증 필요)',
        submit: 'POST /api/preliminary/submit (인증 필요)',
        result: 'GET /api/preliminary/result (인증 필요)'
      },
      analysis: {
        analyze: 'POST /api/analysis/analyze (인증 필요)',
        result: 'GET /api/analysis/result (인증 필요)',
        generateDeepQuestions: 'POST /api/analysis/generate-deep-questions (인증 필요)',
        deepQuestions: 'GET /api/analysis/deep-questions (인증 필요)',
        deepQuestion: 'GET /api/analysis/deep-question/:questionId (인증 필요)',
        submitDeepAnswer: 'POST /api/analysis/submit-deep-answer (인증 필요)',
        generateRoadmap: 'POST /api/analysis/generate-roadmap (인증 필요)',
        roadmap: 'GET /api/analysis/roadmap (인증 필요)',
        completeMilestone: 'PUT /api/analysis/roadmap/milestone/:milestoneId/complete (인증 필요)'
      },
      quiz: {
        generate: 'POST /api/quiz/generate (인증 필요)',
        today: 'GET /api/quiz/today (인증 필요)',
        submit: 'POST /api/quiz/submit (인증 필요)',
        history: 'GET /api/quiz/history (인증 필요)'
      }
    }
  });
});

// 헬스 체크 엔드포인트
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '요청한 엔드포인트를 찾을 수 없습니다.'
  });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error('서버 오류:', err);
  res.status(500).json({
    success: false,
    message: '서버 내부 오류가 발생했습니다.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 서버 시작
async function startServer() {
  try {
    // 데이터베이스 연결 테스트
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('⚠️  데이터베이스 연결 실패. 서버를 시작할 수 없습니다.');
      console.error('env.example 파일을 참고하여 .env 파일을 생성하고 데이터베이스 정보를 입력해주세요.');
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`🚀 Dream Track 서버가 시작되었습니다!`);
      console.log(`📡 포트: ${PORT}`);
      console.log(`🌍 환경: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 URL: http://localhost:${PORT}`);
      console.log(`📋 API 문서: http://localhost:${PORT}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });
  } catch (error) {
    console.error('서버 시작 실패:', error);
    process.exit(1);
  }
}

startServer();

