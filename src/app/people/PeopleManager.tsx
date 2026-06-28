'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, Check, X, Plus } from 'lucide-react';
import type { Person } from '@/lib/types';

export default function PeopleManager({ initial }: { initial: Person[] }) {
  const router = useRouter();
  const [people, setPeople] = useState(initial);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function addPerson(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    const res = await fetch('/api/people', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    });
    setBusy(false);
    if (!res.ok) return;
    const created = (await res.json()) as Person;
    setPeople((prev) => [...prev, created]);
    setName('');
    refresh();
  }

  async function saveEdit(id: string) {
    if (!editName.trim()) return;
    const res = await fetch(`/api/people/${id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: editName.trim() }),
    });
    if (!res.ok) return;
    const updated = (await res.json()) as Person;
    setPeople((prev) => prev.map((p) => (p.id === id ? updated : p)));
    setEditingId(null);
    refresh();
  }

  async function removePerson(id: string) {
    if (!confirm('이 멤버와 관련된 모든 기록이 함께 삭제됩니다. 계속할까요?')) {
      return;
    }
    const res = await fetch(`/api/people/${id}`, { method: 'DELETE' });
    if (!res.ok) return;
    setPeople((prev) => prev.filter((p) => p.id !== id));
    refresh();
  }

  return (
    <div className="space-y-4">
      <form onSubmit={addPerson} className="card flex gap-2">
        <input
          className="input flex-1"
          placeholder="이름 (예: 나, 동생, 엄마)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" className="btn-primary" disabled={busy || !name.trim()}>
          <Plus size={16} /> 추가
        </button>
      </form>

      <ul className="space-y-2">
        {people.length === 0 && (
          <li className="card text-center text-sm text-black/50">
            아직 등록된 멤버가 없습니다
          </li>
        )}
        {people.map((p) => (
          <li key={p.id} className="card flex items-center gap-2">
            {editingId === p.id ? (
              <>
                <input
                  className="input flex-1"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  autoFocus
                />
                <button
                  className="btn-primary"
                  onClick={() => saveEdit(p.id)}
                  aria-label="저장"
                >
                  <Check size={16} />
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setEditingId(null)}
                  aria-label="취소"
                >
                  <X size={16} />
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-base font-medium">{p.name}</span>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setEditingId(p.id);
                    setEditName(p.name);
                  }}
                  aria-label="편집"
                >
                  <Pencil size={16} />
                </button>
                <button
                  className="btn-danger"
                  onClick={() => removePerson(p.id)}
                  aria-label="삭제"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
