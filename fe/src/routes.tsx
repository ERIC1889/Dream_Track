import { createBrowserRouter } from "react-router-dom";
import type { RouteObject } from "react-router-dom";

export const routes: RouteObject[] = [
  { path: "/", element: <div>메인</div> },
  { path: "/diagnostic", element: <div>진단 시작</div> },
  {
    path: "/diagnostic/session/:sessionId",
    element: <div>진단 진행(세션)</div>,
  },
  { path: "/results", element: <div>추천(결과)</div> },
  { path: "/report/:id", element: <div>리포트 상세</div> },
  { path: "/login", element: <div>로그인</div> },
  { path: "/signup", element: <div>회원가입</div> },
];

export const router = createBrowserRouter(routes);
