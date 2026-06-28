import PageHeader from '@/components/PageHeader';
import SettingsClient from './SettingsClient';

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="설정"
        subtitle="데이터 백업/복원. 나중에 Supabase로 옮길 예정."
      />
      <SettingsClient />
    </>
  );
}
