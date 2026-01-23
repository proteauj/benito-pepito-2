// app/api/square/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { SquareClient, SquareEnvironment, Country } from 'square';
import { DatabaseService } from '../../../../lib/db/service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sourceId,
      total,
      items,
      customerEmail,
      shippingMethod,
      shippingAddress
    } = body;

    if (!sourceId || !total) {
      return NextResponse.json(
        { error: 'sourceId ou total manquant' },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Aucun item à traiter' },
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

    /* ------------------------------
       🟨 Mapping shipping vers Square
    ------------------------------ */
    const squareShippingAddress =
      shippingMethod === 'shipping' && shippingAddress
        ? {
            addressLine1: shippingAddress.street,
            locality: shippingAddress.city,
            administrativeDistrictLevel1: shippingAddress.province,
            postalCode: shippingAddress.postalCode,
            country: Country.Ca, // ✅ enum Square
          }
        : undefined;

    /* ------------------------------
       🟩 Création paiement Square
    ------------------------------ */
    const paymentResponse = await client.payments.create({
      sourceId,
      idempotencyKey: crypto.randomUUID(),
      amountMoney: {
        amount: BigInt(total),
        currency: 'CAD',
      },

      buyerEmailAddress: customerEmail ?? undefined,
      shippingAddress: squareShippingAddress,

      // On stocke le shippingMethod + address pour le webhook
      note: JSON.stringify({
        shippingMethod,
        shippingAddress,
      }),
    });

    const payment = paymentResponse.payment;

    if (!payment || payment.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Paiement non complété' },
        { status: 400 }
      );
    }

    /* ------------------------------
       🟦 Mise à jour stock
    ------------------------------ */
    for (const item of items) {
      console.log('mark as sold: ', item);
      await DatabaseService.markProductAsSold(item.id);
    }

    /* ------------------------------
       🟪 Création commande DB
    ------------------------------ */
    await DatabaseService.createOrder({
      squarePaymentId: payment.id!,
      customerEmail: customerEmail ?? null,
      productIds: (items || [])?.map((i: any) => i.id),
      totalAmount: Number(total),
      currency: 'CAD',
      status: 'completed',

      // Données internes (PAS Square)
      shippingMethod,
      shippingAddress,
    });

    /* ------------------------------
       ✅ Réponse client
    ------------------------------ */
    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amountMoney?.amount?.toString(),
        currency: payment.amountMoney?.currency,
      },
    });
  } catch (err: any) {
    console.error('CHECKOUT ERROR', err);
    return NextResponse.json(
      { error: err.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}