import { useCallback } from "react";
import QuestionHeader from "./QuestionHeader";
import OptionItem from "./OptionItem";
import SubmitBar from "./SubmitBar";

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
  questionNumber?: number;
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
  questionNumber,
}: MultipleChoiceProps) {
  const handleChange = useCallback(
    (id: string) => () => {
      onChange?.(id);
    },
    [onChange]
  );

  return (
    <div
      className={
        (className ? className + " " : "") +
        "flex flex-col items-start justify-center gap-6"
      }
    >
      <QuestionHeader
        caption={caption}
        question={question}
        questionNumber={questionNumber}
      />

      <div className="flex flex-col gap-3 w-full max-w-[873px]">
        {options.map((opt, index) => {
          const checked = value === opt.id;
          return (
            <OptionItem
              key={opt.id}
              index={index}
              text={opt.text}
              checked={checked}
              onClick={handleChange(opt.id)}
            />
          );
        })}
      </div>

      <SubmitBar label={submitLabel} onClick={onSubmit} />
    </div>
  );
}

export default MultipleChoice;
