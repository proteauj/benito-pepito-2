'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { products } from '../../data/products';
import ProductCard from '../../products/ProductCard';
import { useCart } from '../../contexts/CartContext';

export default function ProductPage() {
  const params = useParams();
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  // Cherche le produit par ID
  const product = products.find((p) => p.id === params.id);

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
