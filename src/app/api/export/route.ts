import { NextResponse } from 'next/server';
import { exportAll } from '@/lib/db';

export async function GET() {
  const data = await exportAll();
  const json = JSON.stringify(data, null, 2);
  return new NextResponse(json, {
    headers: {
      'content-type': 'application/json',
      'content-disposition': `attachment; filename="hairlog-${new Date()
        .toISOString()
        .slice(0, 10)}.json"`,
    },
  });
}
