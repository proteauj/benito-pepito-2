'use client';

import { products } from '../../data/products';
import ProductCard from '../../products/ProductCard';

interface ProductPageProps {
  params: { id: string };
}

export default async function ProductPage({ params }: ProductPageProps) {
  // si params est une Promise
  const resolvedParams = await params;
  console.log('ProductPage.products', products);
  
  // Recherche par slug ou par id pour plus de robustesse
  const product = products.filter(
    p => p.id === resolvedParams.id || p.id === resolvedParams.id
  )[0];

  console.log('ProductPage.params', resolvedParams);
  console.log('ProductPage.params.id', params.id);
  console.log('ProductPage.product', product);

  if (!product) return <p>Produit introuvable</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductCard product={product} />
      <div className="mt-4">
        <h2 className="text-lg font-semibold">Matériel</h2>
        <p>{product.materialFr}</p>
      </div>
      <div className="mt-2">
        <h2 className="text-lg font-semibold">Taille</h2>
        <p>{product.size}</p>
      </div>
      <div className="mt-2">
        <h2 className="text-lg font-semibold">Prix</h2>
        <p>{product.price} $</p>
      </div>
    </div>
  );
}