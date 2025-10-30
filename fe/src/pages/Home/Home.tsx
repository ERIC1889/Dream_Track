import { useState, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

export default function Home() {
  const [selected, setSelected] = useState<{
    title: string;
    description?: string;
  } | null>(null);

  const initialDate = "2025-10-01";
  const events = [
    {
      title: "교외활동",
      start: "2025-10-16",
      end: "2025-10-18",
      display: "block",
      color: "#4a5c22",
      textColor: "#ffffff",
      extendedProps: { description: "지역 봉사활동 참여" },
    },
    {
      title: "교내활동",
      start: "2025-10-16",
      end: "2025-10-20",
      display: "block",
      color: "#cfd8bb",
      textColor: "#2a2a2a",
      extendedProps: { description: "동아리 정기 프로젝트 진행" },
    },
    {
      title: "자기개발",
      start: "2025-10-25",
      end: "2025-10-25",
      display: "block",
      color: "#e4e7dc",
      textColor: "#2a2a2a",
      extendedProps: { description: "개인 사이드 프로젝트 마일스톤" },
    },
  ];

  const handleEventClick = useCallback((info: any) => {
    setSelected({
      title: info.event.title,
      description: info.event.extendedProps?.description,
    });
  }, []);

  const closeModal = useCallback(() => setSelected(null), []);

  return (
    <div className="px-6 py-6">
      <div className="flex items-center gap-[57px] mb-4">
        <h1 className="typo-h1">DreamTrack</h1>
        <div className="flex gap-2">
          <button className="w-[180px] h-[47px] rounded-full bg-[#4a5c22] text-white flex items-center justify-center gap-2 font-sans font-semibold text-[14px] leading-[1.4]">
            심층검사 다시하기
            <svg
              width="7"
              height="19"
              viewBox="0 0 7 19"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.01037 11.4878V7.54622L5.64939 7.58581L0.735155 12.5057L0 11.7705L4.91423 6.85631L4.96513 7.49533H1.0066V6.49438L6 6.50569V11.4878H5.01037Z"
                fill="white"
              />
            </svg>
          </button>
          <button className="w-[180px] h-[47px] rounded-full bg-[#4a5c22] text-white flex items-center justify-center gap-2 font-sans font-semibold text-[14px] leading-[1.4]">
            퀴즈 풀기
            <svg
              width="7"
              height="19"
              viewBox="0 0 7 19"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.01037 11.4878V7.54622L5.64939 7.58581L0.735155 12.5057L0 11.7705L4.91423 6.85631L4.96513 7.49533H1.0066V6.49438L6 6.50569V11.4878H5.01037Z"
                fill="white"
              />
            </svg>
          </button>
        </div>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{ left: "", center: "title", right: "" }}
        height="auto"
        dayHeaderFormat={{ weekday: "long" }}
        titleFormat={{ month: "long" }}
        dayMaxEventRows={3}
        initialDate={initialDate}
        events={events}
        eventClick={handleEventClick}
      />

      <div className="flex items-center gap-6 mt-6">
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-[#4a5c22]" />
          <span className="text-sm text-[#4b5563]">교외활동</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-[#cfd8bb]" />
          <span className="text-sm text-[#4b5563]">교내활동</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-[#e4e7dc]" />
          <span className="text-sm text-[#4b5563]">자기개발</span>
        </div>
      </div>
      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={closeModal} />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-[#232323]">
              {selected.title}
            </h3>
            {selected.description ? (
              <p className="mt-3 text-[14px] text-[#6f6f6f]">
                {selected.description}
              </p>
            ) : null}
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-lg bg-[#4a5c22] text-white text-sm"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
