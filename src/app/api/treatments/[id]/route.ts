import { NextResponse } from 'next/server';
import { deleteTreatmentType, updateTreatmentType } from '@/lib/db';
import type { Category } from '@/lib/types';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await req.json()) as {
    name?: string;
    category?: Category;
    defaultUnit?: string;
    archived?: boolean;
  };
  const patch: Record<string, unknown> = {};
  if (typeof body.name === 'string') patch.name = body.name.trim();
  if (body.category === 'hair' || body.category === 'skin') {
    patch.category = body.category;
  }
  if (typeof body.defaultUnit === 'string') {
    patch.defaultUnit = body.defaultUnit.trim() || undefined;
  }
  if (typeof body.archived === 'boolean') patch.archived = body.archived;
  const updated = await updateTreatmentType(id, patch);
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await deleteTreatmentType(id);
  return NextResponse.json({ ok: true });
}
