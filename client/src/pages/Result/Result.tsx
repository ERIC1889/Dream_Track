import { useNavigate, useLocation } from "react-router-dom";
import quoteBadgeUrl from "../../assets/quote.svg";
import { useEffect, useState } from "react";

export default function Result() {
  const navigate = useNavigate();
  const location = useLocation();
  const [resultData, setResultData] = useState<{
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    message: string;
    encouragement: string;
  } | null>(null);

  useEffect(() => {
    // location.state에서 결과 데이터 가져오기
    if (location.state) {
      setResultData(location.state as any);
    }
  }, [location]);

  // 결과 데이터가 없으면 홈으로 리다이렉트
  useEffect(() => {
    if (!location.state) {
      const timer = setTimeout(() => {
        navigate("/home");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [location, navigate]);

  if (!resultData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#8e9c78] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600">결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <header className="px-6 py-6">
        <h1 className="typo-h1">DreamTrack</h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start text-center px-4">
        <div className="mt-10" />
        
        {/* 점수 배지 */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-green-400 to-blue-500 rounded-full shadow-2xl">
            <span className="text-5xl font-bold text-white">{resultData.score}</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 typo-paragraph max-w-2xl">
          <p className="text-[48px] leading-[1.2] text-headline font-bold">
            {resultData.message}
          </p>
          
          <p className="text-[32px] leading-[1.3] text-gray-700">
            <em className="not-italic font-bold">{resultData.correctAnswers}</em> /{" "}
            <em className="not-italic font-bold">{resultData.totalQuestions}</em>개 맞춤
          </p>
          
          <p className="text-[28px] leading-[1.4] text-gray-600 font-medium mt-4">
            {resultData.encouragement}
          </p>

          {/* 점수별 추가 메시지 */}
          {resultData.score >= 90 && (
            <p className="text-[24px] leading-[1.4] text-green-600 mt-2">
              🎉 완벽한 실력이에요!
            </p>
          )}
          {resultData.score >= 70 && resultData.score < 90 && (
            <p className="text-[24px] leading-[1.4] text-blue-600 mt-2">
              ✨ 착실하게 성장하고 있어요!
            </p>
          )}
          {resultData.score >= 50 && resultData.score < 70 && (
            <p className="text-[24px] leading-[1.4] text-yellow-600 mt-2">
              💪 꾸준히 하면 더 좋아질 거예요!
            </p>
          )}
          {resultData.score < 50 && (
            <p className="text-[24px] leading-[1.4] text-orange-600 mt-2">
              🌱 시작이 반이에요, 계속 도전하세요!
            </p>
          )}
        </div>

        <div className="mt-12 flex items-center justify-center">
          <img
            src={quoteBadgeUrl}
            alt="result badge"
            className="w-[203px] h-[203px] opacity-80"
          />
        </div>

        <div className="flex gap-4 mt-10">
          <button
            className="w-[190px] h-[50px] rounded-[10px] border-2 border-[#8e9c78] text-[#8e9c78] font-sans font-semibold text-[15px] flex items-center justify-center hover:bg-[#8e9c78] hover:text-white transition-colors"
            onClick={() => navigate("/quiz")}
          >
            다시 풀기
          </button>
          <button
            className="w-[190px] h-[50px] rounded-[10px] bg-[#8e9c78] text-white font-sans font-semibold text-[15px] flex items-center justify-center hover:opacity-90 transition-opacity"
            onClick={() => navigate("/home")}
          >
            홈으로 돌아가기
          </button>
        </div>

        {/* 진행률 표시 */}
        <div className="mt-8 w-full max-w-md">
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-1000"
              style={{ width: `${resultData.score}%` }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
