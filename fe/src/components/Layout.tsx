import { Outlet } from "react-router-dom";
import Header from "./Header";

export default function Layout() {
  return (
    <div className="min-h-dvh grid grid-rows-[auto_1fr]">
      <Header />
      <main className="mx-auto max-w-6xl w-full px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
