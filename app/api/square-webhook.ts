// app/api/square-webhook.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/db/client';

const SQUARE_WEBHOOK_SIGNATURE_KEY = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;

// Vérification HMAC-SHA1 de Square
function verifySquareWebhookSignature(
  body: string,
  signature: string,
  secret: string
) {
  const hmac = crypto.createHmac('sha1', secret);
  hmac.update(body);
  const hash = hmac.digest('base64');
  return hash === signature;
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-square-signature');

    if (!SQUARE_WEBHOOK_SIGNATURE_KEY || !signature) {
      return NextResponse.json(
        { error: 'Webhook signature missing' },
        { status: 400 }
      );
    }

    if (!verifySquareWebhookSignature(body, signature, SQUARE_WEBHOOK_SIGNATURE_KEY)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);

    // Gestion des événements "payment.created" ou "payment.updated"
    if (event.type === 'payment.created' || event.type === 'payment.updated') {
      const payment = event.data.object.payment;

      const email = payment.customer_details?.email_address || null;
      const shippingMethod = payment.shipping_method || null;
      const shippingAddress = payment.shipping_address
        ? JSON.stringify(payment.shipping_address)
        : null;

      // Transforme les items en productIds (tableau de strings)
      const productIds: string[] = (payment.order?.line_items || []).map(
        (item: any) => item.catalog_object_id || item.name || ''
      );

      // Sauvegarde dans la table order
      await prisma.order.create({
        data: {
          squarePaymentId: payment.id || '',
          totalAmount: payment.amount_money?.amount || 0,
          currency: payment.amount_money?.currency || 'CAD',
          status: payment.status || 'UNKNOWN',
          customerEmail: email,
          shippingAddress,
          shippingMethod,
          productIds,
        },
      });
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Erreur Square webhook:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}