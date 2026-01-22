// app/api/square/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { SquareClient, SquareEnvironment } from 'square';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('CHECKOUT BODY', body);

    const { sourceId, total } = body;

    if (!sourceId || !total) {
      return NextResponse.json(
        { error: 'sourceId ou total manquant' },
        { status: 400 }
      );
    }

    const token = process.env.SQUARE_ACCESS_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: 'SQUARE_ACCESS_TOKEN manquant' },
        { status: 500 }
      );
    }

    const client = new SquareClient({
      token,
      environment:
        process.env.NODE_ENV === 'production'
          ? SquareEnvironment.Production
          : SquareEnvironment.Sandbox,
    });

    const paymentResponse = await client.payments.create({
      sourceId,
      idempotencyKey: crypto.randomUUID(),
      amountMoney: {
        amount: BigInt(total),
        currency: 'CAD',
      },
    });

    const payment = paymentResponse.payment;

    if (!payment || payment.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Paiement non complété' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
    });
  } catch (err: any) {
    console.error('CHECKOUT ERROR', err);
    return NextResponse.json(
      { error: err.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
