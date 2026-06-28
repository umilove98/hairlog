'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import RecordCard from './RecordCard';
import type {
  Category,
  Person,
  TreatmentRecord,
  TreatmentType,
} from '@/lib/types';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function toISO(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function todayISO(): string {
  return toISO(new Date());
}

function currentYM(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

function shiftYM(ym: string, delta: number): string {
  const d = new Date(`${ym}-01T00:00:00`);
  d.setMonth(d.getMonth() + delta);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

function formatYM(ym: string): string {
  const [y, m] = ym.split('-');
  return `${y}년 ${Number(m)}월`;
}

function formatDayLabel(date: string): string {
  const d = new Date(`${date}T00:00:00`);
  const wk = WEEKDAYS[d.getDay()];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${wk})`;
}

interface CellMeta {
  date: string;
  day: number;
  inMonth: boolean;
}

function buildGrid(ym: string): CellMeta[] {
  const [y, m] = ym.split('-').map(Number);
  const firstDay = new Date(y, m - 1, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(y, m, 0).getDate();

  const cells: CellMeta[] = [];

  // 이전 달 꼬리
  for (let i = startWeekday - 1; i >= 0; i--) {
    const d = new Date(y, m - 1, -i);
    cells.push({ date: toISO(d), day: d.getDate(), inMonth: false });
  }
  // 이번 달
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(y, m - 1, day);
    cells.push({ date: toISO(d), day, inMonth: true });
  }
  // 다음 달 머리 (총 6주 = 42칸으로 패딩)
  while (cells.length < 42) {
    const last = cells[cells.length - 1];
    const d = new Date(`${last.date}T00:00:00`);
    d.setDate(d.getDate() + 1);
    cells.push({ date: toISO(d), day: d.getDate(), inMonth: false });
  }
  return cells;
}

interface DayInfo {
  hair: boolean;
  skin: boolean;
  count: number;
}

export default function Calendar({
  records,
  treatments,
  people,
}: {
  records: TreatmentRecord[];
  treatments: TreatmentType[];
  people: Person[];
}) {
  const today = todayISO();
  const [ym, setYM] = useState(currentYM());
  const [selectedDate, setSelectedDate] = useState<string>(today);

  const byDate = useMemo(() => {
    const map = new Map<string, DayInfo>();
    for (const r of records) {
      const cats = new Set<Category>();
      for (const item of r.items) {
        const t = treatments.find((tt) => tt.id === item.treatmentTypeId);
        if (t) cats.add(t.category);
      }
      const cur = map.get(r.date) ?? { hair: false, skin: false, count: 0 };
      map.set(r.date, {
        hair: cur.hair || cats.has('hair'),
        skin: cur.skin || cats.has('skin'),
        count: cur.count + 1,
      });
    }
    return map;
  }, [records, treatments]);

  const grid = useMemo(() => buildGrid(ym), [ym]);

  const dayRecords = useMemo(
    () =>
      records
        .filter((r) => r.date === selectedDate)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [records, selectedDate]
  );

  function handleMonthShift(delta: number) {
    setYM((cur) => shiftYM(cur, delta));
  }

  function jumpToToday() {
    setYM(currentYM());
    setSelectedDate(today);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="btn-secondary !px-2.5"
          onClick={() => handleMonthShift(-1)}
          aria-label="이전 달"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          onClick={jumpToToday}
          className="text-base font-semibold tracking-tight"
          title="오늘로"
        >
          {formatYM(ym)}
        </button>
        <button
          type="button"
          className="btn-secondary !px-2.5"
          onClick={() => handleMonthShift(+1)}
          aria-label="다음 달"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div>
        <div className="mb-1 grid grid-cols-7 text-center text-[11px] font-medium text-black/40">
          {WEEKDAYS.map((w) => (
            <div key={w} className="py-1">
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {grid.map((cell) => {
            const info = byDate.get(cell.date);
            const isSelected = cell.date === selectedDate;
            const isToday = cell.date === today;
            const muted = !cell.inMonth;

            return (
              <button
                key={cell.date}
                type="button"
                onClick={() => setSelectedDate(cell.date)}
                className={[
                  'flex aspect-square flex-col items-center justify-start gap-1 rounded-lg pt-1.5 text-xs transition',
                  isSelected
                    ? 'bg-black text-white'
                    : isToday
                    ? 'border border-black bg-white text-black'
                    : muted
                    ? 'text-black/25'
                    : 'text-black hover:bg-black/5',
                ].join(' ')}
              >
                <span className="text-[13px] font-medium leading-none">
                  {cell.day}
                </span>
                {info ? (
                  <span className="flex items-center gap-0.5">
                    {info.hair && (
                      <span
                        className={`inline-block h-1.5 w-1.5 rounded-full ${
                          isSelected ? 'bg-white' : 'bg-black'
                        }`}
                      />
                    )}
                    {info.skin && (
                      <span
                        className={`inline-block h-1.5 w-1.5 rounded-full border ${
                          isSelected
                            ? 'border-white bg-black'
                            : 'border-black bg-white'
                        }`}
                      />
                    )}
                  </span>
                ) : (
                  <span className="h-1.5 w-1.5" />
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-black/50">
          <span className="flex items-center gap-1">
            <span className="dot-hair" /> 머리
          </span>
          <span className="flex items-center gap-1">
            <span className="dot-skin" /> 피부
          </span>
        </div>
      </div>

      <section>
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold">
            {formatDayLabel(selectedDate)}
          </h2>
          <Link
            href={`/records/new?date=${selectedDate}`}
            className="inline-flex items-center gap-1 text-xs text-black/60 underline"
          >
            <Plus size={12} /> 이 날짜에 추가
          </Link>
        </div>
        {dayRecords.length === 0 ? (
          <div className="card text-center text-sm text-black/50">
            이 날짜에 기록이 없습니다
          </div>
        ) : (
          <ul className="space-y-3">
            {dayRecords.map((r) => (
              <li key={r.id}>
                <RecordCard
                  record={r}
                  person={people.find((p) => p.id === r.personId)}
                  treatments={treatments}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
