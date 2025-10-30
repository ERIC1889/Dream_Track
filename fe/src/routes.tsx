import { createBrowserRouter } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import RequetChoice from "./test/RequetChoice";
import Board from "./test/Board";
import MultipleChoicePage from "./pages/Quiz/MultipleChoicePage";
import Home from "./pages/Home/Home";
import Result from "./pages/Result/Result";

export const routes: RouteObject[] = [
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  { path: "/requet-choice", element: <RequetChoice /> },
  { path: "/board", element: <Board /> },
  { path: "/quiz", element: <MultipleChoicePage /> },
  { path: "/", element: <Home /> },
  { path: "/diagnostic", element: <div>진단 시작</div> },
  {
    path: "/diagnostic/session/:sessionId",
    element: <div>진단 진행(세션)</div>,
  },
  { path: "/results", element: <div>추천(결과)</div> },
  { path: "/result", element: <Result /> },
  { path: "/results", element: <Result /> },
  { path: "/report/:id", element: <div>리포트 상세</div> },
];

export const router = createBrowserRouter(routes);
