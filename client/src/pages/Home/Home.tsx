import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useAuthStore } from "../../stores/authStore";
import { getRoadmap, completeMilestone } from "../../lib/api/analysis";
import { generateQuiz } from "../../lib/api/quiz";

interface Milestone {
  id: number;
  title: string;
  category: string;
  description: string;
  target_date: string;
  end_date?: string;  // 종료 날짜 추가
  duration_weeks?: number;
  completed: boolean;
}

interface EventInfo {
  title: string;
  description?: string;
  milestoneId?: number;
  completed?: boolean;
}

export default function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [selected, setSelected] = useState<EventInfo | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quizLoading, setQuizLoading] = useState(false);
  const [initialDate, setInitialDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const calendarRef = useRef<FullCalendar>(null);

  // 카테고리별 색상 매핑
  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      "교외활동": "#4a5c22",
      "교내활동": "#cfd8bb",
      "자기개발": "#e4e7dc",
    };
    return colorMap[category] || "#e4e7dc";
  };

  const getCategoryTextColor = (category: string) => {
    const textColorMap: { [key: string]: string } = {
      "교외활동": "#ffffff",
      "교내활동": "#2a2a2a",
      "자기개발": "#2a2a2a",
    };
    return textColorMap[category] || "#2a2a2a";
  };

  // 로드맵 데이터 로드
  useEffect(() => {
    const loadRoadmap = async () => {
      try {
        const response = await getRoadmap();
        console.log('📊 로드맵 응답:', response);
        
        if (response.success) {
          let formattedEvents: any[] = [];
          
          // roadmap 데이터 사용하되, milestones에서 실제 ID 가져오기
          if (response.data.roadmap && Array.isArray(response.data.roadmap)) {
            console.log('📌 roadmap 개수:', response.data.roadmap.length);
            console.log('📌 첫 번째 roadmap 원본:', response.data.roadmap[0]);
            console.log('📌 milestones:', response.data.milestones);
            
            // roadmap 데이터의 색상을 재설정하고 milestone ID 매핑
            formattedEvents = response.data.roadmap.map((event: any, index: number) => {
              const category = event.extendedProps?.category || event.category || '자기개발';
              
              // milestones에서 같은 제목을 가진 항목 찾아서 실제 ID 가져오기
              let milestoneId = event.extendedProps?.milestoneId;
              let completed = event.extendedProps?.completed || false;
              
              if (response.data.milestones && response.data.milestones.length > 0) {
                const matchedMilestone = response.data.milestones.find(
                  (m: Milestone) => m.title === event.title
                );
                if (matchedMilestone) {
                  milestoneId = matchedMilestone.id;
                  completed = matchedMilestone.completed;
                }
              }
              
              const formatted = {
                ...event,
                color: getCategoryColor(category),
                textColor: getCategoryTextColor(category),
                extendedProps: {
                  ...event.extendedProps,
                  milestoneId: milestoneId,
                  completed: completed,
                  category: category,
                },
                className: completed ? 'opacity-60' : '',
              };
              
              if (index === 0) {
                console.log('📌 첫 번째 이벤트 포맷 후:', formatted);
              }
              
              return formatted;
            });
          }
          
          console.log('✅ 최종 이벤트 배열:', formattedEvents);
          console.log('✅ 첫 번째 이벤트 상세:', formattedEvents[0]);
          console.log('✅ 이벤트 개수:', formattedEvents.length);
          setEvents(formattedEvents);
          
          // 첫 번째 이벤트의 날짜로 캘린더 이동
          if (formattedEvents.length > 0 && formattedEvents[0].start) {
            console.log('📅 캘린더를 이벤트 날짜로 이동:', formattedEvents[0].start);
            setTimeout(() => {
              const calendarApi = calendarRef.current?.getApi();
              if (calendarApi) {
                calendarApi.gotoDate(formattedEvents[0].start);
                console.log('✅ 캘린더 이동 완료');
              }
            }, 100);
          }
        }
      } catch (error: any) {
        console.error("로드맵 로드 실패:", error);
        // 로드맵이 없으면 빈 배열로 설정
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadRoadmap();
  }, []);

  const handleEventClick = useCallback((info: any) => {
    setSelected({
      title: info.event.title,
      description: info.event.extendedProps?.description,
      milestoneId: info.event.extendedProps?.milestoneId,
      completed: info.event.extendedProps?.completed,
    });
  }, []);

  const closeModal = useCallback(() => setSelected(null), []);

  const handleCompleteMilestone = async () => {
    if (!selected?.milestoneId) return;
    
    try {
      await completeMilestone(selected.milestoneId);
      // 로드맵 새로고침
      const response = await getRoadmap();
      if (response.success) {
        let formattedEvents: any[] = [];
        
        // roadmap 데이터 사용하되, milestones에서 실제 ID 가져오기
        if (response.data.roadmap && Array.isArray(response.data.roadmap)) {
          // roadmap 데이터의 색상을 재설정하고 milestone ID 매핑
          formattedEvents = response.data.roadmap.map((event: any) => {
            const category = event.extendedProps?.category || event.category || '자기개발';
            
            // milestones에서 같은 제목을 가진 항목 찾아서 실제 ID 가져오기
            let milestoneId = event.extendedProps?.milestoneId;
            let completed = event.extendedProps?.completed || false;
            
            if (response.data.milestones && response.data.milestones.length > 0) {
              const matchedMilestone = response.data.milestones.find(
                (m: Milestone) => m.title === event.title
              );
              if (matchedMilestone) {
                milestoneId = matchedMilestone.id;
                completed = matchedMilestone.completed;
              }
            }
            
            return {
              ...event,
              color: getCategoryColor(category),
              textColor: getCategoryTextColor(category),
              extendedProps: {
                ...event.extendedProps,
                milestoneId: milestoneId,
                completed: completed,
                category: category,
              },
              className: completed ? 'opacity-60' : '',
            };
          });
        }
        
        setEvents(formattedEvents);
      }
      closeModal();
    } catch (error: any) {
      console.error("마일스톤 완료 처리 실패:", error);
      alert(error.message || "마일스톤 완료 처리에 실패했습니다.");
    }
  };

  const handleQuizClick = async () => {
    setQuizLoading(true);
    try {
      // 퀴즈 생성
      await generateQuiz();
      // 퀴즈 페이지로 이동
      navigate("/quiz");
    } catch (error: any) {
      console.error("퀴즈 생성 실패:", error);
      alert(error.message || "퀴즈 생성에 실패했습니다.");
    } finally {
      setQuizLoading(false);
    }
  };

  const handleLogout = useCallback(() => {
    logout();
    navigate("/login", { replace: true });
  }, [logout, navigate]);

  // 이전 달로 이동
  const handlePrevMonth = useCallback(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.prev();
    }
  }, []);

  // 다음 달로 이동
  const handleNextMonth = useCallback(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.next();
    }
  }, []);

  // 오늘로 이동
  const handleToday = useCallback(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.today();
    }
  }, []);

  if (loading) {
    return (
      <div className="px-6 py-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#4a5c22] mx-auto mb-4"></div>
          <p className="text-lg text-[#6f6f6f]">로드맵을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-[57px]">
          <h1 className="typo-h1">DreamTrack</h1>
          <div className="flex gap-2">
          <button
            onClick={() => navigate("/preliminary")}
            className="w-[180px] h-[47px] rounded-full bg-[#4a5c22] text-white flex items-center justify-center gap-2 font-sans font-semibold text-[14px] leading-[1.4]"
          >
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
          <button
            onClick={handleQuizClick}
            disabled={quizLoading}
            className="w-[180px] h-[47px] rounded-full bg-[#4a5c22] text-white flex items-center justify-center gap-2 font-sans font-semibold text-[14px] leading-[1.4] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {quizLoading ? "퀴즈 생성 중..." : "퀴즈 풀기"}
            {!quizLoading && (
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
            )}
          </button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-[#232323]">{user.name}</p>
                <p className="text-xs text-[#6f6f6f]">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-[#e4e7dc] text-[#4a5c22] text-sm font-semibold hover:bg-[#cfd8bb] transition-colors"
              >
                로그아웃
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 캘린더 네비게이션 버튼 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="px-4 py-2 rounded-lg bg-[#eef2e6] text-[#4a5c22] hover:bg-[#d9e2c5] transition-colors flex items-center gap-2"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          이전 달
        </button>
        
        <button
          onClick={handleToday}
          className="px-4 py-2 rounded-lg bg-[#4a5c22] text-white hover:bg-[#3a4a18] transition-colors font-semibold"
        >
          오늘
        </button>
        
        <button
          onClick={handleNextMonth}
          className="px-4 py-2 rounded-lg bg-[#eef2e6] text-[#4a5c22] hover:bg-[#d9e2c5] transition-colors flex items-center gap-2"
        >
          다음 달
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <FullCalendar
        ref={calendarRef}
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
        eventDisplay="block"
        displayEventTime={false}
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
            {selected.completed && (
              <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm">
                ✓ 완료됨
              </div>
            )}
            <div className="mt-6 flex justify-end gap-2">
              {selected.milestoneId && !selected.completed && (
                <button
                  onClick={handleCompleteMilestone}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 transition-colors"
                >
                  완료 처리
                </button>
              )}
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-lg bg-[#4a5c22] text-white text-sm hover:bg-[#3a4a18] transition-colors"
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
