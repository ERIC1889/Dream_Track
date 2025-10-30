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
  { path: "/result", element: <Result /> },
];

export const router = createBrowserRouter(routes);
