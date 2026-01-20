import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db/client";

export const dynamic = "force-dynamic"; // 👈 CRUCIAL
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    console.log('🟡 /api/square/checkout called');

    const body = await req.json();
    console.log('🟡 Body received:', body);

    console.log('🟡 ENV check:', {
      DATABASE_URL: !!process.env.DATABASE_URL,
      SQUARE_ACCESS_TOKEN: !!process.env.SQUARE_ACCESS_TOKEN,
    });

    console.log("Request body:", body);

    const prisma = await getPrisma();
    const { productIds, totalAmount, currency } = body;

    if (!productIds || !Array.isArray(productIds) || !totalAmount) {
      return NextResponse.json(
        { error: "Missing productIds or totalAmount" },
        { status: 400 }
      );
    }

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
   } catch (err: any) {
    console.error('🔴 Square checkout error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}