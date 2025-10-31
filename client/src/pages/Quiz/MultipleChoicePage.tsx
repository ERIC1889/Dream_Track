import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MultipleChoice from "../../components/quiz/MultipleChoice";
import { getTodayQuiz, submitQuiz, type QuizQuestion, type QuizAnswer } from "@/lib/api/quiz";

export default function MultipleChoicePage() {
  const [selected, setSelected] = useState<string | undefined>(undefined);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [quizId, setQuizId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  // 퀴즈 로드
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await getTodayQuiz();
        
        if (response.success) {
          setQuestions(response.data.questions);
          setQuizId(response.data.quizId);
        } else {
          setError(response.message || "퀴즈를 불러올 수 없습니다.");
        }
      } catch (err: any) {
        console.error("퀴즈 로드 오류:", err);
        setError(err.message || "퀴즈를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    loadQuiz();
  }, []);

  // 퀴즈가 로드되지 않았으면 null 체크
  const currentQuestion = questions.length > 0 ? questions[currentQuestionIndex] : null;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleChange = useCallback((id: string) => {
    setSelected(id);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selected) return alert("보기를 선택해주세요.");
    if (!currentQuestion) return; // null 체크 추가

    // 선택한 인덱스를 실제 텍스트로 변환
    const selectedIndex = parseInt(selected);
    const selectedText = currentQuestion.options[selectedIndex];

    // 현재 답변 저장
    const newAnswers = [
      ...answers,
      {
        questionNumber: currentQuestion.question_number,
        answer: selectedText  // 실제 텍스트로 저장
      }
    ];
    setAnswers(newAnswers);

    if (isLastQuestion) {
      // 마지막 질문 - 퀴즈 제출
      setIsSubmitting(true);
      try {
        if (!quizId) {
          throw new Error("퀴즈 ID가 없습니다.");
        }

        const response = await submitQuiz(quizId, newAnswers);

        if (response.success) {
          // 결과 페이지로 이동 (결과 데이터 전달)
          navigate("/result", {
            state: {
              score: response.data.score,
              correctAnswers: response.data.correctAnswers,
              totalQuestions: response.data.totalQuestions,
              message: response.data.message,
              encouragement: response.data.encouragement
            }
          });
        } else {
          setError(response.message || "퀴즈 제출에 실패했습니다.");
        }
      } catch (err: any) {
        console.error("퀴즈 제출 오류:", err);
        setError(err.message || "퀴즈 제출 중 오류가 발생했습니다.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // 다음 질문으로
      setCurrentQuestionIndex(prev => prev + 1);
      setSelected(undefined);
    }
  }, [selected, currentQuestion, isLastQuestion, answers, quizId, navigate]);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#8e9c78] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600">퀴즈를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error && questions.length === 0) {
    return (
      <div className="w-full flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">오류가 발생했습니다</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate("/home")}
              className="px-6 py-3 bg-[#8e9c78] text-white rounded-xl hover:opacity-90 transition-opacity font-medium"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="w-full flex items-center justify-center py-10">
      <div className="absolute top-5 left-[18px] typo-h1">DreamTrack</div>
      
      {/* 진행 상태 표시 */}
      <div className="absolute top-5 right-[18px] text-sm text-gray-600">
        {currentQuestionIndex + 1} / {questions.length}
      </div>

      <div className="w-[873px] px-4 flex flex-col justify-center min-h-screen">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded text-red-700">
            {error}
          </div>
        )}

        <MultipleChoice
          questionNumber={currentQuestion.question_number}
          caption="Question"
          question={currentQuestion.question}
          options={currentQuestion.options.map((opt: string, index: number) => ({
            id: String(index),
            text: opt
          }))}
          value={selected}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitLabel={isSubmitting ? "제출 중..." : isLastQuestion ? "제출하기" : "다음으로"}
        />
      </div>
    </div>
  );
}
