import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';

// Try to import database services
let DatabaseService: any = null;

try {
  const dbModule = require('../../../lib/db/service');
  DatabaseService = dbModule.DatabaseService;
} catch {
  console.log('DatabaseService not available');
}

// GET – récupérer une commande par ID
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('order_id');

  if (!orderId) {
    return NextResponse.json({ error: 'order_id is required' }, { status: 400 });
  }

  if (!DatabaseService) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 });
  }

  const order = await DatabaseService.getOrderById(orderId);

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json(order);
}

// POST – créer une commande AVANT paiement
export async function POST(request: NextRequest) {
  if (!DatabaseService) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 });
  }

  const body = await request.json();
  const { productIds, totalAmount, currency } = body;

  if (!productIds || !Array.isArray(productIds) || !totalAmount) {
    return NextResponse.json(
      { error: 'Missing productIds or totalAmount' },
      { status: 400 }
    );
  }

  const order = await DatabaseService.createOrder({
    productIds,
    totalAmount,
    currency: currency || 'CAD',
    status: 'pending',
  });

  return NextResponse.json(order);
}

// PUT – marquer comme payé (manuel)
export async function PUT(request: NextRequest) {
  if (!DatabaseService) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 });
  }

  const body = await request.json();
  const { orderId, status } = body;

  if (!orderId || !status) {
    return NextResponse.json(
      { error: 'orderId and status required' },
      { status: 400 }
    );
  }

  const order = await DatabaseService.updateOrderStatusById(orderId, status);

  return NextResponse.json(order);
}