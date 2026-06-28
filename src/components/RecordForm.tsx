'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import type { Category, Person, RecordItem, TreatmentRecord, TreatmentType } from '@/lib/types';
import { CATEGORY_LABEL } from '@/lib/types';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function today(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDate(date: string): string {
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  const wk = WEEKDAYS[d.getDay()];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${wk})`;
}

const LAST_STEP = 3;

function CollapsedStep({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="card flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="label mb-0.5">{title}</div>
        <div className="truncate text-sm">{children}</div>
      </div>
      <button type="button" className="chip shrink-0" onClick={onEdit}>
        수정
      </button>
    </div>
  );
}

interface Props {
  people: Person[];
  treatments: TreatmentType[];
  initial?: TreatmentRecord;
  mode: 'create' | 'edit';
  defaultDate?: string;
}

export default function RecordForm({
  people,
  treatments,
  initial,
  mode,
  defaultDate,
}: Props) {
  const router = useRouter();
  const [personId, setPersonId] = useState(initial?.personId ?? people[0]?.id ?? '');
  const [date, setDate] = useState(initial?.date ?? defaultDate ?? today());
  const [items, setItems] = useState<RecordItem[]>(initial?.items ?? []);
  const [memo, setMemo] = useState(initial?.memo ?? '');
  const [pickerCategory, setPickerCategory] = useState<Category | 'all'>('all');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(mode === 'edit' ? LAST_STEP : 0);
  const [furthest, setFurthest] = useState(mode === 'edit' ? LAST_STEP : 0);

  function goToStep(next: number) {
    setStep(next);
    setFurthest((f) => Math.max(f, next));
  }

  function advance(fromStep: number) {
    goToStep(furthest > fromStep ? furthest : Math.min(fromStep + 1, LAST_STEP));
  }

  const selectedPerson = people.find((p) => p.id === personId);

  const availableTreatments = useMemo(
    () =>
      treatments
        .filter((t) => !t.archived)
        .filter((t) => pickerCategory === 'all' || t.category === pickerCategory),
    [treatments, pickerCategory]
  );

  function addTreatment(t: TreatmentType) {
    setItems((prev) => [
      ...prev,
      { treatmentTypeId: t.id, unit: t.defaultUnit },
    ]);
  }

  function updateItem(idx: number, patch: Partial<RecordItem>) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!personId) return setError('멤버를 선택하세요');
    if (items.length === 0) return setError('시술을 1개 이상 추가하세요');

    setBusy(true);
    const url = mode === 'edit' && initial ? `/api/records/${initial.id}` : '/api/records';
    const method = mode === 'edit' ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ personId, date, items, memo: memo.trim() || undefined }),
    });
    setBusy(false);
    if (!res.ok) {
      const j = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(j?.error ?? '저장 실패');
      return;
    }
    router.push('/records');
    router.refresh();
  }

  async function deleteRecord() {
    if (!initial) return;
    if (!confirm('이 기록을 삭제할까요?')) return;
    const res = await fetch(`/api/records/${initial.id}`, { method: 'DELETE' });
    if (!res.ok) return;
    router.push('/records');
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* 1단계: 날짜 */}
      {step === 0 ? (
        <div className="card space-y-3">
          <label className="label">날짜</label>
          <input
            type="date"
            className="input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <button
            type="button"
            className="btn-primary w-full"
            onClick={() => advance(0)}
          >
            {furthest > 0 ? '완료' : '다음'}
          </button>
        </div>
      ) : (
        <CollapsedStep title="날짜" onEdit={() => setStep(0)}>
          {formatDate(date)}
        </CollapsedStep>
      )}

      {/* 2단계: 멤버 */}
      {furthest >= 1 &&
        (step === 1 ? (
          <div className="card space-y-3">
            <label className="label">멤버</label>
            {people.length === 0 ? (
              <p className="text-sm text-black/50">
                먼저 <a className="underline" href="/people">멤버</a>를 등록하세요
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {people.map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    className={personId === p.id ? 'chip-active' : 'chip'}
                    onClick={() => {
                      setPersonId(p.id);
                      advance(1);
                    }}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <CollapsedStep title="멤버" onEdit={() => setStep(1)}>
            {selectedPerson?.name ?? '미선택'}
          </CollapsedStep>
        ))}

      {/* 3단계: 시술 */}
      {furthest >= 2 &&
        (step === 2 ? (
          <>
            <div className="card space-y-3">
              <div className="flex items-center justify-between">
                <label className="label mb-0">시술 추가</label>
                <div className="flex gap-1">
                  {(['all', 'hair', 'skin'] as const).map((c) => (
                    <button
                      type="button"
                      key={c}
                      className={pickerCategory === c ? 'chip-active' : 'chip'}
                      onClick={() => setPickerCategory(c)}
                    >
                      {c === 'all' ? '전체' : CATEGORY_LABEL[c]}
                    </button>
                  ))}
                </div>
              </div>
              {treatments.length === 0 ? (
                <p className="text-sm text-black/50">
                  먼저 <a className="underline" href="/treatments">시술 종류</a>를 등록하세요
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {availableTreatments.map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      className="chip"
                      onClick={() => addTreatment(t)}
                    >
                      <Plus size={12} />
                      <span className={t.category === 'hair' ? 'dot-hair' : 'dot-skin'} />
                      {t.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="card space-y-3">
                <div className="label mb-0">선택된 시술</div>
                <ul className="space-y-3">
                  {items.map((it, idx) => {
                    const t = treatments.find((tt) => tt.id === it.treatmentTypeId);
                    if (!t) return null;
                    return (
                      <li key={idx} className="rounded-xl border border-black/10 p-3">
                        <div className="mb-2 flex items-center gap-2">
                          <span className={t.category === 'hair' ? 'dot-hair' : 'dot-skin'} />
                          <span className="font-medium">{t.name}</span>
                          <button
                            type="button"
                            className="ml-auto btn-danger"
                            onClick={() => removeItem(idx)}
                            aria-label="제거"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-1">
                            <label className="label">용량</label>
                            <input
                              type="number"
                              inputMode="decimal"
                              className="input"
                              value={it.amount ?? ''}
                              onChange={(e) =>
                                updateItem(idx, {
                                  amount:
                                    e.target.value === ''
                                      ? undefined
                                      : Number(e.target.value),
                                })
                              }
                            />
                          </div>
                          <div className="col-span-1">
                            <label className="label">단위</label>
                            <input
                              className="input"
                              placeholder={t.defaultUnit ?? ''}
                              value={it.unit ?? ''}
                              onChange={(e) => updateItem(idx, { unit: e.target.value })}
                            />
                          </div>
                          <div className="col-span-1">
                            <label className="label">메모</label>
                            <input
                              className="input"
                              placeholder="예: 갈색"
                              value={it.note ?? ''}
                              onChange={(e) => updateItem(idx, { note: e.target.value })}
                            />
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <button
              type="button"
              className="btn-primary w-full"
              disabled={items.length === 0}
              onClick={() => advance(2)}
            >
              {furthest > 2 ? '완료' : '다음'}
            </button>
          </>
        ) : (
          <CollapsedStep title="시술" onEdit={() => setStep(2)}>
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {items.map((it, idx) => {
                const t = treatments.find((tt) => tt.id === it.treatmentTypeId);
                if (!t) return null;
                return (
                  <span key={idx} className="inline-flex items-center gap-1">
                    <span className={t.category === 'hair' ? 'dot-hair' : 'dot-skin'} />
                    {t.name}
                  </span>
                );
              })}
            </span>
          </CollapsedStep>
        ))}

      {/* 4단계: 메모 + 저장 */}
      {furthest >= LAST_STEP && (
        <>
          <div className="card">
            <label className="label">내용</label>
            <textarea
              className="input min-h-[80px]"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={busy || items.length === 0 || !personId}
            >
              {mode === 'edit' ? '저장' : '기록 추가'}
            </button>
            {mode === 'edit' && (
              <button type="button" className="btn-danger" onClick={deleteRecord}>
                <Trash2 size={16} /> 삭제
              </button>
            )}
          </div>
        </>
      )}
    </form>
  );
}
