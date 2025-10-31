import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getDeepQuestion, submitDeepAnswer, getDeepQuestions } from "@/lib/api/analysis";

export default function DeepQuestionBoard() {
  const [answer, setAnswer] = useState<string>("");
  const [question, setQuestion] = useState<string>("");
  const [currentQuestionId, setCurrentQuestionId] = useState<number>(1);
  const [totalQuestions, setTotalQuestions] = useState<number>(5);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const questionIdParam = searchParams.get("questionId");

  useEffect(() => {
    const questionId = questionIdParam ? parseInt(questionIdParam) : 1;
    setCurrentQuestionId(questionId);
    loadQuestion(questionId);
  }, [questionIdParam]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [question]);

  const loadQuestion = async (questionId: number) => {
    try {
      setIsLoading(true);
      setError("");
      
      // 총 질문 수 확인
      const allQuestionsResponse = await getDeepQuestions();
      if (allQuestionsResponse.success) {
        setTotalQuestions(allQuestionsResponse.data.deepDiveQuestions.length);
      }

      // 현재 질문 로드
      const response = await getDeepQuestion(questionId);
      if (response.success) {
        setQuestion(response.data.question);
        setAnswer(response.data.answer || "");
      } else {
        setError(response.message || "질문을 불러올 수 없습니다.");
      }
    } catch (err: any) {
      console.error("질문 로드 오류:", err);
      setError(err.message || "질문을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!answer.trim()) {
      alert("답변을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await submitDeepAnswer(currentQuestionId, answer);

      if (response.success) {
        // 서버에서 반환한 allAnswered 확인 (더 안전)
        const isAllAnswered = response.data?.allAnswered || false;
        
        // 모든 질문에 답변 완료되었거나 마지막 질문인 경우
        if (isAllAnswered || currentQuestionId >= totalQuestions) {
          console.log('✅ 모든 답변 완료, 로드맵 생성 페이지로 이동');
          // 모든 질문에 답변 완료 - 로드맵 생성 페이지로 이동
          navigate("/roadmap-loading");
        } else {
          // 다음 질문으로 이동
          const nextQuestionId = currentQuestionId + 1;
          navigate(`/deep-question-board?questionId=${nextQuestionId}`);
        }
      } else {
        setError(response.message || "답변 제출에 실패했습니다.");
      }
    } catch (err: any) {
      console.error("답변 제출 오류:", err);
      setError(err.message || "답변 제출 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#8e9c78] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600">질문을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="absolute top-5 left-[18px] typo-h1">DreamTrack</div>

      {/* 진행 상태 표시 */}
      <div className="absolute top-5 right-[18px] text-sm text-gray-600">
        질문 {currentQuestionId} / {totalQuestions}
      </div>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-[700px]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* 질문 박스 */}
            <div className="w-full">
              <div className="w-full min-h-[80px] flex items-center px-5 py-4 rounded-[10px] border-2 border-[#8e9c78] bg-[#f9faf8]">
                <p className="w-full text-base [font-family:'Inter-Regular',Helvetica] leading-relaxed">
                  {question}
                </p>
              </div>
            </div>

            {/* 주관식 입력창 */}
            <textarea
              ref={textareaRef}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="여기에 답변을 작성해주세요..."
              className="w-full h-48 p-4 rounded-[10px] border-2 border-gray-200 resize-none placeholder:text-gray-400 focus:outline-none focus:border-[#8e9c78] focus:ring-2 focus:ring-[#e6f0d9]"
              aria-label="주관식 응답"
            />

            {/* 글자 수 표시 */}
            <div className="flex justify-between text-sm text-gray-500">
              <span>자유롭게 답변해주세요</span>
              <span>{answer.length}자</span>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded text-red-700">
                {error}
              </div>
            )}

            {/* 버튼 영역 */}
            <div className="flex gap-3">
              {currentQuestionId > 1 && (
                <button
                  type="button"
                  onClick={() => navigate(`/deep-question-board?questionId=${currentQuestionId - 1}`)}
                  disabled={isSubmitting}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-[10px] font-semibold hover:bg-gray-50 transition disabled:opacity-50"
                >
                  이전
                </button>
              )}
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-[#8e9c78] text-white py-3 rounded-[10px] font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    제출 중...
                  </span>
                ) : currentQuestionId >= totalQuestions ? (
                  "완료"
                ) : (
                  "다음 질문"
                )}
              </button>
            </div>
          </form>

          {/* 진행 안내 */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {currentQuestionId >= totalQuestions
                ? "마지막 질문입니다. 답변을 제출하면 결과를 확인할 수 있습니다."
                : `${totalQuestions - currentQuestionId}개의 질문이 남았습니다.`}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

