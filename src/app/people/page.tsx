import { listPeople } from '@/lib/db';
import PageHeader from '@/components/PageHeader';
import PeopleManager from './PeopleManager';

export const dynamic = 'force-dynamic';

export default async function PeoplePage() {
  const people = await listPeople();
  return (
    <>
      <PageHeader title="멤버" />
      <PeopleManager initial={people} />
    </>
  );
}
