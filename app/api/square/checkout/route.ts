// app/api/square/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { SquareClient, SquareEnvironment } from 'square';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sourceId, total } = body;

    const token = process.env.SQUARE_ACCESS_TOKEN;
    if (!token) return NextResponse.json({ error: 'SQUARE_ACCESS_TOKEN manquante' }, { status: 500 });

    const client = new SquareClient({
      token,
      environment: process.env.NODE_ENV === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
    });

    const paymentResponse = await client.payments.create({
      sourceId,
      idempotencyKey: crypto.randomUUID(),
      amountMoney: {
        amount: BigInt(total),
        currency: 'CAD',
      },
    });

    return NextResponse.json({ payment: paymentResponse.payment });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}