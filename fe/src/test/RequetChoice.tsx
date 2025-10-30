import React, { useCallback, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function RequetChoice() {
  const sliderRef = useRef<any>(null);
  const [current, setCurrent] = useState<number>(0);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isRetake = searchParams.get("retake") === "1";

  const questions = ["‘성공적인 진로’는 나에게 어떤 의미인가요?"];

  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(questions.length).fill(null)
  );

  const settings = {
    dots: true,
    infinite: false,
    speed: 300,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    adaptiveHeight: true,
    afterChange: (index: number) => setCurrent(index),
  };

  const handleRangeChange = useCallback((idx: number, v: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[idx] = v;
      return next;
    });
  }, []);

  const handleNextButton = useCallback(() => {
    if (current < questions.length - 1) {
      sliderRef.current?.slickNext();
    } else {
      console.log("최종 제출:", answers);
      navigate(isRetake ? "/board?retake=1" : "/board");
    }
  }, [current, questions.length, answers, navigate, isRetake]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* header aligned left like the image */}
      <div className="absolute top-5 left-[18px] typo-h1">DreamTrack</div>
      {/* main area: centered vertically and horizontally */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-[873px] mx-auto">
          <Slider ref={sliderRef} {...settings}>
            {questions.map((q, idx) => {
              const value = answers[idx] ?? 1;
              return (
                <div key={idx} className="px-2">
                  <div className="flex flex-col items-center gap-8">
                    {/* thin question box, centered content */}
                    <div className="w-full">
                      <div className="w-full h-[56px] flex items-center px-6 rounded-[8px] border border-[#8e9c78]">
                        <p className="mx-auto text-base [font-family:'Inter-Regular',Helvetica] text-center">
                          {q}
                        </p>
                      </div>
                    </div>

                    {/* gradient bar (range input) centered and visually similar to image */}
                    <div className="w-full flex items-center justify-center">
                      <div className="w-full max-w-[700px]">
                        <style>{`
                          .likert-range {
                            -webkit-appearance: none;
                            appearance: none;
                            width: 100%;
                            height: 10px;
                            border-radius: 999px;
                            background: linear-gradient(90deg, rgba(217,230,197,1) 0%, rgba(142,156,120,1) 100%);
                            box-shadow: 0 4px 4px rgba(0,0,0,0.25);
                          }
                          .likert-range:focus { outline: none; }
                          .likert-range::-webkit-slider-thumb {
                            -webkit-appearance: none;
                            width: 18px;
                            height: 18px;
                            border-radius: 50%;
                            background: #ffffff;
                            border: 3px solid #8e9c78;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.25);
                            margin-top: -4px;
                            cursor: pointer;
                          }
                          .likert-range::-moz-range-thumb {
                            width: 18px;
                            height: 18px;
                            border-radius: 50%;
                            background: #ffffff;
                            border: 3px solid #8e9c78;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.25);
                            cursor: pointer;
                          }
                        `}</style>

                        <input
                          type="range"
                          min={1}
                          max={5}
                          step={1}
                          value={value}
                          onChange={(e) =>
                            handleRangeChange(idx, parseInt(e.target.value, 10))
                          }
                          className="likert-range"
                          aria-label="5점 척도"
                        />
                      </div>
                    </div>

                    {/* spacer */}
                    <div className="w-full h-2.5 opacity-0" />

                    {/* submit / next button styled like image */}
                    <button
                      type="button"
                      onClick={handleNextButton}
                      aria-label="다음으로 이동"
                      className="w-full max-w-[700px] bg-[#8e9c78] text-white py-3 rounded-[10px] font-semibold hover:opacity-90 transition"
                    >
                      {idx < questions.length - 1 ? "다음으로" : "제출"}
                    </button>
                  </div>
                </div>
              );
            })}
          </Slider>
        </div>
      </main>
    </div>
  );
}
