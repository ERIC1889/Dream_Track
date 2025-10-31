import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzePreliminaryResult, generateDeepQuestions } from '@/lib/api/analysis';

interface LoadingStep {
  id: string;
  label: string;
  status: 'pending' | 'loading' | 'completed' | 'error';
}

const AnalysisLoadingPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [steps, setSteps] = useState<LoadingStep[]>([
    { id: 'analyze', label: '기본 진단 결과 분석 중...', status: 'pending' },
    { id: 'generate', label: '맞춤형 심층 질문 생성 중...', status: 'pending' },
    { id: 'complete', label: '완료', status: 'pending' }
  ]);

  const updateStepStatus = (stepIndex: number, status: LoadingStep['status']) => {
    setSteps(prev => prev.map((step, idx) => 
      idx === stepIndex ? { ...step, status } : step
    ));
  };

  useEffect(() => {
    let cancelled = false;
    let hasStarted = false; // 로컬 플래그로 중복 방지

    const performAnalysis = async () => {
      // 이미 실행 중이면 중단 (중복 실행 방지)
      if (hasStarted) {
        console.log('⚠️ 중복 실행 차단됨');
        return;
      }

      hasStarted = true;
      console.log('✅ 분석 시작');

      try {
        // Step 1: 기본 진단 분석
        setCurrentStep(0);
        updateStepStatus(0, 'loading');
        
        const analysisResult = await analyzePreliminaryResult();
        
        if (cancelled) return; // 컴포넌트 언마운트 시 중단
        
        if (!analysisResult.success) {
          throw new Error(analysisResult.message || '분석에 실패했습니다.');
        }

        updateStepStatus(0, 'completed');
        
        // 1초 대기 (사용자 경험을 위한 시각적 피드백)
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (cancelled) return; // 컴포넌트 언마운트 시 중단

        // Step 2: 심층 질문 생성
        setCurrentStep(1);
        updateStepStatus(1, 'loading');
        
        const questionsResult = await generateDeepQuestions();
        
        if (cancelled) return; // 컴포넌트 언마운트 시 중단
        
        if (!questionsResult.success) {
          throw new Error(questionsResult.message || '심층 질문 생성에 실패했습니다.');
        }

        updateStepStatus(1, 'completed');
        
        // 1초 대기
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (cancelled) return; // 컴포넌트 언마운트 시 중단

        // Step 3: 완료
        setCurrentStep(2);
        updateStepStatus(2, 'completed');
        
        // 1초 후 심층 질문 첫 번째 페이지로 이동
        setTimeout(() => {
          if (!cancelled) {
            navigate('/deep-question-board?questionId=1');
          }
        }, 1000);

      } catch (err: any) {
        if (cancelled) return; // 컴포넌트 언마운트 시 중단
        console.error('❌ 분석 오류:', err);
        setError(err.message || '알 수 없는 오류가 발생했습니다.');
        updateStepStatus(currentStep, 'error');
      }
      
      console.log('✅ 분석 완료');
    };

    performAnalysis();

    // Cleanup 함수: 컴포넌트 언마운트 시 중복 실행 방지
    return () => {
      cancelled = true;
    };
  }, []); // 빈 배열: 마운트 시 1회만 실행

  const handleRetry = () => {
    setError(null);
    setCurrentStep(0);
    setSteps([
      { id: 'analyze', label: '기본 진단 결과 분석 중...', status: 'pending' },
      { id: 'generate', label: '맞춤형 심층 질문 생성 중...', status: 'pending' },
      { id: 'complete', label: '완료', status: 'pending' }
    ]);
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          {/* 헤더 */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6 shadow-lg">
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
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
              AI 분석 진행 중
            </h1>
            <p className="text-gray-600 text-lg">
              당신의 진로를 더 깊이 탐색하기 위한 준비를 하고 있습니다
            </p>
          </div>

          {/* 진행 단계 */}
          <div className="space-y-6 mb-8">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 transition-all duration-300"
                style={{
                  backgroundColor:
                    step.status === 'completed'
                      ? '#f0fdf4'
                      : step.status === 'loading'
                      ? '#eff6ff'
                      : step.status === 'error'
                      ? '#fef2f2'
                      : '#f9fafb',
                  borderLeft: `4px solid ${
                    step.status === 'completed'
                      ? '#22c55e'
                      : step.status === 'loading'
                      ? '#3b82f6'
                      : step.status === 'error'
                      ? '#ef4444'
                      : '#e5e7eb'
                  }`
                }}
              >
                {/* 아이콘 */}
                <div className="flex-shrink-0">
                  {step.status === 'completed' && (
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                  {step.status === 'loading' && (
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  )}
                  {step.status === 'error' && (
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                  )}
                  {step.status === 'pending' && (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">{index + 1}</span>
                    </div>
                  )}
                </div>

                {/* 라벨 */}
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      step.status === 'completed'
                        ? 'text-green-700'
                        : step.status === 'loading'
                        ? 'text-blue-700'
                        : step.status === 'error'
                        ? 'text-red-700'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
            ))}
          </div>

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

          {/* 진행 바 */}
          {!error && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>진행 중</span>
                <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 ease-out rounded-full"
                  style={{
                    width: `${((currentStep + 1) / steps.length) * 100}%`
                  }}
                />
              </div>
            </div>
          )}

          {/* 안내 메시지 */}
          {!error && (
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 text-center">
                💡 AI가 당신의 답변을 분석하여 맞춤형 심층 질문을 생성하고 있습니다.
                <br />
                잠시만 기다려주세요.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisLoadingPage;

