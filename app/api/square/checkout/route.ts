import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from '@/lib/db/client';
import { SquareClient, SquareEnvironment } from 'square';
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items = body.items;
    
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    const totalAmount = items.reduce(
      (sum: number, it: any) => sum + it.price * it.quantity,
      0
    );

    const prisma = (await import("@/lib/prisma")).default;

    const square = new SquareClient({
      environment: SquareEnvironment.Production,
      token: process.env.SQUARE_ACCESS_TOKEN!,
    });

    const paymentResponse = await square.payments.create({
      idempotencyKey: crypto.randomUUID(),
      sourceId: body.sourceId || 'cnon:card-nonce-ok', // nonce de test
      amountMoney: {
        amount: BigInt(Math.round(totalAmount * 100)),
        currency: 'CAD',
      },
      locationId: process.env.SQUARE_LOCATION_ID!,
      autocomplete: true,
      customerId: body.customerId,
      referenceId: body.referenceId || '',
      note: body.note || 'Order payment',
    });

    const payment = paymentResponse.payment;
    
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

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
