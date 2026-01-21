// app/api/square/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { SquareClient, SquareEnvironment } from 'square';
import { DatabaseService } from '../../../../lib/db/service';

export async function POST(req: NextRequest) {
  try {
    const { sourceId, total, items, customerEmail } = await req.json();

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

    if (!payment || payment.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Paiement non complété' },
        { status: 400 }
      );
    }

    const safePayment = {
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
    };

    // 2️⃣ Créer la commande en DB
    await DatabaseService.createOrder({
      squarePaymentId: payment.id!,
      customerEmail: customerEmail ?? null,
      productIds: items.map((i: any) => i.id),
      totalAmount: Number(total),
      currency: 'CAD',
      status: 'completed',
    });

    // 3️⃣ Marquer les produits comme vendus
    await DatabaseService.markProductAsSold(
      items.map((i: any) => i.id)
    );

    // 4️⃣ Réponse SAFE (pas de BigInt)
    return NextResponse.json({payment: safePayment});
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}