// app/api/square/checkout/route.ts
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { items } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    // Ici tu mets ton lien Square (Online Checkout)
    const squareCheckoutLink = 'https://square.link/u/J0elT0Hw';

    // Si tu veux, tu peux ajouter query params pour le panier
    const params = new URLSearchParams();
    params.append('items', JSON.stringify(items));
    const urlWithParams = `${squareCheckoutLink}?${params.toString()}`;

    return NextResponse.json({ squareUrl: urlWithParams });
  } catch (error: any) {
    console.error('Error creating Square checkout:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}