'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function currentYM(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function shiftYM(ym: string | null, delta: number): string {
  const base = ym ? new Date(`${ym}-01T00:00:00`) : new Date();
  base.setDate(1);
  base.setMonth(base.getMonth() + delta);
  return `${base.getFullYear()}-${pad(base.getMonth() + 1)}`;
}

function shiftDay(day: string | null, delta: number): string {
  const base = day ? new Date(`${day}T00:00:00`) : new Date();
  base.setDate(base.getDate() + delta);
  return `${base.getFullYear()}-${pad(base.getMonth() + 1)}-${pad(base.getDate())}`;
}

function formatYM(ym: string): string {
  const [y, m] = ym.split('-');
  return `${y}년 ${Number(m)}월`;
}

function formatDay(day: string): string {
  const d = new Date(`${day}T00:00:00`);
  const wk = WEEKDAYS[d.getDay()];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${wk})`;
}

export default function PeriodSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const view = params.get('view') === 'day' ? 'day' : 'month';
  const month = params.get('month');
  const day = params.get('day');

  function update(next: URLSearchParams) {
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function setView(value: 'day' | 'month') {
    const next = new URLSearchParams(params.toString());
    if (value === 'day') {
      next.set('view', 'day');
      if (!next.get('day')) next.set('day', todayISO());
      next.delete('month');
    } else {
      next.delete('view');
      next.delete('day');
    }
    update(next);
  }

  function setMonth(value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set('month', value);
    else next.delete('month');
    update(next);
  }

  function setDay(value: string) {
    const next = new URLSearchParams(params.toString());
    next.set('view', 'day');
    next.set('day', value);
    next.delete('month');
    update(next);
  }

  return (
    <div className="mb-3 space-y-2">
      <div className="flex justify-center gap-2">
        <button
          type="button"
          className={view === 'day' ? 'chip-active' : 'chip'}
          onClick={() => setView('day')}
        >
          일별
        </button>
        <button
          type="button"
          className={view === 'month' ? 'chip-active' : 'chip'}
          onClick={() => setView('month')}
        >
          월별
        </button>
      </div>

      {view === 'day' ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn-secondary !px-2.5"
            onClick={() => setDay(shiftDay(day, -1))}
            aria-label="이전 날"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex flex-1 items-center justify-center gap-2">
            <span className="text-base font-semibold tracking-tight">
              {formatDay(day ?? todayISO())}
            </span>
            <button
              type="button"
              className="chip"
              onClick={() => setDay(todayISO())}
            >
              오늘
            </button>
          </div>
          <button
            type="button"
            className="btn-secondary !px-2.5"
            onClick={() => setDay(shiftDay(day, +1))}
            aria-label="다음 날"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn-secondary !px-2.5"
            onClick={() => setMonth(shiftYM(month, -1))}
            aria-label="이전 달"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex flex-1 items-center justify-center gap-2">
            <span className="text-base font-semibold tracking-tight">
              {month ? formatYM(month) : '전체 기간'}
            </span>
            {month ? (
              <button
                type="button"
                className="chip"
                onClick={() => setMonth(null)}
              >
                전체
              </button>
            ) : (
              <button
                type="button"
                className="chip"
                onClick={() => setMonth(currentYM())}
              >
                이번 달
              </button>
            )}
          </div>
          <button
            type="button"
            className="btn-secondary !px-2.5"
            onClick={() => setMonth(shiftYM(month, +1))}
            aria-label="다음 달"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
