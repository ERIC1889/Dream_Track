type QuestionHeaderProps = {
  caption?: string;
  question: string;
  questionNumber?: number;
};

export function QuestionHeader({
  caption,
  question,
  questionNumber,
}: QuestionHeaderProps) {
  return (
    <div className="relative w-full max-w-[873px]">
      <label className="min-h-[64px] gap-0.5 border-[1.5px] border-solid border-[#8e9c78] bg-white flex w-full items-center px-5 py-4 relative rounded-[12px] shadow-[0_1px_0_rgba(0,0,0,0.03)]">
        <span className="absolute -top-3 left-4 px-2 bg-white text-[15px] font-medium text-[#7a8764]">
          {typeof questionNumber === "number"
            ? `Q${questionNumber}`
            : caption ?? "Question"}
        </span>
        <div className="flex items-center gap-2">
          <p className="font-sans text-[#232323] text-lg leading-[27px]">
            {question}
          </p>
        </div>
      </label>
    </div>
  );
}

export default QuestionHeader;
