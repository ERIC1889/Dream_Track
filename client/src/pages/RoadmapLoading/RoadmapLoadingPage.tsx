import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateRoadmap } from '@/lib/api/analysis';

const RoadmapLoadingPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const createRoadmap = async () => {
      try {
        setProgress(10);
        
        // 로드맵 생성
        const response = await generateRoadmap();
        
        setProgress(50);
        
        if (!response.success) {
          throw new Error(response.message || '로드맵 생성에 실패했습니다.');
        }

        setProgress(100);
        
        // 1초 후 홈으로 이동 (캘린더가 있는 메인 페이지)
        setTimeout(() => {
          navigate('/home');
        }, 1000);

      } catch (err: any) {
        console.error('로드맵 생성 오류:', err);
        const errorMessage = err.message || '알 수 없는 오류가 발생했습니다.';
        
        // 심층 진단 미완료 시 자동 리다이렉트
        if (errorMessage.includes('완료된 심층 진단이 없습니다') || 
            errorMessage.includes('모든 심층 질문에 답변해야')) {
          setError('먼저 심층 질문에 답변해주세요. 3초 후 이동합니다...');
          setTimeout(() => {
            navigate('/deep-question-board?questionId=1');
          }, 3000);
        } else {
          setError(errorMessage);
        }
      }
    };

    createRoadmap();
  }, [navigate]);

  const handleRetry = () => {
    setError(null);
    setProgress(0);
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          {/* 헤더 */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full mb-6 shadow-lg">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
              맞춤형 로드맵 생성 중
            </h1>
            <p className="text-gray-600 text-lg">
              당신의 진로 목표를 위한 로드맵을 생성하고 있습니다
            </p>
          </div>

          {/* 진행 상태 */}
          {!error && (
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 border-l-4 border-blue-500">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <div className="flex-1">
                  <p className="font-medium text-blue-700">
                    AI가 당신만의 로드맵을 생성하고 있습니다...
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    분석 결과와 답변을 바탕으로 최적의 학습 경로를 설계 중입니다
                  </p>
                </div>
              </div>

              {/* 진행 바 */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>진행 중</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-blue-600 transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-8 p-6 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="flex-1">
                  <h3 className="text-red-800 font-semibold mb-1">오류가 발생했습니다</h3>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
              
              {/* 에러 시 버튼 */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleRetry}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  다시 시도
                </button>
                <button
                  onClick={handleGoHome}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  홈으로 돌아가기
                </button>
              </div>
            </div>
          )}

          {/* 안내 메시지 */}
          {!error && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800 text-center">
                💡 생성된 로드맵은 메인 페이지의 캘린더에서 확인하실 수 있습니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoadmapLoadingPage;

