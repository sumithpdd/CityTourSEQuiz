import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.error('[ClientError]', {
      ...body,
      receivedAt: new Date().toISOString(),
      ip: req.headers.get('x-forwarded-for') ?? 'unknown',
      userAgent: req.headers.get('user-agent') ?? 'unknown',
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[ClientError] Failed to handle log payload', error);
    return NextResponse.json({ ok: false, error: 'Invalid log payload' }, { status: 400 });
  }
}


