'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import ProductCard from './ProductCard';
import { products } from '../data/products';
import { Product } from '../../lib/db/types';

export default function ProductsPage() {
  const router = useRouter();

  const [materialFilter, setMaterialFilter] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filtrage et tri en mémoire, pas d'appel API
  const filteredProducts = useMemo(() => {
    let result = products;

    if (materialFilter) {
      result = result.filter(
        p => p.material?.toLowerCase() === materialFilter.toLowerCase()
      );
    }

    if (sizeFilter) {
      result = result.filter(
        p => p.size?.toLowerCase() === sizeFilter.toLowerCase()
      );
    }

    return result.sort((a, b) =>
      sortOrder === 'asc' ? (a.price || 0) - (b.price || 0) : (b.price || 0) - (a.price || 0)
    );
  }, [materialFilter, sizeFilter, sortOrder]);

  if (!filteredProducts.length) return <p>Aucun produit disponible</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* FILTRES */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div>
          <label className="mr-2 font-semibold">Matériel:</label>
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
          <label className="mr-2 font-semibold">Taille:</label>
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
            onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="border px-2 py-1"
          >
            <option value="asc">Prix croissant</option>
            <option value="desc">Prix décroissant</option>
          </select>
        </div>
      </div>

      {/* GRID Desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={() => router.push(`/product/${product.id}`)}
          />
        ))}
      </div>
    </div>
  );
}