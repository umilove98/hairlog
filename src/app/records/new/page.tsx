import { listPeople, listTreatmentTypes } from '@/lib/db';
import PageHeader from '@/components/PageHeader';
import RecordForm from '@/components/RecordForm';

export const dynamic = 'force-dynamic';

export default async function NewRecordPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const sp = await searchParams;
  const defaultDate = /^\d{4}-\d{2}-\d{2}$/.test(sp.date ?? '')
    ? sp.date
    : undefined;

  const [people, treatments] = await Promise.all([
    listPeople(),
    listTreatmentTypes(),
  ]);

  return (
    <>
      <PageHeader title="새 기록" />
      <RecordForm
        mode="create"
        people={people}
        treatments={treatments}
        defaultDate={defaultDate}
      />
    </>
  );
}
