import { useNavigate } from "react-router-dom";
import quoteBadgeUrl from "../../assets/quote.svg";

export default function Result() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-6">
        <h1 className="typo-h1">DreamTrack</h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start text-center px-4">
        <div className="mt-10" />
        <div className="flex flex-col items-center gap-2 typo-paragraph">
          <p className=" text-[40px] leading-[1.0] text-headline">
            <em className="not-italic font-bold">10</em>일 연속
          </p>
          <p className=" text-[40px] leading-[1.0] text-headline">
            <em className="not-italic font-bold">8/10</em>개 맞춤
          </p>
          <p className=" text-[40px] leading-[1.0] text-headline font-bold">
            조금씩 나아지고 있어요
          </p>
          <p className=" text-[40px] leading-[1.0] text-headline font-bold">
            매일의 쌓임이 결국 큰 변화를 만들어요:)
          </p>
        </div>

        <div className="mt-12 flex items-center justify-center">
          <img
            src={quoteBadgeUrl}
            alt="result badge"
            className="w-[203px] h-[203px]"
          />
        </div>

        <button
          className="mt-10 w-[395px] h-[50px] rounded-[10px] bg-[#8e9c78] text-white font-sans font-semibold text-[15px] flex items-center justify-center"
          onClick={() => navigate("/")}
        >
          다시 돌아가기
        </button>
      </main>
    </div>
  );
}
