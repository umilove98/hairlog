import { listTreatmentTypes } from '@/lib/db';
import PageHeader from '@/components/PageHeader';
import TreatmentsManager from './TreatmentsManager';

export const dynamic = 'force-dynamic';

export default async function TreatmentsPage() {
  const treatments = await listTreatmentTypes({ includeArchived: true });
  return (
    <>
      <PageHeader title="시술 종류" />
      <TreatmentsManager initial={treatments} />
    </>
  );
}
