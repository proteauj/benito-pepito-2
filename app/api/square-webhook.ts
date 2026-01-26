// app/api/square-webhook.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import crypto from 'crypto';

const SQUARE_WEBHOOK_SIGNATURE_KEY = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;

// Vérification HMAC-SHA1 de Square
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

    if (!SQUARE_WEBHOOK_SIGNATURE_KEY || !signature) {
      return NextResponse.json({ error: 'Webhook signature missing' }, { status: 400 });
    }

    if (!verifySquareWebhookSignature(body, signature, SQUARE_WEBHOOK_SIGNATURE_KEY)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);

    // Gestion des événements "payment.created" ou "payment.updated"
    if (event.type === 'payment.created' || event.type === 'payment.updated') {
      const payment = event.data.object.payment;

      // Extraire les infos importantes
      const email = payment.customer_details?.email_address || '';
      const shippingMethod = payment.shipping_method || null;
      const shippingAddress = payment.shipping_address || null;
      const items = payment.order_items || null;       // Articles commandés
      const metadata = payment.metadata || null;       // Metadata Square

      // Récupérer les IDs des produits depuis le paiement (à adapter selon ton payload)
      const productIds: string[] = items?.map((item: any) => item.id) || [];

      await prisma.order.create({
        data: {
          squarePaymentId: payment.id || '',
          totalAmount: payment.amount_money?.amount
            ? payment.amount_money.amount // si amount est en cents
            : 0,
          currency: payment.amount_money?.currency || 'CAD',
          status: payment.status || 'UNKNOWN',
          customerEmail: email,
          shippingAddress: shippingAddress ? JSON.stringify(shippingAddress) : null,
          shippingMethod,
          productIds, // ✅ ici le tableau de chaînes
        },
      });


      console.log('Commande sauvegardée Square webhook:', payment.id);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Erreur Square webhook:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}