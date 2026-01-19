// app/api/square/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // nécessaire pour Prisma et fetch

// Charger Prisma dynamiquement pour éviter l'erreur de build Turbopack
async function getPrisma() {
  const { PrismaClient } = await import("@prisma/client");
  return new PrismaClient();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items } = body; // [{ id, name, price, quantity }]

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    // Créer le lien de paiement Square
    const squareResponse = await fetch(
      "https://connect.squareup.com/v2/online-checkout/payment-links",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          idempotency_key: Date.now().toString(),
          order: {
            location_id: process.env.SQUARE_LOCATION_ID,
            line_items: items.map((item: any) => ({
              name: item.name,
              quantity: item.quantity.toString(),
              base_price_money: {
                amount: Math.round(item.price * 100),
                currency: "CAD",
              },
            })),
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
      return NextResponse.json(
        { error: "Failed to create Square checkout" },
        { status: 500 }
      );
    }

    // Prisma dynamiquement
    const prisma = await getPrisma();

    // Calcul du total
    const totalAmount = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    // Création de la commande dans la DB
    const order = await prisma.order.create({
      data: {
        stripeSessionId: "", // On peut renommer pour Square si besoin
        customerEmail: "", // sera mis à jour par webhook Square
        productIds: items.map((i: any) => i.id),
        totalAmount: Math.round(totalAmount),
        currency: "CAD",
        status: "pending",
      },
    });

    return NextResponse.json({
      squareUrl: data.payment_link.url,
      orderId: order.id,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}