'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import type { Category, Person } from '@/lib/types';
import { CATEGORY_LABEL } from '@/lib/types';

export default function FilterChips({ people }: { people: Person[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const category = params.get('category');
  const personId = params.get('personId');

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value === null || value === '') next.delete(key);
    else next.set(key, value);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const categories: { value: Category | null; label: string }[] = [
    { value: null, label: '전체' },
    { value: 'hair', label: CATEGORY_LABEL.hair },
    { value: 'skin', label: CATEGORY_LABEL.skin },
  ];

  return (
    <div className="mb-4 space-y-2">
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            type="button"
            key={c.label}
            className={(category ?? null) === c.value ? 'chip-active' : 'chip'}
            onClick={() => setParam('category', c.value)}
          >
            {c.value === 'hair' && <span className="dot-hair" />}
            {c.value === 'skin' && <span className="dot-skin" />}
            {c.label}
          </button>
        ))}
      </div>
      {people.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={!personId ? 'chip-active' : 'chip'}
            onClick={() => setParam('personId', null)}
          >
            모두
          </button>
          {people.map((p) => (
            <button
              type="button"
              key={p.id}
              className={personId === p.id ? 'chip-active' : 'chip'}
              onClick={() => setParam('personId', p.id)}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
