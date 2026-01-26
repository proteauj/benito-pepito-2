import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client'

const SQUARE_WEBHOOK_SIGNATURE_KEY = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-square-signature');

    // Vérifier la signature (Square recommande HMAC-SHA1)
    if (!SQUARE_WEBHOOK_SIGNATURE_KEY || !signature) {
      return NextResponse.json({ error: 'Webhook signature missing' }, { status: 400 });
    }

    const valid = verifySquareWebhookSignature(body, signature, SQUARE_WEBHOOK_SIGNATURE_KEY);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);

    // Exemple : Square Event type "payment.created" ou "payment.updated"
    if (event.type === 'payment.created' || event.type === 'payment.updated') {
      const payment = event.data.object.payment;

      // Email et adresses
      const email = payment.customer_details?.email_address || '';
      const shippingMethod = payment.shippingMethod
      const shippingAddress = payment.shippingAddress;

      // Sauvegarde dans la table order
      await prisma!.order.create({
        data: {
          squarePaymentId: '',
          totalAmount: payment.amount_money?.amount || 0,
          currency: payment.amount_money?.currency || 'CAD',
          status: payment.status,
          customerEmail: email,
          shippingAddress: shippingAddress ? JSON.stringify(shippingAddress) : null,
          shippingMethod: shippingMethod ? shippingMethod : null
        }
      });
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Erreur Square webhook:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Vérification signature HMAC-SHA1
import crypto from 'crypto';
function verifySquareWebhookSignature(body: string, signature: string, secret: string) {
  const hmac = crypto.createHmac('sha1', secret);
  hmac.update(body);
  const hash = hmac.digest('base64');
  return hash === signature;
}