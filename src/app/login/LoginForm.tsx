'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (!res.ok) {
      setError('비밀번호가 올바르지 않습니다');
      return;
    }
    const from = params.get('from');
    router.replace(from && from.startsWith('/') ? from : '/');
    router.refresh();
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center">
      <form onSubmit={submit} className="card w-full max-w-xs space-y-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">hairlog</h1>
          <p className="mt-1 text-sm text-black/60">비밀번호를 입력하세요</p>
        </div>

        {/* 비밀번호 관리자 저장을 돕기 위한 숨은 사용자명 */}
        <input
          type="text"
          name="username"
          autoComplete="username"
          value="hairlog"
          readOnly
          hidden
        />
        <div>
          <label className="label">비밀번호</label>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="btn-primary w-full"
          disabled={busy || !password}
        >
          {busy ? '확인 중…' : '로그인'}
        </button>
      </form>
    </div>
  );
}
