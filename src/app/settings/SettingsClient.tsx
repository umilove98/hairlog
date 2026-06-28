'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Upload } from 'lucide-react';

export default function SettingsClient() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onImport(e: React.ChangeEvent<HTMLInputElement>) {
    setMsg(null);
    setErr(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    if (!confirm('현재 데이터를 덮어씁니다. 계속할까요?')) {
      e.target.value = '';
      return;
    }
    let payload: unknown;
    try {
      payload = JSON.parse(text);
    } catch {
      setErr('JSON 파싱 실패');
      return;
    }
    const res = await fetch('/api/import', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const j = (await res.json().catch(() => null)) as { error?: string } | null;
      setErr(j?.error ?? '가져오기 실패');
      return;
    }
    setMsg('가져오기 완료');
    e.target.value = '';
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <a href="/api/export" className="btn-primary w-full">
        <Download size={16} /> JSON 내보내기
      </a>
      <button
        type="button"
        className="btn-secondary w-full"
        onClick={() => fileRef.current?.click()}
      >
        <Upload size={16} /> JSON 가져오기 (덮어쓰기)
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={onImport}
      />
      {msg && (
        <div className="rounded-xl border border-black/10 bg-black/5 px-3 py-2 text-sm">
          {msg}
        </div>
      )}
      {err && (
        <div className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      )}
      <div className="card text-xs text-black/50">
        데이터는 서버의 <code className="rounded bg-black/5 px-1">data/data.json</code>{' '}
        파일에 저장됩니다. 백업이 필요하면 수시로 내보내기를 받아두세요.
      </div>
    </div>
  );
}
