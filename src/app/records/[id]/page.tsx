import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getRecord, listPeople, listTreatmentTypes } from '@/lib/db';
import PageHeader from '@/components/PageHeader';
import RecordForm from '@/components/RecordForm';

export const dynamic = 'force-dynamic';

export default async function EditRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [record, people, treatments] = await Promise.all([
    getRecord(id),
    listPeople(),
    listTreatmentTypes({ includeArchived: true }),
  ]);
  if (!record) notFound();

  return (
    <>
      <PageHeader
        title="기록 편집"
        action={
          <Link href="/records" className="btn-secondary">
            <ArrowLeft size={16} />
          </Link>
        }
      />
      <RecordForm mode="edit" initial={record} people={people} treatments={treatments} />
    </>
  );
}
