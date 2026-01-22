import { NextRequest, NextResponse } from 'next/server';
import { products } from '@/data/products';
import { Product } from '../../../lib/db/types';
export const runtime = 'nodejs';

let DatabaseService: any = null;
try {
  // Try to import DatabaseService - will fail in environments without database
  DatabaseService = require('../../../lib/db/service').DatabaseService;
} catch (error) {
  // Database not available - use default values
  console.log('Database not available, using default stock values');
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');

  if (id) {
    // Chercher le produit dans les données statiques
    const product = products.find(p => p.id === id);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    let inStock = product.inStock; // fallback

    try {
      if (DatabaseService) {
        inStock = await DatabaseService.getProductStock(product.id);
      }
    } catch (err) {
      console.warn('Stock fallback to product data');
    }

    return NextResponse.json({
      ...product,
      inStock,
    });
  }
  return NextResponse.json(products);
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { productIds, inStock } = body;

    if (!Array.isArray(productIds)) {
      return NextResponse.json({ error: 'productIds must be an array' }, { status: 400 });
    }

    // Update products stock status in database if available
    if (DatabaseService) {
      try {
        await DatabaseService.updateMultipleProductStock(productIds, inStock);
      } catch (error) {
        console.error('Database error updating stock:', error);
        return NextResponse.json({ error: 'Failed to update products in database' }, { status: 500 });
      }
    } else {
      console.log('Database not available, stock update skipped');
    }

    console.log(`Updated ${productIds.length} products to inStock: ${inStock}`);

    return NextResponse.json({
      success: true,
      updatedProducts: productIds.length,
      message: `Products marked as ${inStock ? 'available' : 'sold'}`
    });
  } catch (error) {
    console.error('Error updating products:', error);
    return NextResponse.json({ error: 'Failed to update products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!DatabaseService) {
    return NextResponse.json(
      { error: 'Database not available' },
      { status: 500 }
    );
  }

  const { productIds } = await req.json();

  if (!Array.isArray(productIds) || productIds.length === 0) {
    return NextResponse.json({ error: 'No product IDs provided' }, { status: 400 });
  }

  try {
    for (const id of productIds) {
      await DatabaseService.markProductAsSold(id);
    }

    return NextResponse.json({
      message: 'Products marked as sold',
      productIds,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to mark products as sold', details: String(error) },
      { status: 500 }
    );
  }
}

