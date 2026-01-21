'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { products } from '../../data/products';
import ProductCard from '../../products/ProductCard';
import { useCart } from '../../contexts/CartContext';
import { getPrisma } from '@/lib/db/client';
import { ParamValue } from 'next/dist/server/request/params';

export default async function ProductPage() {
  const params = useParams();
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const prisma = await getPrisma();
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  });

  // Cherche le produit par ID
  const product = products.find((p: { id: ParamValue; }) => p.id === params.id);

  if (!product) return <p className="text-center py-8">Produit introuvable</p>;

  // Handler pour ajouter au panier
  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-4 py-8 stoneBg">
      
      {/* ProductCard avec image pleine et bandeau */}
      <div className="w-full max-w-3xl">
        <ProductCard
          key={product.id}
          product={product}
          useFullImg={true}    // Image grande
          expanded={true}   // Affiche titre, taille, prix et bouton
          onAddToCart={handleAddToCart}
          keepImgProportions={true}
          added={added}        // Pour changer la couleur du bouton si déjà ajouté
        />
      </div>
    </div>
  );
}
