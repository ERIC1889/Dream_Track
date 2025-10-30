import { useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MultipleChoice from "../../components/quiz/MultipleChoice";

export default function MultipleChoicePage() {
  const [selected, setSelected] = useState<string | undefined>(undefined);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isRetake = searchParams.get("retake") === "1";

  const handleChange = useCallback((id: string) => {
    setSelected(id);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!selected) return alert("보기를 선택해주세요.");
    navigate(isRetake ? "/requet-choice?retake=1" : "/requet-choice");
  }, [selected, navigate, isRetake]);

  return (
    <div className="w-full flex items-center justify-center py-10">
      <div className="absolute top-5 left-[18px] typo-h1">DreamTrack</div>
      <div className="w-[873px] px-4 flex flex-col justify-center h-screen">
        <MultipleChoice
          questionNumber={1}
          caption="Question"
          question="다음 중 가장 선호하는 학습 스타일을 선택해주세요."
          options={[
            { id: "A", text: "영상으로 개념을 빠르게 훑기" },
            { id: "B", text: "문서/텍스트로 천천히 깊게 이해하기" },
            { id: "C", text: "문제 풀이 중심으로 반복 학습" },
            { id: "D", text: "프로젝트/실습으로 직접 만들어보기" },
          ]}
          value={selected}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitLabel="다음으로"
        />
      </div>
    </div>
  );
}
