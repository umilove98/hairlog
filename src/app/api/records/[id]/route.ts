import { NextResponse } from 'next/server';
import { deleteRecord, getRecord, updateRecord } from '@/lib/db';
import type { RecordItem } from '@/lib/types';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const record = await getRecord(id);
  if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(record);
}

interface PutBody {
  personId?: string;
  date?: string;
  items?: RecordItem[];
  memo?: string;
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await req.json()) as PutBody;
  if (body.date && !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
    return NextResponse.json({ error: '날짜 형식 오류' }, { status: 400 });
  }
  if (body.items && body.items.length === 0) {
    return NextResponse.json({ error: '시술을 1개 이상 남겨두세요' }, { status: 400 });
  }
  const updated = await updateRecord(id, body);
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await deleteRecord(id);
  return NextResponse.json({ ok: true });
}
