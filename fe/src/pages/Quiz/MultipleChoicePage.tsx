import { useState, useCallback } from "react";
import MultipleChoice from "../../components/quiz/MultipleChoice";

export default function MultipleChoicePage() {
  const [selected, setSelected] = useState<string | undefined>(undefined);

  const handleChange = useCallback((id: string) => {
    setSelected(id);
  }, []);

  const handleSubmit = useCallback(() => {
    // TODO: 제출 동작(라우팅/다음 문제 로딩 등) 연결
    // 현재는 데모 알림만 표시
    if (selected) {
      alert(`선택한 보기: ${selected}`);
    } else {
      alert("보기를 선택해주세요.");
    }
  }, [selected]);

  return (
    <div className="w-full flex items-center justify-center py-10">
      <div className="w-full max-w-[920px] px-4">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-[#232323]">진단 테스트</h1>
          <p className="text-sm text-[#6f6f6f] mt-2">
            아래 질문에 가장 가까운 보기를 선택해주세요.
          </p>
        </header>

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
