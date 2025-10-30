import React, { useEffect, useRef, useState } from "react";

export default function Board() {
  const [answer, setAnswer] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("주관식 제출:", answer);
    alert("제출되었습니다.");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="w-full border-b">
        <div className="max-w-[900px] mx-auto px-6 py-6">
          <h1 className="text-4xl font-serif">DreamTrack</h1>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-[700px]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* 질문 박스 - 얇은 테두리, 가운데 정렬 */}
            <div className="w-full">
              <div className="w-full h-[56px] flex items-center px-5 rounded-[10px] border border-[#8e9c78]">
                <p className="mx-auto text-base [font-family:'Inter-Regular',Helvetica] text-center">
                  ‘성공적인 진로’는 나에게 어떤 의미인가요?
                </p>
              </div>
            </div>

            {/* 주관식 입력창 */}
            <textarea
              ref={textareaRef}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Answer"
              className="w-full h-40 p-4 rounded-[10px] border border-gray-200 resize-none placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e6f0d9]"
              aria-label="주관식 응답"
            />

            <button
              type="submit"
              className="w-full bg-[#8e9c78] text-white py-3 rounded-[10px] font-semibold hover:opacity-90 transition"
            >
              제출
            </button>
          </form>
        </div>
      </main>

    
    </div>
  );
}