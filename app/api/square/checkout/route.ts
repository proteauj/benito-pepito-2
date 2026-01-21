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

    if (!sourceId || !total) {
      return NextResponse.json({ error: 'Nonce ou total manquant' }, { status: 400 });
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
        amount: BigInt(total), // obligatoire
        currency: 'CAD',
      },
    });

    // Ne renvoyer que ce dont le front a besoin
    const payment = paymentResponse.payment;
    const safePayment = payment ? {
      id: payment.id,
      status: payment.status,
      amountMoney: {
        amount: payment.amountMoney?.amount?.toString(),
        currency: payment.amountMoney?.currency,
      },
      createdAt: payment.createdAt,
      cardDetails: payment.cardDetails ? {
        status: payment.cardDetails.status,
        card: {
          last4: payment.cardDetails.card?.last4,
          brand: payment.cardDetails.card?.cardBrand,
        }
      } : undefined,
    } : 0;

    return NextResponse.json({ payment: safePayment });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}