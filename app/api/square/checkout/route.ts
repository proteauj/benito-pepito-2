import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db/client';
import { SquareClient } from 'square';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const prisma = await getPrisma();
    const body = await req.json();
    const items = body.items;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    const totalAmount = items.reduce(
      (sum: number, it: any) => sum + it.price * it.quantity,
      0
    );

    const squareClient = new SquareClient({
      environment:
        process.env.SQUARE_ENVIRONMENT === 'production' ? 'Production' : 'Sandbox',
        token: process.env.SQUARE_ACCESS_TOKEN,
    });

    // Crée un paiement Square
    const paymentResponse = await squareClient.payments.create({
      idempotencyKey: crypto.randomUUID(),
      sourceId: body.sourceId || 'cnon:card-nonce-ok', // nonce de test
      amountMoney: {
        amount: totalAmount,
        currency: 'CAD',
      },
      locationId: process.env.SQUARE_LOCATION_ID!,
      autocomplete: true,
      customerId: body.customerId,
      referenceId: body.referenceId || '',
      note: body.note || 'Order payment',
    });

    const payment = paymentResponse.payment;

    // Sauvegarde la commande dans Prisma
    await prisma.order.create({
      data: {
        productIds: items.map((it: any) => it.id),
        totalAmount,
        currency: 'CAD',
        status: payment?.status === 'COMPLETED' ? 'completed' : 'pending',
        squarePaymentId: payment?.id || '',
        customerEmail: body.customerEmail || '',
      },
    });

    return NextResponse.json({ payment });
  } catch (err: any) {
    console.error('❌ Checkout error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
