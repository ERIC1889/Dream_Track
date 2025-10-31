type QuoteBadgeProps = {
  size?: number;
  className?: string;
};

export default function QuoteBadge({ size = 203, className }: QuoteBadgeProps) {
  const s = String(size);
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 203 203"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="101.5" cy="101.5" r="101.5" fill="#8e9c78" />
      {/* left quote */}
      <path
        d="M76 88h31v57H69c-6.627 0-12-5.373-12-12v-14c0-17.673 14.327-32 32-32h-13Z"
        fill="white"
      />
      {/* right quote */}
      <path
        d="M126 88h31v57h-38c-6.627 0-12-5.373-12-12v-14c0-17.673 14.327-32 32-32h-13Z"
        fill="white"
      />
    </svg>
  );
}


