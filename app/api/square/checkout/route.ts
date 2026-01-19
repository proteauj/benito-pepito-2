// app/api/square/checkout/route.ts
export const runtime = "nodejs"; // requis pour Prisma et fetch

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items } = body; // [{ id, titleFr, price, quantity }]

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    // Préparer les line_items pour Square
    const line_items = items.map(it => ({
      quantity: Math.max(1, Number(it.quantity) || 1),
      base_price_money: {
        amount: Math.round(Number(it.price) * 100), // prix en cents
        currency: "CAD",
      },
      name: it.titleFr,
    }));

    // Calculer totalAmount côté serveur
    const totalAmount = line_items.reduce(
      (sum, item) =>
        sum + (item.base_price_money.amount || 0) * (item.quantity || 1),
      0
    );

    // Créer le lien de paiement Square
    const squareResponse = await fetch(
      "https://connect.squareup.com/v2/online-checkout/payment-links",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          idempotency_key: Date.now().toString(),
          order: {
            location_id: process.env.SQUARE_LOCATION_ID,
            line_items,
          },
          checkout_options: {
            redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
            ask_for_shipping_address: true,
          },
        }),
      }
    );

    const data = await squareResponse.json();
    if (!squareResponse.ok || !data.payment_link) {
      console.error("Square error:", data);
      return NextResponse.json({ error: "Failed to create Square checkout" }, { status: 500 });
    }

    // Créer la commande dans la DB
    const order = await prisma.order.create({
      data: {
        stripeSessionId: "", // peut être vide ou renommé pour Square
        customerEmail: "", // mis à jour via webhook si Square le fournit
        productIds: items.map(i => i.id),
        totalAmount,
        currency: "CAD",
        status: "pending",
      },
    });

    return NextResponse.json({
      squareUrl: data.payment_link.url,
      orderId: order.id,
      totalAmount,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}