import { createBrowserRouter, Navigate } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import RequetChoice from "./test/RequetChoice";
import Board from "./test/Board";
import MultipleChoicePage from "./pages/Quiz/MultipleChoicePage";
import Home from "./pages/Home/Home";
import Result from "./pages/Result/Result";
import PreliminaryPage from "./pages/Preliminary/PreliminaryPage";
import AnalysisLoadingPage from "./pages/Analysis/AnalysisLoadingPage";
import DeepQuestionBoard from "./pages/DeepQuestion/DeepQuestionBoard";
import RoadmapLoadingPage from "./pages/RoadmapLoading/RoadmapLoadingPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const routes: RouteObject[] = [
  // 기본 경로 - 로그인 페이지로 리다이렉트
  { path: "/", element: <Navigate to="/login" replace /> },
  
  // 공개 라우트 (인증 불필요)
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  
  // 기본 진단 라우트 (인증 필요, 기본 진단 체크 제외)
  { 
    path: "/preliminary", 
    element: (
      <ProtectedRoute skipPreliminaryCheck>
        <PreliminaryPage />
      </ProtectedRoute>
    ) 
  },
  
  // AI 분석 및 심층 질문 라우트 (인증 필요)
  { 
    path: "/analysis-loading", 
    element: (
      <ProtectedRoute skipPreliminaryCheck>
        <AnalysisLoadingPage />
      </ProtectedRoute>
    ) 
  },
  { 
    path: "/deep-question-board", 
    element: (
      <ProtectedRoute skipPreliminaryCheck>
        <DeepQuestionBoard />
      </ProtectedRoute>
    ) 
  },
  { 
    path: "/roadmap-loading", 
    element: (
      <ProtectedRoute skipPreliminaryCheck>
        <RoadmapLoadingPage />
      </ProtectedRoute>
    ) 
  },
  { 
    path: "/final-result", 
    element: (
      <ProtectedRoute skipPreliminaryCheck>
        <Result />
      </ProtectedRoute>
    ) 
  },
  
  // 보호된 라우트 (인증 필요)
  { 
    path: "/home", 
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ) 
  },
  { 
    path: "/quiz", 
    element: (
      <ProtectedRoute skipPreliminaryCheck>
        <MultipleChoicePage />
      </ProtectedRoute>
    ) 
  },
  { 
    path: "/result", 
    element: (
      <ProtectedRoute>
        <Result />
      </ProtectedRoute>
    ) 
  },
  { 
    path: "/requet-choice", 
    element: (
      <ProtectedRoute>
        <RequetChoice />
      </ProtectedRoute>
    ) 
  },
  { 
    path: "/board", 
    element: (
      <ProtectedRoute>
        <Board />
      </ProtectedRoute>
    ) 
  },
];

export const router = createBrowserRouter(routes);
