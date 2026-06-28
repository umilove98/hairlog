import { NextResponse } from 'next/server';
import { createTreatmentType, listTreatmentTypes } from '@/lib/db';
import type { Category } from '@/lib/types';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const includeArchived = url.searchParams.get('includeArchived') === '1';
  return NextResponse.json(await listTreatmentTypes({ includeArchived }));
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    name?: string;
    category?: Category;
    defaultUnit?: string;
  };
  if (!body?.name?.trim()) {
    return NextResponse.json({ error: '시술명을 입력하세요' }, { status: 400 });
  }
  if (body.category !== 'hair' && body.category !== 'skin') {
    return NextResponse.json({ error: '분류를 선택하세요' }, { status: 400 });
  }
  const t = await createTreatmentType({
    name: body.name,
    category: body.category,
    defaultUnit: body.defaultUnit,
  });
  return NextResponse.json(t, { status: 201 });
}
