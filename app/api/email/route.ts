// app/api/email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendOrderEmail } from '../../../lib/email';

export async function POST(req: NextRequest) {
  try {
    const { order, customer } = await req.json();
    await sendOrderEmail(order, customer);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('EMAIL ERROR', err);
    return NextResponse.json({ error: 'Erreur envoi email' }, { status: 500 });
  }
}