// app/api/square-webhook.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import crypto from 'crypto';

const SQUARE_WEBHOOK_SIGNATURE_KEY = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;

/**
 * Vérification HMAC-SHA1 de la signature Square
 */
function verifySquareWebhookSignature(body: string, signature: string, secret: string) {
  const hmac = crypto.createHmac('sha1', secret);
  hmac.update(body);
  const hash = hmac.digest('base64');
  return hash === signature;
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-square-signature');

    // Vérifier signature
    if (!SQUARE_WEBHOOK_SIGNATURE_KEY || !signature) {
      return NextResponse.json({ error: 'Webhook signature missing' }, { status: 400 });
    }

    if (!verifySquareWebhookSignature(body, signature, SQUARE_WEBHOOK_SIGNATURE_KEY)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);

    // Square Event type "payment.created" ou "payment.updated"
    if (event.type === 'payment.created' || event.type === 'payment.updated') {
      const payment = event.data.object.payment;

      const email = payment.customer_details?.email_address || '';
      const shippingMethod = payment.shipping_method || null;
      const shippingAddress = payment.shipping_address || null;

      // ⚠️ Prisma n'est pas initialisé pendant le build
      if (!prisma || !prisma.order) {
        console.warn('Prisma non initialisé. Ignoring webhook.');
        return NextResponse.json({ received: true });
      }

      // Sauvegarde dans la table order
      await prisma.order.create({
        data: {
          squarePaymentId: payment.id || '',
          totalAmount: payment.amount_money?.amount || 0,
          currency: payment.amount_money?.currency || 'CAD',
          status: payment.status || 'UNKNOWN',
          customerEmail: email,
          shippingAddress: shippingAddress ? JSON.stringify(shippingAddress) : null,
          shippingMethod: shippingMethod || null,
        },
      });
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Erreur Square webhook:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}