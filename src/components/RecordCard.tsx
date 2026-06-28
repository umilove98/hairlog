import Link from 'next/link';
import type { Person, TreatmentRecord, TreatmentType } from '@/lib/types';

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const wk = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
  return `${yy}.${mm}.${dd} (${wk})`;
}

export default function RecordCard({
  record,
  person,
  treatments,
}: {
  record: TreatmentRecord;
  person?: Person;
  treatments: TreatmentType[];
}) {
  return (
    <Link
      href={`/records/${record.id}`}
      className="card block transition hover:border-black/30"
    >
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <span className="font-medium">{person?.name ?? '(삭제됨)'}</span>
        <span className="text-xs text-black/50">{formatDate(record.date)}</span>
      </div>
      <ul className="space-y-1">
        {record.items.map((it, idx) => {
          const t = treatments.find((tt) => tt.id === it.treatmentTypeId);
          if (!t) {
            return (
              <li key={idx} className="text-sm text-black/40">
                삭제된 시술
              </li>
            );
          }
          const amount =
            it.amount !== undefined
              ? `${it.amount}${it.unit ?? t.defaultUnit ?? ''}`
              : '';
          return (
            <li key={idx} className="flex items-center gap-2 text-sm">
              <span className={t.category === 'hair' ? 'dot-hair' : 'dot-skin'} />
              <span className="font-medium">{t.name}</span>
              {amount && <span className="text-black/70">{amount}</span>}
              {it.note && <span className="text-black/40">· {it.note}</span>}
            </li>
          );
        })}
      </ul>
      {record.memo && (
        <p className="mt-2 border-t border-black/5 pt-2 text-xs text-black/50">
          {record.memo}
        </p>
      )}
    </Link>
  );
}
