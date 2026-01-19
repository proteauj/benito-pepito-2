import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

async function getPrisma() {
  const { PrismaClient } = await import("@prisma/client");
  return new PrismaClient();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prisma = await getPrisma();

    const eventType = body.type; // ex: "payment.created"
    const payment = body.data?.object?.payment;

    if (!payment) return NextResponse.json({ ok: true });

    const orderId = payment.note || null; // On peut mettre orderId dans note si besoin
    const customerEmail = payment.customer_details?.email_address || "";
    const shippingAddress = payment.shipping_address || null;

    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          customerEmail,
          billingAddressId: shippingAddress ? undefined : null,
          shippingAddressId: shippingAddress ? undefined : null,
          status: "completed",
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
