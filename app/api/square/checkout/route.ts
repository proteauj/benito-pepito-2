import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db/client";

export const dynamic = "force-dynamic"; // 👈 CRUCIAL
export const runtime = 'nodejs';

export async function POST(req: Request) {
  console.log("Process", process);
  console.log("process.env", process.env);
  console.log("=== ENV CHECK ===");
  console.log("DATABASE_URL:", process.env.benitoPepito_DATABASE_URL);
  console.log("SQUARE_ACCESS_TOKEN:", process.env.SQUARE_ACCESS_TOKEN);

  try {
    const body = await req.json();
    console.log("Request body:", body);

    const prisma = await getPrisma();
    const { productIds, totalAmount, currency } = body;

    if (!productIds || !Array.isArray(productIds) || !totalAmount) {
      return NextResponse.json(
        { error: "Missing productIds or totalAmount" },
        { status: 400 }
      );
    }

    console.log("ENV:", {
      DATABASE_URL: process.env.benitoPepito_DATABASE_URL,
      SQUARE_ACCESS_TOKEN: process.env.SQUARE_ACCESS_TOKEN
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