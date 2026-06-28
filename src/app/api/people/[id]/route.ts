import { NextResponse } from 'next/server';
import { deletePerson, updatePerson } from '@/lib/db';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await req.json()) as { name?: string };
  if (!body?.name?.trim()) {
    return NextResponse.json({ error: '이름을 입력하세요' }, { status: 400 });
  }
  const updated = await updatePerson(id, { name: body.name.trim() });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await deletePerson(id);
  return NextResponse.json({ ok: true });
}
