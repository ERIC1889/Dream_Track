type SubmitBarProps = {
  label: string;
  onClick?: () => void;
};

export function SubmitBar({ label, onClick }: SubmitBarProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="all-[unset] box-border flex items-center justify-center gap-2 px-2 py-4 relative self-stretch w-full max-w-[873px] bg-[#8e9c78] rounded-[12px] hover:brightness-95 active:brightness-90"
    >
      <div className="font-sans font-semibold text-white text-lg tracking-[-0.18px] leading-[21.6px]">
        {label}
      </div>
    </button>
  );
}

export default SubmitBar;


