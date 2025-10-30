import { memo } from "react";
import Lottie from "lottie-react";
import animationData from "../../assets/Exams-Preparation.json";

type Props = {
  breakpoint: string;
  className?: string;
  hasIpad?: boolean;
};

export const HeroImage = memo(function HeroImage({ className }: Props) {
  return (
    <div
      className={
        (className ? className + " " : "") +
        "bg-accent-3 animate-slide-in-right will-change-transform flex items-center justify-center"
      }
    >
      <Lottie
        animationData={animationData as unknown as object}
        loop
        autoplay
        style={{ width: "70%", height: "70%" }}
      />
    </div>
  );
});
