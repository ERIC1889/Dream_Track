import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { preliminaryApi } from "@/lib/api/preliminary";
import type { Question, Answer } from "@/lib/api/preliminary";

export default function PreliminaryPage() {
  const navigate = useNavigate();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, string | string[]>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  // 질문 목록 불러오기
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await preliminaryApi.getQuestions();
        if (response.success) {
          setQuestions(response.data.questions);
        } else {
          setError("질문을 불러오는데 실패했습니다.");
        }
      } catch (err: any) {
        console.error("질문 불러오기 오류:", err);
        setError(err.response?.data?.message || "질문을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Likert Scale 질문의 경우 기본값 3을 자동 설정
  useEffect(() => {
    if (currentQuestion && currentQuestion.type === "Likert Scale") {
      const currentAnswer = answers.get(currentQuestion.no);
      if (currentAnswer === undefined) {
        setAnswers(prev => {
          const newAnswers = new Map(prev);
          newAnswers.set(currentQuestion.no, "3");
          return newAnswers;
        });
      }
    }
  }, [currentQuestion, answers]);

  // 답변 변경 핸들러 - 단일 선택 (Likert, Single Choice)
  const handleAnswerChange = useCallback((value: string) => {
    setAnswers(prev => {
      const newAnswers = new Map(prev);
      newAnswers.set(currentQuestion.no, value);
      return newAnswers;
    });
  }, [currentQuestion]);

  // 답변 변경 핸들러 - 복수 선택
  const handleMultipleAnswerChange = useCallback((option: string, checked: boolean) => {
    setAnswers(prev => {
      const newAnswers = new Map(prev);
      const currentAnswers = (newAnswers.get(currentQuestion.no) as string[]) || [];
      
      if (checked) {
        newAnswers.set(currentQuestion.no, [...currentAnswers, option]);
      } else {
        const filtered = currentAnswers.filter(item => item !== option);
        if (filtered.length > 0) {
          newAnswers.set(currentQuestion.no, filtered);
        } else {
          newAnswers.delete(currentQuestion.no);
        }
      }
      
      return newAnswers;
    });
  }, [currentQuestion]);

  // 다음 질문으로 이동
  const handleNext = useCallback(() => {
    const currentAnswer = answers.get(currentQuestion.no);
    
    if (currentAnswer === undefined || currentAnswer === "" || 
        (Array.isArray(currentAnswer) && currentAnswer.length === 0)) {
      alert("답변을 입력해주세요.");
      return;
    }

    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [answers, currentQuestion, isLastQuestion]);

  // 이전 질문으로 이동
  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex]);

  // 기본 진단 제출
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      const answerArray: Answer[] = Array.from(answers.entries()).map(([questionNo, answer]) => {
        const question = questions.find(q => q.no === questionNo);
        return {
          questionNo,
          questionType: question?.type || "",
          questionText: question?.question || "",
          answer
        };
      });

      const response = await preliminaryApi.submit(answerArray);
      
      if (response.success) {
        // AI 분석 및 심층 질문 생성을 위해 분석 로딩 페이지로 이동
        navigate("/analysis-loading", { replace: true });
      } else {
        setError(response.message || "제출에 실패했습니다.");
      }
    } catch (err: any) {
      console.error("기본 진단 제출 오류:", err);
      setError(err.response?.data?.message || "제출 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold">질문을 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (error && questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-red-600">{error}</div>
          <button
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg"
            onClick={() => navigate("/home")}
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  const currentValue = answers.get(currentQuestion.no);

  // Likert Scale - RequetChoice 스타일 렌더링
  const renderLikertScale = () => {
    // currentValue는 useEffect에서 기본값 3으로 설정됨
    const value = parseInt((currentValue as string) || "3");
    
    return (
      <div className="w-full flex flex-col gap-8">
        {/* 질문 박스 */}
        <div className="w-full">
          <div className="w-full h-[56px] flex items-center px-6 rounded-[8px] border border-[#8e9c78]">
            <p className="mx-auto text-base [font-family:'Inter-Regular',Helvetica] text-center">
              {currentQuestion.question}
            </p>
          </div>
        </div>

        {/* 그라디언트 슬라이더 */}
        <div className="w-full flex items-center justify-center">
          <div className="w-full max-w-[700px]">
            <style>{`
              .likert-range {
                -webkit-appearance: none;
                appearance: none;
                width: 100%;
                height: 10px;
                border-radius: 999px;
                background: linear-gradient(90deg, rgba(217,230,197,1) 0%, rgba(142,156,120,1) 100%);
                box-shadow: 0 4px 4px rgba(0,0,0,0.25);
              }
              .likert-range:focus { outline: none; }
              .likert-range::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 18px;
                height: 18px;
                border-radius: 50%;
                background: #ffffff;
                border: 3px solid #8e9c78;
                box-shadow: 0 2px 4px rgba(0,0,0,0.25);
                margin-top: -4px;
                cursor: pointer;
              }
              .likert-range::-moz-range-thumb {
                width: 18px;
                height: 18px;
                border-radius: 50%;
                background: #ffffff;
                border: 3px solid #8e9c78;
                box-shadow: 0 2px 4px rgba(0,0,0,0.25);
                cursor: pointer;
              }
            `}</style>

            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={value}
              onChange={(e) => handleAnswerChange(e.target.value)}
              className="likert-range"
              aria-label="5점 척도"
            />
            
            {/* 숫자 표시 */}
            <div className="flex justify-between mt-2 px-1">
              {[1, 2, 3, 4, 5].map((num) => (
                <span
                  key={num}
                  className={
                    "text-sm font-medium transition-colors " +
                    (value === num ? "text-[#8e9c78] font-bold" : "text-gray-500")
                  }
                >
                  {num}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Single/Multiple Choice - MultipleChoicePage 스타일 사용
  const renderChoiceQuestion = () => {
    const type = currentQuestion.type;
    const isMultiple = type === "Multiple Choice";
    
    if (!currentQuestion.options) return null;

    const selectedOptions = isMultiple ? ((currentValue as string[]) || []) : [];
    const singleValue = !isMultiple ? (currentValue as string) : "";

    return (
      <div className="flex flex-col items-start justify-center gap-6 w-full">
        {/* Question Header */}
        <div className="relative w-full max-w-[873px]">
          <label className="min-h-[64px] gap-0.5 border-[1.5px] border-solid border-[#8e9c78] bg-white flex w-full items-center px-5 py-4 relative rounded-[12px] shadow-[0_1px_0_rgba(0,0,0,0.03)]">
            <span className="absolute -top-3 left-4 px-2 bg-white text-[15px] font-medium text-[#7a8764]">
              Q{currentQuestionIndex + 1}
            </span>
            <div className="flex items-center gap-2">
              <p className="font-sans text-[#232323] text-lg leading-[27px]">
                {currentQuestion.question}
              </p>
            </div>
          </label>
        </div>

        {/* Multiple Choice 안내 */}
        {isMultiple && (
          <p className="text-sm text-gray-600">※ 복수 선택 가능</p>
        )}

        {/* Options */}
        <div className="flex flex-col gap-3 w-full max-w-[873px]">
          {currentQuestion.options.map((option, index) => {
            const isChecked = isMultiple 
              ? selectedOptions.includes(option)
              : singleValue === option;
            
            return (
              <button
                key={index}
                type="button"
                aria-pressed={isChecked}
                onClick={() => {
                  if (isMultiple) {
                    handleMultipleAnswerChange(option, !isChecked);
                  } else {
                    handleAnswerChange(option);
                  }
                }}
                className={
                  "h-[41px] justify-between border border-solid flex w-full items-center px-5 py-4 relative rounded-[12px] transition-colors " +
                  (isChecked
                    ? "border-[#8e9c78] bg-[#eef2e6] text-[#232323]"
                    : "border-[#d9d9d9] hover:bg-[#f0f3ea] hover:border-[#c9d1bf] text-[#9a9a9a]")
                }
              >
                <span className="font-sans text-[17px] leading-[26px] text-left">
                  {index + 1}. {option}
                </span>
              </button>
            );
          })}
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleNext}
          disabled={isSubmitting}
          className="all-[unset] box-border flex items-center justify-center gap-2 px-2 py-4 relative self-stretch w-full max-w-[873px] bg-[#8e9c78] rounded-[12px] hover:brightness-95 active:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="font-sans font-semibold text-white text-lg tracking-[-0.18px] leading-[21.6px]">
            {isLastQuestion ? (isSubmitting ? "제출 중..." : "완료") : "다음으로"}
          </div>
        </button>
      </div>
    );
  };

  // Short Essay/Answer - Board 스타일 렌더링
  const renderTextQuestion = () => {
    const isEssay = currentQuestion.type === "Short Essay";
    const maxLength = isEssay ? 1000 : 200;
    const textValue = (currentValue as string) || "";

    return (
      <div className="w-full flex flex-col gap-6">
        {/* 질문 박스 */}
        <div className="w-full">
          <div className="w-full h-[56px] flex items-center px-5 rounded-[10px] border border-[#8e9c78]">
            <p className="mx-auto text-base [font-family:'Inter-Regular',Helvetica] text-center">
              {currentQuestion.question}
            </p>
          </div>
        </div>

        {/* 입력 필드 */}
        {isEssay ? (
          <textarea
            ref={textareaRef}
            value={textValue}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder={currentQuestion.placeholder || "Answer"}
            className="w-full h-40 p-4 rounded-[10px] border border-gray-200 resize-none placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e6f0d9]"
            maxLength={maxLength}
            aria-label="주관식 응답"
          />
        ) : (
          <input
            type="text"
            value={textValue}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder={currentQuestion.placeholder || "Answer"}
            className="w-full p-4 rounded-[10px] border border-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e6f0d9]"
            maxLength={maxLength}
            aria-label="단답형 응답"
          />
        )}

        <div className="text-right text-sm text-gray-500">
          {textValue.length} / {maxLength}
        </div>
      </div>
    );
  };

  const type = currentQuestion?.type;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* 헤더 */}
      <div className="absolute top-5 left-[18px] typo-h1">DreamTrack</div>

      {/* 진행률 바 */}
      <div className="absolute top-20 left-0 right-0 px-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-[#8e9c78] h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-sm text-gray-600 mt-2 text-right">
          {currentQuestionIndex + 1} / {questions.length}
        </div>
      </div>

      {/* 질문 영역 */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-[873px]">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* 타입별 렌더링 */}
          {type === "Likert Scale" && (
            <>
              {renderLikertScale()}
              {/* 버튼 영역 */}
              <div className="flex items-center justify-between mt-8 w-full max-w-[700px] mx-auto">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0 || isSubmitting}
                  className="px-6 py-3 text-gray-600 hover:text-gray-900 font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  ← 이전
                </button>

                <button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="w-full max-w-[300px] bg-[#8e9c78] text-white py-3 rounded-[10px] font-semibold hover:opacity-90 transition"
                >
                  {isLastQuestion ? (isSubmitting ? "제출 중..." : "제출") : "다음으로"}
                </button>
              </div>
            </>
          )}

          {(type === "Single Choice" || type === "Multiple Choice") && renderChoiceQuestion()}

          {(type === "Short Essay" || type === "Short Answer") && (
            <>
              {renderTextQuestion()}
              {/* 버튼 영역 */}
              <div className="flex items-center justify-between mt-8 w-full max-w-[700px] mx-auto">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0 || isSubmitting}
                  className="px-6 py-3 text-gray-600 hover:text-gray-900 font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  ← 이전
                </button>

                <button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="w-full max-w-[300px] bg-[#8e9c78] text-white py-3 rounded-[10px] font-semibold hover:opacity-90 transition"
                >
                  {isLastQuestion ? (isSubmitting ? "제출 중..." : "제출") : "다음으로"}
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
