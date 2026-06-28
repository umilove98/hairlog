import { NextResponse } from 'next/server';
import { AUTH_COOKIE, AUTH_MAX_AGE, authToken } from '@/lib/auth';

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { password?: string } | null;
  const expected = process.env.APP_PASSWORD;

  if (!expected || body?.password !== expected) {
    return NextResponse.json(
      { error: '비밀번호가 올바르지 않습니다' },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, await authToken(expected), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: AUTH_MAX_AGE,
  });
  return res;
}
