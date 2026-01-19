export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
let prisma: any = null;

try {
  const dbClientModule = require('../../../lib/db/client');
  prisma = dbClientModule.prisma;
} catch (error) {
  console.log('Prisma client not available');
}

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();
    if (!orderId) return NextResponse.json({ error: 'orderId is required' }, { status: 400 });

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'completed' } // paiement effectué
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Error marking order as completed:', error);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}
