import { createBrowserRouter } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";

export const routes: RouteObject[] = [
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  {
    element: <Layout />,
    children: [
      { path: "/", element: <div>메인</div> },
      { path: "/diagnostic", element: <div>진단 시작</div> },
      {
        path: "/diagnostic/session/:sessionId",
        element: <div>진단 진행(세션)</div>,
      },
      { path: "/results", element: <div>추천(결과)</div> },
      { path: "/report/:id", element: <div>리포트 상세</div> },
    ],
  },
];

export const router = createBrowserRouter(routes);
