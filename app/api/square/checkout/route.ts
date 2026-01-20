import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db/client";

export const dynamic = "force-dynamic"; // 👈 CRUCIAL

export async function POST(req: NextRequest) {
  try {
    const prisma = await getPrisma(); // 👈 ICI SEULEMENT

    const body = await req.json();
    const { productIds, totalAmount, currency } = body;

    if (!productIds || !Array.isArray(productIds) || !totalAmount) {
      return NextResponse.json(
        { error: "Missing productIds or totalAmount" },
        { status: 400 }
      );
    }

    console.log("ENV:", {
      DATABASE_URL: !!process.env.benitoPepito_DATABASE_URL,
      SQUARE_ACCESS_TOKEN: !!process.env.SQUARE_ACCESS_TOKEN
    });

    const order = await prisma.order.create({
      data: {
        productIds,
        totalAmount,
        currency: currency || "CAD",
        status: "pending",
        stripeSessionId: "", // ou null selon ton schema
        customerEmail: "",
      },
    });

    return NextResponse.json(order);
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}