import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db/client';

const SQUARE_WEBHOOK_SIGNATURE_KEY = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-square-signature');
    const prisma = await getPrisma();

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
      const billingAddress = payment.billing_address;
      const shippingAddress = payment.shipping_address;

      // Sauvegarde dans la table order
      await prisma.order.create({
        data: {
          squarePaymentId: '',
          totalAmount: payment.amount_money?.amount || 0,
          currency: payment.amount_money?.currency || 'CAD',
          status: payment.status,
          customerEmail: email,
          billingAddressId: billingAddress ? await saveAddress(billingAddress, 'billing') : null,
          shippingAddressId: shippingAddress ? await saveAddress(shippingAddress, 'shipping') : null,
        },
      });
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Erreur Square webhook:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Fonction utilitaire pour sauvegarder une adresse
async function saveAddress(addr: any, type: 'billing' | 'shipping') {
  const prisma = await getPrisma();
  if (!prisma) return null;

  const address = await prisma.customerAddress.create({
    data: {
      type,
      line1: addr.address_line_1 || '',
      line2: addr.address_line_2 || null,
      city: addr.locality || '',
      state: addr.administrative_district_level_1 || null,
      postalCode: addr.postal_code || '',
      country: addr.country || '',
    },
  });

  return address.id;
}

// Vérification signature HMAC-SHA1
import crypto from 'crypto';
function verifySquareWebhookSignature(body: string, signature: string, secret: string) {
  const hmac = crypto.createHmac('sha1', secret);
  hmac.update(body);
  const hash = hmac.digest('base64');
  return hash === signature;
}