'use client';

import { products } from '../../data/products';
import { useParams } from 'next/navigation';
import ProductCard from '../../products/ProductCard';
import { Product } from '@/lib/db/types';
import { useState } from 'react';
import { useCart } from '@/app/contexts/CartContext';

export default function ProductPage() {
  const params = useParams(); // id du produit depuis l'URL
  const product = products.find(p => p.id === params.id);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setAdded(true);
  };

  if (!product) return <p className="text-center py-8">Produit introuvable</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="container mx-auto px-4 py-8 relative z-10">
        <ProductCard
          product={product}
          expanded={true}
          useFullImg={true}
          onAddToCart={handleAddToCart} // la fonction qui ajoute au panier
          added={added}                 // true si déjà ajouté
        />
      </div>
    </div>
  );
}