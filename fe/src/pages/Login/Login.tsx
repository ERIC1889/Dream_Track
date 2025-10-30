import { HeroImage } from "./HeroImage";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

type LoginFormValues = {
  email: string;
  password: string;
};

export default function Login() {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm<LoginFormValues>({
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values: LoginFormValues) => {
    // TODO: integrate API call
    console.log("login submit", values);
  };

  return (
    <div className="min-h-dvh w-screen grid grid-cols-1 md:grid-cols-2 bg-white">
      <div className="absolute top-5 left-[18px] typo-h1">DreamTrack</div>
      <div className="absolute bottom-[10.5px] left-[18px] typo-link">
        2025 SUMTECH NextLeap
      </div>
      <div className="flex flex-col items-start justify-center gap-8 px-[106px] py-12">
        <div className="flex flex-col items-start justify-center gap-3 relative self-stretch w-full flex-[0_0_auto]">
          <div className="relative w-fit mt-[-1.00px] [font-family:'Inter-Bold',Helvetica] font-bold text-[#232323] text-[40px] text-center tracking-[-1.60px] leading-[44.0px] whitespace-nowrap">
            로그인
          </div>
          <p className="relative self-stretch [font-family:'Inter-Regular',Helvetica] font-normal text-[#959595] text-lg tracking-[0] leading-[27px]">
            Please login to continue to your account.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="inline-flex flex-col items-start justify-center gap-5 relative flex-[0_0_auto] max-w-sm w-full"
        >
          <label className="gap-0.5 border-[1.5px] border-solid border-[#d9d9d9] flex w-full items-center p-4 relative flex-[0_0_auto] rounded-[10px] transition-colors focus-within:border-accent-1 focus-within:ring-2 focus-within:ring-accent-1/30">
            <input
              type="email"
              placeholder="Email"
              className="w-full bg-transparent outline-none placeholder:text-[#9a9a9a] text-[#232323] text-lg"
              {...register("email")}
            />
          </label>

          <label className="justify-center gap-2.5 border border-solid border-[#d9d9d9] flex w-full items-center p-4 relative flex-[0_0_auto] rounded-[10px] transition-colors focus-within:border-accent-1 focus-within:ring-2 focus-within:ring-accent-1/30">
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-transparent outline-none placeholder:text-[#9a9a9a] text-[#232323] text-lg"
              {...register("password")}
            />
          </label>

          <button
            type="submit"
            className="cursor-pointer all-[unset] box-border bg-[#8e9c78] flex items-center justify-center gap-2 px-2 py-4 relative self-stretch w-full flex-[0_0_auto] rounded-[10px] "
          >
            <div className="relative w-fit mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-white text-lg tracking-[-0.18px] leading-[21.6px] whitespace-nowrap">
              로그인
            </div>
          </button>

          <button
            type="button"
            className="cursor-pointer all-[unset] box-border bg-[#9a9a9a] flex items-center justify-center gap-2 px-2 py-4 relative self-stretch w-full flex-[0_0_auto] rounded-[10px]"
            onClick={() => navigate("/signup")}
          >
            <div className="relative w-fit mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-white text-lg tracking-[-0.18px] leading-[21.6px] whitespace-nowrap">
              회원가입하기
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
