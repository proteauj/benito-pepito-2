import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { SquareClient, SquareEnvironment } from "square";

const client = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN!,
  environment: SquareEnvironment.Production,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sourceId, total } = body;

    if (!sourceId || !total) {
      return NextResponse.json({ error: 'Nonce ou total manquant' }, { status: 400 });
    }

    const paymentResponse = await client.payments.create({
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
