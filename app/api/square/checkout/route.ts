import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { PaymentsClient } from 'square/api/resources/payments/client/Client';

const client = new PaymentsClient({
  token: process.env.SQUARE_ACCESS_TOKEN!,
  environment: "Environment.Production",
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sourceId, total } = body;

    if (!sourceId || !total) {
      return NextResponse.json({ error: 'Nonce ou total manquant' }, { status: 400 });
    }

    const paymentResponse = await client.create({
      sourceId,
      idempotencyKey: crypto.randomUUID(),
      amountMoney: {
        amount: total, // en cents
        currency: 'USD',
      },
    });

    return NextResponse.json({ payment: paymentResponse.payment });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
