import { NextResponse } from 'next/server';
import { createRecord, listRecords } from '@/lib/db';
import type { Category, RecordItem } from '@/lib/types';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const personId = url.searchParams.get('personId') ?? undefined;
  const categoryParam = url.searchParams.get('category');
  const category =
    categoryParam === 'hair' || categoryParam === 'skin'
      ? (categoryParam as Category)
      : undefined;
  const from = url.searchParams.get('from') ?? undefined;
  const to = url.searchParams.get('to') ?? undefined;
  const records = await listRecords({ personId, category, from, to });
  return NextResponse.json(records);
}

interface CreateRecordBody {
  personId?: string;
  date?: string;
  items?: RecordItem[];
  memo?: string;
}

export async function POST(req: Request) {
  const body = (await req.json()) as CreateRecordBody;
  if (!body.personId) {
    return NextResponse.json({ error: '멤버를 선택하세요' }, { status: 400 });
  }
  if (!body.date || !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
    return NextResponse.json({ error: '날짜 형식 오류' }, { status: 400 });
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: '시술을 1개 이상 추가하세요' }, { status: 400 });
  }
  const record = await createRecord({
    personId: body.personId,
    date: body.date,
    items: body.items,
    memo: body.memo,
  });
  return NextResponse.json(record, { status: 201 });
}
