import { NextResponse } from 'next/server';
import { importAll } from '@/lib/db';
import type { DataFile } from '@/lib/types';

export async function POST(req: Request) {
  let payload: DataFile;
  try {
    payload = (await req.json()) as DataFile;
  } catch {
    return NextResponse.json({ error: 'JSON 파싱 실패' }, { status: 400 });
  }
  try {
    await importAll(payload);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Import 실패';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
