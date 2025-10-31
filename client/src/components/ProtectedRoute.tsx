import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useEffect, useState } from "react";
import { preliminaryApi } from "@/lib/api/preliminary";

interface ProtectedRouteProps {
  children: React.ReactNode;
  skipPreliminaryCheck?: boolean;
}

export function ProtectedRoute({ children, skipPreliminaryCheck = false }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();
  const [isCheckingPreliminary, setIsCheckingPreliminary] = useState(!skipPreliminaryCheck);
  const [preliminaryCompleted, setPreliminaryCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    // 기본 진단 체크를 건너뛰는 경우
    if (skipPreliminaryCheck) {
      setIsCheckingPreliminary(false);
      setPreliminaryCompleted(true);
      return;
    }

    // 인증되지 않은 경우 체크하지 않음
    if (!isAuthenticated) {
      return;
    }

    // 기본 진단 완료 여부 확인
    const checkPreliminaryStatus = async () => {
      try {
        const response = await preliminaryApi.getStatus();
        if (response.success) {
          setPreliminaryCompleted(response.data.isCompleted);
        }
      } catch (error) {
        console.error("기본 진단 상태 확인 오류:", error);
        // 오류 발생 시 일단 통과시킴 (서버 오류로 인한 접근 차단 방지)
        setPreliminaryCompleted(true);
      } finally {
        setIsCheckingPreliminary(false);
      }
    };

    checkPreliminaryStatus();
  }, [isAuthenticated, skipPreliminaryCheck]);

  if (!isAuthenticated) {
    // 로그인하지 않은 경우, 로그인 페이지로 리다이렉트
    // 로그인 후 돌아올 수 있도록 현재 위치를 state로 전달
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 기본 진단 체크 중
  if (isCheckingPreliminary) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold">로딩 중...</div>
        </div>
      </div>
    );
  }

  // 기본 진단이 완료되지 않은 경우, 기본 진단 페이지로 리다이렉트
  if (!skipPreliminaryCheck && preliminaryCompleted === false) {
    return <Navigate to="/preliminary" replace />;
  }

  return <>{children}</>;
}

