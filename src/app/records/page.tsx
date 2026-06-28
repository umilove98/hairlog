import Link from 'next/link';
import { Plus } from 'lucide-react';
import { listPeople, listRecords, listTreatmentTypes } from '@/lib/db';
import type { Category } from '@/lib/types';
import PageHeader from '@/components/PageHeader';
import RecordCard from '@/components/RecordCard';
import FilterChips from '@/components/FilterChips';
import PeriodSwitcher from '@/components/PeriodSwitcher';

export const dynamic = 'force-dynamic';

function monthRange(ym: string): { from: string; to: string } {
  const [y, m] = ym.split('-').map(Number);
  const last = new Date(y, m, 0).getDate();
  return {
    from: `${ym}-01`,
    to: `${ym}-${String(last).padStart(2, '0')}`,
  };
}

export default async function RecordsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    personId?: string;
    month?: string;
    view?: string;
    day?: string;
  }>;
}) {
  const sp = await searchParams;
  const category: Category | undefined =
    sp.category === 'hair' || sp.category === 'skin' ? sp.category : undefined;
  const personId = sp.personId || undefined;
  const isDayView = sp.view === 'day';
  const month = /^\d{4}-\d{2}$/.test(sp.month ?? '') ? sp.month : undefined;
  const day = /^\d{4}-\d{2}-\d{2}$/.test(sp.day ?? '') ? sp.day : undefined;
  const range = isDayView
    ? day
      ? { from: day, to: day }
      : undefined
    : month
    ? monthRange(month)
    : undefined;

  const [people, treatments, records] = await Promise.all([
    listPeople(),
    listTreatmentTypes({ includeArchived: true }),
    listRecords({ category, personId, from: range?.from, to: range?.to }),
  ]);

  return (
    <>
      <PageHeader
        title="기록"
        subtitle={`${records.length}건`}
        action={
          <Link href="/records/new" className="btn-primary">
            <Plus size={16} /> 새 기록
          </Link>
        }
      />
      <PeriodSwitcher />
      <FilterChips people={people} />
      {records.length === 0 ? (
        <div className="card text-center text-sm text-black/50">
          {isDayView
            ? '이 날짜에 기록이 없습니다'
            : month
            ? '이 달에 기록이 없습니다'
            : '조건에 맞는 기록이 없습니다'}
        </div>
      ) : (
        <ul className="space-y-3">
          {records.map((r) => (
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
    </>
  );
}
