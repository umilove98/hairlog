import { NextResponse } from 'next/server';
import { createPerson, listPeople } from '@/lib/db';

export async function GET() {
  return NextResponse.json(await listPeople());
}

export async function POST(req: Request) {
  const body = (await req.json()) as { name?: string };
  if (!body?.name?.trim()) {
    return NextResponse.json({ error: '이름을 입력하세요' }, { status: 400 });
  }
  const person = await createPerson({ name: body.name });
  return NextResponse.json(person, { status: 201 });
}
