import { useCallback, useId } from "react";

type QuizOption = {
  id: string;
  text: string;
};

type MultipleChoiceProps = {
  className?: string;
  question: string;
  options: QuizOption[];
  value?: string;
  onChange?: (id: string) => void;
  onSubmit?: () => void;
  submitLabel?: string;
  caption?: string;
};

export function MultipleChoice({
  className,
  question,
  options,
  value,
  onChange,
  onSubmit,
  submitLabel = "다음으로",
  caption,
}: MultipleChoiceProps) {
  const name = useId();

  const handleChange = useCallback(
    (id: string) => () => {
      onChange?.(id);
    },
    [onChange]
  );

  return (
    <div className={(className ? className + " " : "") + "inline-flex flex-col items-start justify-center gap-5"}>
      <div className="relative w-full max-w-[873px]">
        <label className="h-[71px] gap-0.5 border-[1.5px] border-solid border-[#8e9c78] flex w-full items-center p-4 relative rounded-[10px]">
          <span className="absolute -top-3 left-3 px-2 bg-white text-[15px] font-medium text-[#7a8764]">
            {caption ?? "Question"}
          </span>
          <p className="font-sans text-black text-lg leading-[27px]">{question}</p>
        </label>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-[873px]">
        {options.map((opt, index) => {
          const checked = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              aria-pressed={checked}
              onClick={handleChange(opt.id)}
              className={
                "h-[56px] justify-between border border-solid flex w-full items-center p-4 relative rounded-[10px] transition-colors " +
                (checked
                  ? "border-[#8e9c78] bg-[#eef2e6] text-[#232323]"
                  : "border-[#d9d9d9] hover:border-[#bfc7b2] text-[#6f6f6f]")
              }
            >
              <span className="font-sans text-lg leading-[27px] text-left">
                {index + 1}. {opt.text}
              </span>
              <span
                className={
                  "ml-4 inline-flex h-5 w-5 items-center justify-center rounded-full border " +
                  (checked ? "bg-[#8e9c78] border-[#8e9c78]" : "border-[#c9c9c9]")
                }
                aria-hidden
              >
                {checked ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6.5 5 8.5 9 4.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onSubmit}
        className="all-[unset] box-border flex items-center justify-center gap-2 px-2 py-4 relative self-stretch w-full max-w-[873px] bg-[#8e9c78] rounded-[10px]"
      >
        <div className="font-sans font-semibold text-white text-lg tracking-[-0.18px] leading-[21.6px]">
          {submitLabel}
        </div>
      </button>
    </div>
  );
}

export default MultipleChoice;


