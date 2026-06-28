import Link from 'next/link';
import { Plus } from 'lucide-react';
import { listPeople, listRecords, listTreatmentTypes } from '@/lib/db';
import PageHeader from '@/components/PageHeader';
import Calendar from '@/components/Calendar';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [people, treatments, records] = await Promise.all([
    listPeople(),
    listTreatmentTypes({ includeArchived: true }),
    listRecords(),
  ]);

  return (
    <>
      <PageHeader
        title="hairlog"
        action={
          <Link href="/records/new" className="btn-primary">
            <Plus size={16} /> 새 기록
          </Link>
        }
      />
      <Calendar records={records} treatments={treatments} people={people} />
    </>
  );
}
