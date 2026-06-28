'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, Check, X, Plus, ArchiveRestore, Archive } from 'lucide-react';
import type { Category, TreatmentType } from '@/lib/types';
import { CATEGORY_LABEL } from '@/lib/types';

export default function TreatmentsManager({ initial }: { initial: TreatmentType[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('hair');
  const [unit, setUnit] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ name: string; category: Category; defaultUnit: string }>({
    name: '',
    category: 'hair',
    defaultUnit: '',
  });
  const [, startTransition] = useTransition();

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const res = await fetch('/api/treatments', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), category, defaultUnit: unit }),
    });
    if (!res.ok) return;
    const created = (await res.json()) as TreatmentType;
    setItems((prev) => [...prev, created]);
    setName('');
    setUnit('');
    refresh();
  }

  async function save(id: string) {
    const res = await fetch(`/api/treatments/${id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: draft.name.trim(),
        category: draft.category,
        defaultUnit: draft.defaultUnit,
      }),
    });
    if (!res.ok) return;
    const updated = (await res.json()) as TreatmentType;
    setItems((prev) => prev.map((t) => (t.id === id ? updated : t)));
    setEditingId(null);
    refresh();
  }

  async function toggleArchive(t: TreatmentType) {
    const res = await fetch(`/api/treatments/${t.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ archived: !t.archived }),
    });
    if (!res.ok) return;
    const updated = (await res.json()) as TreatmentType;
    setItems((prev) => prev.map((x) => (x.id === t.id ? updated : x)));
    refresh();
  }

  async function remove(id: string) {
    if (!confirm('이 시술 종류를 삭제하면 과거 기록에서도 해당 항목이 제거됩니다. 계속할까요?')) {
      return;
    }
    const res = await fetch(`/api/treatments/${id}`, { method: 'DELETE' });
    if (!res.ok) return;
    setItems((prev) => prev.filter((t) => t.id !== id));
    refresh();
  }

  const active = items.filter((t) => !t.archived);
  const archived = items.filter((t) => t.archived);

  return (
    <div className="space-y-4">
      <form onSubmit={add} className="card space-y-3">
        <div>
          <label className="label">시술명</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="label">분류</label>
            <div className="flex gap-2">
              <button
                type="button"
                className={category === 'hair' ? 'chip-active' : 'chip'}
                onClick={() => setCategory('hair')}
              >
                <span className="dot-hair" /> 머리
              </button>
              <button
                type="button"
                className={category === 'skin' ? 'chip-active' : 'chip'}
                onClick={() => setCategory('skin')}
              >
                <span className="dot-skin" /> 피부
              </button>
            </div>
          </div>
          <div className="flex-1">
            <label className="label">상세</label>
            <input
              className="input"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            />
          </div>
        </div>
        <button type="submit" className="btn-primary w-full" disabled={!name.trim()}>
          <Plus size={16} /> 추가
        </button>
      </form>

      <Section
        title="활성"
        items={active}
        editingId={editingId}
        draft={draft}
        onStartEdit={(t) => {
          setEditingId(t.id);
          setDraft({
            name: t.name,
            category: t.category,
            defaultUnit: t.defaultUnit ?? '',
          });
        }}
        onChangeDraft={setDraft}
        onSave={save}
        onCancelEdit={() => setEditingId(null)}
        onArchive={(t) => toggleArchive(t)}
        onDelete={remove}
      />

      {archived.length > 0 && (
        <Section
          title="보관됨"
          items={archived}
          editingId={editingId}
          draft={draft}
          onStartEdit={(t) => {
            setEditingId(t.id);
            setDraft({
              name: t.name,
              category: t.category,
              defaultUnit: t.defaultUnit ?? '',
            });
          }}
          onChangeDraft={setDraft}
          onSave={save}
          onCancelEdit={() => setEditingId(null)}
          onArchive={(t) => toggleArchive(t)}
          onDelete={remove}
          isArchivedSection
        />
      )}
    </div>
  );
}

function Section({
  title,
  items,
  editingId,
  draft,
  onStartEdit,
  onChangeDraft,
  onSave,
  onCancelEdit,
  onArchive,
  onDelete,
  isArchivedSection,
}: {
  title: string;
  items: TreatmentType[];
  editingId: string | null;
  draft: { name: string; category: Category; defaultUnit: string };
  onStartEdit: (t: TreatmentType) => void;
  onChangeDraft: (d: { name: string; category: Category; defaultUnit: string }) => void;
  onSave: (id: string) => void;
  onCancelEdit: () => void;
  onArchive: (t: TreatmentType) => void;
  onDelete: (id: string) => void;
  isArchivedSection?: boolean;
}) {
  return (
    <div className="space-y-2">
      <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-black/50">
        {title}
      </h2>
      {items.length === 0 && (
        <div className="card text-center text-sm text-black/50">
          {isArchivedSection ? '보관된 항목 없음' : '아직 등록된 시술이 없습니다'}
        </div>
      )}
      <ul className="space-y-2">
        {items.map((t) => (
          <li key={t.id} className="card">
            {editingId === t.id ? (
              <div className="space-y-3">
                <input
                  className="input"
                  value={draft.name}
                  onChange={(e) => onChangeDraft({ ...draft, name: e.target.value })}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={draft.category === 'hair' ? 'chip-active' : 'chip'}
                    onClick={() => onChangeDraft({ ...draft, category: 'hair' })}
                  >
                    <span className="dot-hair" /> 머리
                  </button>
                  <button
                    type="button"
                    className={draft.category === 'skin' ? 'chip-active' : 'chip'}
                    onClick={() => onChangeDraft({ ...draft, category: 'skin' })}
                  >
                    <span className="dot-skin" /> 피부
                  </button>
                </div>
                <div>
                  <label className="label">상세</label>
                  <input
                    className="input"
                    value={draft.defaultUnit}
                    onChange={(e) => onChangeDraft({ ...draft, defaultUnit: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <button className="btn-primary flex-1" onClick={() => onSave(t.id)}>
                    <Check size={16} /> 저장
                  </button>
                  <button className="btn-secondary" onClick={onCancelEdit}>
                    <X size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className={t.category === 'hair' ? 'dot-hair' : 'dot-skin'} />
                <div className="flex-1">
                  <div className="font-medium">{t.name}</div>
                  <div className="text-xs text-black/50">
                    {CATEGORY_LABEL[t.category]}
                    {t.defaultUnit ? ` · ${t.defaultUnit}` : ''}
                  </div>
                </div>
                <button
                  className="btn-secondary"
                  onClick={() => onStartEdit(t)}
                  aria-label="편집"
                >
                  <Pencil size={16} />
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => onArchive(t)}
                  aria-label={t.archived ? '복원' : '보관'}
                  title={t.archived ? '복원' : '보관'}
                >
                  {t.archived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
                </button>
                <button
                  className="btn-danger"
                  onClick={() => onDelete(t.id)}
                  aria-label="삭제"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
