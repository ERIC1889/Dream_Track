import { getJson, postJson } from "../axios";

export interface Question {
  no: number;
  type: string;
  question: string;
  options?: string[];
  placeholder?: string;
}

export interface Answer {
  questionNo: number;
  questionType: string;
  questionText: string;
  answer: string | string[] | number;
}

export interface PreliminaryStatusResponse {
  success: boolean;
  data: {
    isCompleted: boolean;
    completedAt: string | null;
  };
}

export interface QuestionsResponse {
  success: boolean;
  data: {
    questions: Question[];
  };
}

export interface SubmitResponse {
  success: boolean;
  message: string;
  data: {
    result: any;
  };
}

export interface ResultResponse {
  success: boolean;
  data: {
    isCompleted: boolean;
    completedAt: string;
    resultData: any;
    assessments: Array<{
      questionNo: number;
      questionType: string;
      questionText: string;
      answer: string;
      createdAt: string;
    }>;
  };
}

export const preliminaryApi = {
  /**
   * 기본 진단 완료 여부 확인
   */
  getStatus: async (): Promise<PreliminaryStatusResponse> => {
    return await getJson("/api/preliminary/status");
  },

  /**
   * 기본 진단 질문 목록 조회
   */
  getQuestions: async (): Promise<QuestionsResponse> => {
    return await getJson("/api/preliminary/questions");
  },

  /**
   * 기본 진단 제출
   */
  submit: async (answers: Answer[]): Promise<SubmitResponse> => {
    return await postJson("/api/preliminary/submit", { answers });
  },

  /**
   * 기본 진단 결과 조회
   */
  getResult: async (): Promise<ResultResponse> => {
    return await getJson("/api/preliminary/result");
  },
};

