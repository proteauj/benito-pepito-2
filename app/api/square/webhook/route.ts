// app/api/square/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

export const runtime = 'nodejs'; // nécessaire pour @prisma/client et fetch

const prisma = new PrismaClient();

// Fonction pour vérifier la signature du webhook Square
function verifySquareSignature(signature: string | null, body: string) {
  if (!signature) return false;
  const key = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  if (!key) throw new Error('SQUARE_WEBHOOK_SIGNATURE_KEY not set');

  const hmac = crypto.createHmac('sha1', key);
  hmac.update(body);
  const hash = hmac.digest('base64');

  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
}

export async function POST(req: NextRequest) {
  const bodyText = await req.text();
  const signature = req.headers.get('x-square-signature');

  if (!verifySquareSignature(signature, bodyText)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const body = JSON.parse(bodyText);

  try {
    // Exemple pour un paiement réussi
    if (body.type === 'payment.updated' && body.data?.object?.payment?.status === 'COMPLETED') {
      const payment = body.data.object.payment;

      // Récupérer infos utiles
      const customerEmail = payment.customer_details?.email_address || null;
      const billingAddress = payment.customer_details?.address || null;
      const shippingAddress = payment.order?.fulfillments?.[0]?.shipment_details?.recipient || null;
      const totalAmount = payment.amount_money?.amount || 0;
      const currency = payment.amount_money?.currency || 'CAD';
      const productIds: string[] = payment.order?.line_items?.map((li: any) => li.catalog_object_id) || [];

      // Créer ou mettre à jour la commande
      const order = await prisma.order.upsert({
        where: { squarePaymentId: payment.id },
        update: {
          customerEmail,
          totalAmount,
          currency,
          status: 'completed',
          productIds,
        },
        create: {
          squarePaymentId: payment.id,
          customerEmail,
          totalAmount,
          currency,
          status: 'completed',
          productIds,
        },
      });

      // Sauvegarder les adresses si présentes
      if (billingAddress) {
        const billingAddr = await prisma.customerAddress.create({
          data: {
            type: 'billing',
            line1: billingAddress.address_line_1 || '',
            line2: billingAddress.address_line_2 || null,
            city: billingAddress.locality || '',
            state: billingAddress.administrative_district_level_1 || null,
            postalCode: billingAddress.postal_code || '',
            country: billingAddress.country || '',
            orderId: order.id,
          },
        });
      }

      if (shippingAddress) {
        const shippingAddr = await prisma.customerAddress.create({
          data: {
            type: 'shipping',
            line1: shippingAddress.address_line_1 || '',
            line2: shippingAddress.address_line_2 || null,
            city: shippingAddress.locality || '',
            state: shippingAddress.administrative_district_level_1 || null,
            postalCode: shippingAddress.postal_code || '',
            country: shippingAddress.country || '',
            orderId: order.id,
          },
        });
      }

      return NextResponse.json({ success: true });
    }

    // Si événement non traité
    return NextResponse.json({ success: true, message: 'Event ignored' });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
