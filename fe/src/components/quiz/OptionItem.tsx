type OptionItemProps = {
  index: number;
  text: string;
  checked: boolean;
  onClick: () => void;
};

export function OptionItem({ index, text, checked, onClick }: OptionItemProps) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={onClick}
      className={
        "h-[41px] justify-between border border-solid flex w-full items-center px-5 py-4 relative rounded-[12px] transition-colors " +
        (checked
          ? "border-[#8e9c78] bg-[#eef2e6] text-[#232323]"
          : "border-[#d9d9d9] hover:bg-[#f0f3ea] hover:border-[#c9d1bf] text-[#9a9a9a]")
      }
    >
      <span className="font-sans text-[17px] leading-[26px] text-left">
        {index + 1}. {text}
      </span>
    </button>
  );
}

export default OptionItem;
