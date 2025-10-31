import { api } from '../axios';

// 분석 결과 타입 정의
export interface AnalysisResult {
  strengths: string;
  interests: string;
  career_direction: string;
  areas_to_improve: string;
  personality_traits?: string;
  recommended_fields?: string[];
  key_insights?: string;
}

export interface DeepQuestion {
  id: number;
  question: string;
  answer?: string;
}

export interface DeepQuestionsResponse {
  gapSummary: string;
  deepDiveQuestions: DeepQuestion[];
}

/**
 * 기본 진단 결과를 AI로 분석
 */
export const analyzePreliminaryResult = async () => {
  try {
    const response = await api.post('/api/analysis/analyze');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'AI 분석에 실패했습니다.');
  }
};

/**
 * 분석 결과 조회
 */
export const getAnalysisResult = async () => {
  try {
    const response = await api.get('/api/analysis/result');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '분석 결과 조회에 실패했습니다.');
  }
};

/**
 * 심층 질문 생성
 */
export const generateDeepQuestions = async () => {
  try {
    const response = await api.post('/api/analysis/generate-deep-questions');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '심층 질문 생성에 실패했습니다.');
  }
};

/**
 * 심층 질문 조회
 */
export const getDeepQuestions = async () => {
  try {
    const response = await api.get('/api/analysis/deep-questions');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '심층 질문 조회에 실패했습니다.');
  }
};

/**
 * 심층 질문 개별 답변 제출
 */
export const submitDeepAnswer = async (questionId: number, answer: string) => {
  try {
    const response = await api.post('/api/analysis/submit-deep-answer', {
      questionId,
      answer
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '답변 제출에 실패했습니다.');
  }
};

/**
 * 특정 심층 질문 조회
 */
export const getDeepQuestion = async (questionId: number) => {
  try {
    const response = await api.get(`/api/analysis/deep-question/${questionId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '질문 조회에 실패했습니다.');
  }
};

/**
 * 로드맵 생성
 */
export const generateRoadmap = async () => {
  try {
    const response = await api.post('/api/analysis/generate-roadmap');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '로드맵 생성에 실패했습니다.');
  }
};

/**
 * 로드맵 조회
 */
export const getRoadmap = async () => {
  try {
    const response = await api.get('/api/analysis/roadmap');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '로드맵 조회에 실패했습니다.');
  }
};

/**
 * 마일스톤 완료 처리
 */
export const completeMilestone = async (milestoneId: number) => {
  try {
    const response = await api.put(`/api/analysis/roadmap/milestone/${milestoneId}/complete`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '마일스톤 완료 처리에 실패했습니다.');
  }
};

