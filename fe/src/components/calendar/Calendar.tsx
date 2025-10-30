type EventBar = {
  start: string; // YYYY-MM-DD
  end?: string; // inclusive
  color: 'primary' | 'muted' | 'dev';
};

type CalendarProps = {
  year: number;
  month: number; // 1-12
  events?: EventBar[];
};

const colorClass: Record<EventBar['color'], string> = {
  primary: 'bg-[#4a5c22]',
  muted: 'bg-[#cfd8bb]',
  dev: 'bg-[#e4e7dc]',
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function getFirstWeekday(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay(); // 0(Sun)-6(Sat)
}

export default function Calendar({ year, month, events = [] }: CalendarProps) {
  const days = getDaysInMonth(year, month);
  const first = getFirstWeekday(year, month);
  const cells: Array<number | null> = Array(first).fill(null).concat(
    Array.from({ length: days }, (_, i) => i + 1)
  );
  while (cells.length % 7 !== 0) cells.push(null);

  const monthLabel = new Date(year, month - 1).toLocaleString('en-US', { month: 'long' });
  const weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const eventMap: Record<string, EventBar[]> = {};
  for (const e of events) {
    const start = new Date(e.start);
    const end = new Date(e.end ?? e.start);
    const cur = new Date(start);
    while (cur <= end) {
      const key = cur.toISOString().slice(0, 10);
      if (!eventMap[key]) eventMap[key] = [];
      eventMap[key].push(e);
      cur.setDate(cur.getDate() + 1);
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-semibold">{monthLabel}</h2>
        <div className="flex gap-2">
          <button className="px-3 py-2 rounded-full bg-[#4a5c22] text-white text-sm">심층검사 다시하기</button>
          <button className="px-3 py-2 rounded-full bg-[#4a5c22] text-white text-sm">퀴즈 풀기</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-3">
        {weekday.map((w) => (
          <div key={w} className="text-[#7a8764] font-medium">{w}</div>
        ))}
        {cells.map((d, i) => {
          const dateStr = d
            ? `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
            : '';
          const dayEvents = d ? eventMap[dateStr] ?? [] : [];
          return (
            <div key={i} className="min-h-[110px] rounded-xl border border-[#e5e7eb] p-3 bg-white">
              <div className="text-sm text-[#6b7280]">{d ?? ''}</div>
              <div className="mt-2 flex flex-col gap-2">
                {dayEvents.slice(0, 3).map((ev, idx) => (
                  <div key={idx} className={`h-3 rounded ${colorClass[ev.color]}`} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

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
    </div>
  );
}


