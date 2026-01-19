// app/api/square/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/db/service';
import { prisma } from '@/lib/db/client';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface AddressInput {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, customerEmail, billingAddress, shippingAddress, squareCheckoutUrl } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    if (!customerEmail) {
      return NextResponse.json({ error: 'Customer email required' }, { status: 400 });
    }

    if (!squareCheckoutUrl) {
      return NextResponse.json({ error: 'Square checkout URL required' }, { status: 400 });
    }

    // --- 1️⃣ Créer les adresses ---
    let billingAddrId: string | null = null;
    let shippingAddrId: string | null = null;

    if (billingAddress) {
      const billing = await prisma.customerAddress.create({
        data: {
          type: 'billing',
          line1: billingAddress.line1,
          line2: billingAddress.line2 || null,
          city: billingAddress.city,
          state: billingAddress.state || null,
          postalCode: billingAddress.postalCode,
          country: billingAddress.country,
        },
      });
      billingAddrId = billing.id;
    }

    if (shippingAddress) {
      const shipping = await prisma.customerAddress.create({
        data: {
          type: 'shipping',
          line1: shippingAddress.line1,
          line2: shippingAddress.line2 || null,
          city: shippingAddress.city,
          state: shippingAddress.state || null,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country,
        },
      });
      shippingAddrId = shipping.id;
    }

    // --- 2️⃣ Créer la commande ---
    const totalAmount = items.reduce((sum: number, i: { price: number; quantity: number; }) => sum + i.price * i.quantity, 0);

    const order = await prisma.order.create({
      data: {
        customerEmail,
        productIds: items.map((i: { id: any; }) => i.id),
        totalAmount,
        currency: 'CAD',
        status: 'pending',
        billingAddressId: billingAddrId,
        shippingAddressId: shippingAddrId,
      },
    });

    // --- 3️⃣ Mettre à jour le stock ---
    items.forEach((item: { id: string; quantity: any; }) => {
      DatabaseService.updateProductStock(item.id, (item.quantity ?? 0) > 0);
    });

    // --- 4️⃣ Retourner le lien Square pour le paiement ---
    return NextResponse.json({
      orderId: order.id,
      checkoutUrl: squareCheckoutUrl,
      message: 'Order created, redirect user to Square checkout',
    });

  } catch (error: any) {
    console.error('Error creating Square order:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
