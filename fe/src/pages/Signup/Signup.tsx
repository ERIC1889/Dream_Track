import { useForm } from "react-hook-form";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { HeroImage } from "../Login/HeroImage";

type SignupFormValues = {
  name: string;
  username: string;
  password: string;
  dob: string;
  email: string;
  address: string;
  school: string;
  interest: string;
};

declare global {
  interface Window {
    daum?: any;
  }
}

export default function Signup() {
  const navigate = useNavigate();
  const { register, handleSubmit, setValue } = useForm<SignupFormValues>({
    defaultValues: {
      name: "",
      username: "",
      password: "",
      dob: "",
      email: "",
      address: "",
      school: "",
      interest: "",
    },
  });

  // 다음 주소 스크립트 로드
  const postcodeScriptLoadedRef = useRef(false);
  useEffect(() => {
    if (postcodeScriptLoadedRef.current) return;
    if (window.daum && window.daum.postcode) {
      postcodeScriptLoadedRef.current = true;
      return;
    }
    const script = document.createElement("script");
    script.src =
      "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.async = true;
    script.onload = () => {
      postcodeScriptLoadedRef.current = true;
    };
    document.body.appendChild(script);
  }, []);

  const openAddressSearch = () => {
    const daum = window.daum;
    if (!daum || !daum.Postcode) {
      alert("주소 검색 로딩 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    new daum.Postcode({
      oncomplete: (data: any) => {
        const address = data.roadAddress || data.jibunAddress || "";
        setValue("address", address, { shouldDirty: true, shouldTouch: true });
      },
    }).open();
  };

  // NEIS 학교 검색: 간단 프롬프트로 검색하여 첫 결과 선택
  const openSchoolSearch = async () => {
    const keyword = window.prompt("학교명을 입력하세요 (예: 서울고등학교)");
    if (!keyword) return;
    const key = (import.meta as any).env?.VITE_NEIS_API_KEY;
    if (!key) {
      alert(
        "NEIS API 키가 필요합니다. 환경변수 VITE_NEIS_API_KEY를 설정하세요."
      );
      return;
    }
    try {
      const url = `https://open.neis.go.kr/hub/schoolInfo?KEY=${key}&Type=json&SCHUL_NM=${encodeURIComponent(
        keyword
      )}&pIndex=1&pSize=5`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      const list = data?.schoolInfo?.[1]?.row ?? [];
      if (!Array.isArray(list) || list.length === 0) {
        alert("검색 결과가 없습니다.");
        return;
      }
      const first = list[0];
      const schoolName = first?.SCHUL_NM as string | undefined;
      if (schoolName) {
        setValue("school", schoolName, {
          shouldDirty: true,
          shouldTouch: true,
        });
      }
    } catch (e) {
      console.error(e);
      alert("학교 검색 중 오류가 발생했습니다.");
    }
  };

  const onSubmit = (values: SignupFormValues) => {
    console.log("signup submit", values);
    navigate("/login");
  };

  return (
    <div className="min-h-dvh w-screen grid grid-cols-1 md:grid-cols-2 bg-white">
      <div className="absolute top-5 left-[18px] typo-h1">DreamTrack</div>
      <div className="flex flex-col items-start justify-center gap-8 px-[106px] pt-20">
        <div className="flex flex-col items-start justify-center gap-3 relative self-stretch w-full flex-[0_0_auto]">
          <div className="relative w-fit mt-[-1.00px] [font-family:'Inter-Bold',Helvetica] font-bold text-[#232323] text-[40px] text-center tracking-[-1.60px] leading-[44.0px] whitespace-nowrap">
            회원가입
          </div>
          <p className="relative self-stretch [font-family:'Inter-Regular',Helvetica] font-normal text-[#959595] text-lg tracking-[0] leading-[27px]">
            Sign up to enjoy DreamTrack
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="inline-flex flex-col items-start justify-center gap-5 relative flex-[0_0_auto] max-w-sm w-full"
        >
          <label className="gap-0.5 border-[1.5px] border-solid border-[#d9d9d9] flex w-full items-center p-4 relative rounded-[10px] transition-colors focus-within:border-accent-1 focus-within:ring-2 focus-within:ring-accent-1/30">
            <span className="absolute -top-3 left-3 px-2 bg-white text-[15px] font-medium text-[#7a8764]">
              Your Name
            </span>
            <input
              type="text"
              placeholder="Your Name"
              className="w-full bg-transparent outline-none placeholder:text-[#9a9a9a] text-[#232323] text-lg"
              {...register("name")}
            />
          </label>

          <label className="gap-0.5 border-[1.5px] border-solid border-[#d9d9d9] flex w-full items-center p-4 relative rounded-[10px] transition-colors focus-within:border-accent-1 focus-within:ring-2 focus-within:ring-accent-1/30">
            <span className="absolute -top-3 left-3 px-2 bg-white text-[15px] font-medium text-[#7a8764]">
              ID
            </span>
            <input
              type="text"
              placeholder="ID"
              className="w-full bg-transparent outline-none placeholder:text-[#9a9a9a] text-[#232323] text-lg"
              {...register("username")}
            />
          </label>

          <label className="gap-0.5 border-[1.5px] border-solid border-[#d9d9d9] flex w-full items-center p-4 relative rounded-[10px] transition-colors focus-within:border-accent-1 focus-within:ring-2 focus-within:ring-accent-1/30">
            <span className="absolute -top-3 left-3 px-2 bg-white text-[15px] font-medium text-[#7a8764]">
              Password
            </span>
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-transparent outline-none placeholder:text-[#9a9a9a] text-[#232323] text-lg"
              {...register("password")}
            />
          </label>

          <label className="gap-3 border-[1.5px] border-solid border-[#d9d9d9] flex w-full items-center p-4 relative rounded-[10px] transition-colors focus-within:border-accent-1 focus-within:ring-2 focus-within:ring-accent-1/30">
            <span className="absolute -top-3 left-3 px-2 bg-white text-[15px] font-medium text-[#7a8764]">
              Date of Birth
            </span>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[#232323]"
            >
              <rect
                x="3"
                y="4"
                width="18"
                height="17"
                rx="2"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M16 2v4M8 2v4M3 10h18"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            <input
              type="date"
              placeholder="Date of Birth"
              className="w-full bg-transparent outline-none text-[#232323] text-lg"
              {...register("dob")}
            />
          </label>

          <label className="gap-0.5 border-[1.5px] border-solid border-[#d9d9d9] flex w-full items-center p-4 relative rounded-[10px] transition-colors focus-within:border-accent-1 focus-within:ring-2 focus-within:ring-accent-1/30">
            <span className="absolute -top-3 left-3 px-2 bg-white text-[15px] font-medium text-[#7a8764]">
              Email
            </span>
            <input
              type="email"
              placeholder="Email"
              className="w-full bg-transparent outline-none placeholder:text-[#9a9a9a] text-[#232323] text-lg"
              {...register("email")}
            />
          </label>

          <label className="gap-2 border-[1.5px] border-solid border-[#d9d9d9] flex w-full items-center p-4 relative rounded-[10px] transition-colors focus-within:border-accent-1 focus-within:ring-2 focus-within:ring-accent-1/30">
            <span className="absolute -top-3 left-3 px-2 bg-white text-[15px] font-medium text-[#7a8764]">
              Address
            </span>
            <input
              type="text"
              placeholder="Address"
              className="w-full bg-transparent outline-none placeholder:text-[#9a9a9a] text-[#232323] text-lg cursor-pointer"
              readOnly
              onClick={openAddressSearch}
              onFocus={openAddressSearch}
              {...register("address")}
            />
            <button
              type="button"
              onClick={openAddressSearch}
              className="cursor-pointer shrink-0 px-3 py-1.5 rounded-md bg-[#eef2e6] text-[#55614a] text-sm hover:bg-[#e2e9d7]"
            >
              주소 찾기
            </button>
          </label>

          <label className="gap-2 border-[1.5px] border-solid border-[#d9d9d9] flex w-full items-center p-4 relative rounded-[10px] transition-colors focus-within:border-accent-1 focus-within:ring-2 focus-within:ring-accent-1/30">
            <span className="absolute -top-3 left-3 px-2 bg-white text-[15px] font-medium text-[#7a8764]">
              School
            </span>
            <input
              type="text"
              placeholder="School"
              className="w-full bg-transparent outline-none placeholder:text-[#9a9a9a] text-[#232323] text-lg cursor-pointer"
              readOnly
              onClick={openSchoolSearch}
              onFocus={openSchoolSearch}
              {...register("school")}
            />
            <button
              type="button"
              onClick={openSchoolSearch}
              className=" cursor-pointer shrink-0 px-3 py-1.5 rounded-md bg-[#eef2e6] text-[#55614a] text-sm hover:bg-[#e2e9d7]"
            >
              학교 찾기
            </button>
          </label>

          <label className="gap-0.5 border-[1.5px] border-solid border-[#d9d9d9] flex w-full items-center p-4 relative rounded-[10px] transition-colors focus-within:border-accent-1 focus-within:ring-2 focus-within:ring-accent-1/30">
            <span className="absolute -top-3 left-3 px-2 bg-white text-[15px] font-medium text-[#7a8764]">
              Interest
            </span>
            <input
              type="text"
              placeholder="Interest"
              className="w-full bg-transparent outline-none placeholder:text-[#9a9a9a] text-[#232323] text-lg"
              {...register("interest")}
            />
          </label>

          <button
            type="submit"
            className="cursor-pointer all-[unset] box-border flex items-center justify-center gap-2 px-2 py-4 relative self-stretch w-full bg-[#8e9c78] rounded-[10px]"
          >
            <div className="relative w-fit mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-white text-lg tracking-[-0.18px] leading-[21.6px] whitespace-nowrap">
              Sign up
            </div>
          </button>
        </form>
      </div>

      <HeroImage
        breakpoint="desktop"
        className="w-full h-full rounded-l-[30px]"
        hasIpad={false}
      />
    </div>
  );
}
