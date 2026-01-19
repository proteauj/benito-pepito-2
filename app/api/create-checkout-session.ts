import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { items } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    // Pour l'instant, on redirige vers un lien Square statique
    const squareUrl = 'https://square.link/u/J0elT0Hw';

    return NextResponse.json({ squareUrl });
  } catch (err: any) {
    console.error('Erreur create-checkout-session:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}