// app/api/square/webhook/route.ts
export const runtime = "nodejs"; // requis pour Prisma et crypto

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    // Lire le body brut pour vérifier la signature
    const bodyText = await req.text();
    const signature = req.headers.get("x-square-signature");

    if (!signature || !process.env.SQUARE_WEBHOOK_SIGNATURE_KEY) {
      console.warn("Missing signature or webhook key");
      return NextResponse.json({ error: "Webhook misconfigured" }, { status: 500 });
    }

    // Vérification HMAC SHA1
    const hmac = crypto
      .createHmac("sha1", process.env.SQUARE_WEBHOOK_SIGNATURE_KEY)
      .update(bodyText)
      .digest("base64");

    if (hmac !== signature) {
      console.warn("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Parser le body après validation
    const body = JSON.parse(bodyText);
    const payment = body?.data?.object?.payment;

    if (!payment) {
      return NextResponse.json({ error: "No payment data" }, { status: 400 });
    }

    // Calculer le total à partir des line_items
    const totalAmount =
      payment.line_items?.reduce(
        (sum: number, item: { base_price_money: { amount: number }; }) =>
          sum + (item.base_price_money?.amount || 0),
        0
      ) || payment.total_money?.amount || 0;

    // Créer la commande dans la DB
    const order = await prisma!.order.create({
      data: {
        squarePaymentId: payment.id,
        customerEmail: payment.customer_email || "",
        productIds: (payment.line_items || [])?.map((i: any) => i.name) || [],
        totalAmount: totalAmount * 100,
        currency: payment.total_money?.currency || "CAD",
        status: payment.status || "pending",
        shippingAddress: payment.shippingAddress,
        shippingMethod: payment.shippingMethod
      },
    });

    console.log("Order saved from Square webhook:", order.id);
    return NextResponse.json({ ok: true, orderId: order.id });
  } catch (err) {
    console.error("Square webhook error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}