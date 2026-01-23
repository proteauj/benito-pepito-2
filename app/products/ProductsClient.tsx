'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from './ProductCard';
import { products } from '../data/products';

export default function ProductsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get('category');

  const slugToCategory: Record<string, string> = {
    galerie: 'Painting',
    'maison-jardin': 'HomeGarden',
    sculpture: 'Sculpture',
    'impression-3d': '3DPrint',
  };

  const category = categorySlug
    ? slugToCategory[categorySlug.toLowerCase()]
    : null;

  const [materialFilter, setMaterialFilter] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredProducts = products
    .filter(p => !category || p.category === category)
    .filter(p => (materialFilter ? p.material?.toLowerCase() === materialFilter.toLowerCase() : true))
    .filter(p => (sizeFilter ? p.size?.toLowerCase() === sizeFilter.toLowerCase() : true))
    .sort((a, b) =>
      sortOrder === 'asc' ? (a.price || 0) - (b.price || 0) : (b.price || 0) - (a.price || 0)
    );

  if (!filteredProducts.length) {
    return <p className="text-center py-12">Aucun produit disponible</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Filtres */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div>
          <label className="mr-2 font-semibold">Filtrer par matière:</label>
          <select
            value={materialFilter}
            onChange={e => setMaterialFilter(e.target.value)}
            className="border px-2 py-1"
          >
            <option value="">Tous</option>
            <option value="Marble">Marbre</option>
            <option value="Bronze">Bronze</option>
            <option value="Rocks">Roches</option>
            <option value="Metal">Métal</option>
            <option value="Moss">Mousse</option>
            <option value="Wood">Bois</option>
            <option value="False Weed">Fausses herbes</option>
            <option value="Acrylic on Canvas">Acrylique sur toile</option>
            <option value="Oil on Canvas">Huile sur toile</option>
            <option value="Acrylic on Wood">Acrylique sur bois</option>
          </select>
        </div>

        <div>
          <label className="mr-2 font-semibold">Filtrer par grandeur:</label>
          <select
            value={sizeFilter}
            onChange={e => setSizeFilter(e.target.value)}
            className="border px-2 py-1"
          >
            <option value="">Toutes</option>
            <option value="XS">XS</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
            <option value="XXL">XXL</option>
          </select>
        </div>

        <div>
          <label className="mr-2 font-semibold">Trier par prix:</label>
          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value as 'desc' | 'asc')}
            className="border px-2 py-1"
          >
            <option value="desc">Prix décroissant</option>
            <option value="asc">Prix croissant</option>
          </select>
        </div>
      </div>

      {/* Titre */}
      <h1 className="text-3xl font-bold mb-8">
        {categorySlug ? categorySlug.replace(/-/g, ' ') : 'Tous les produits'}
      </h1>

      {/* Grille des produits */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={() => router.push(`/product/${product.id}`)}
            useFullImg={false}
            expanded={false}
            keepImgProportions={true}
          />
        ))}
      </div>
    </div>
  );
}
