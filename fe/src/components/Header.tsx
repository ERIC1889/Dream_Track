import { Link, NavLink } from "react-router-dom";

export default function Header() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto max-w-6xl h-20 flex items-center justify-between">
        <nav className="flex justify-between px-6 w-[344px] h-[20px] ml-[433px] mr-[393px] relative mt-2">
          <NavLink to="/diagnostic" className="typo-link">
            진단하기
          </NavLink>
          <NavLink to="/results" className="typo-link">
            로드맵
          </NavLink>
          <NavLink to="/report" className="typo-link w-18">
            리포트
          </NavLink>
        </nav>
        <button className="typo-link w-[94px] h-[50px] bg-accent-1 rounded-full absolute right-4 top-6">
          <NavLink
            to="/login"
            className="w-full h-full flex items-center justify-center text-on-accent-1 gap-[2px]"
          >
            로그인하기{" "}
            <svg
              width="7"
              height="22"
              viewBox="0 0 7 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.01037 12.9877V9.04618L5.64939 9.08576L0.735155 14.0056L0 13.2705L4.91423 8.35626L4.96513 8.99528H1.0066V7.99434L6 8.00565V12.9877H5.01037Z"
                fill="white"
              />
            </svg>
          </NavLink>
        </button>
      </div>
    </header>
  );
}
