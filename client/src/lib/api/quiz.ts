import { api } from '../axios';

export interface QuizQuestion {
  question_number: number;
  question: string;
  options: {
    id: string;
    text: string;
  }[];
  correct_answer: string;
}

export interface QuizAnswer {
  questionNumber: number;
  answer: string;
}

/**
 * 퀴즈 생성
 */
export const generateQuiz = async () => {
  try {
    const response = await api.post('/api/quiz/generate');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '퀴즈 생성에 실패했습니다.');
  }
};

/**
 * 오늘의 퀴즈 조회
 */
export const getTodayQuiz = async () => {
  try {
    const response = await api.get('/api/quiz/today');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '퀴즈 조회에 실패했습니다.');
  }
};

/**
 * 퀴즈 제출
 */
export const submitQuiz = async (quizId: number, answers: QuizAnswer[]) => {
  try {
    const response = await api.post('/api/quiz/submit', {
      quizId,
      answers
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '퀴즈 제출에 실패했습니다.');
  }
};

/**
 * 퀴즈 기록 조회
 */
export const getQuizHistory = async () => {
  try {
    const response = await api.get('/api/quiz/history');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '퀴즈 기록 조회에 실패했습니다.');
  }
};

