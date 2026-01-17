'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useI18n } from '@/i18n/I18nProvider';
import { Product } from '../../lib/db/types';
import ProductCard from './ProductCard';

interface ApiResponse {
  [key: string]: Product[];
}

export default function ProductsList() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();

  const categoryParam = searchParams.get('category') || 'All';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [materialFilter, setMaterialFilter] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Fetch produits
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data: ApiResponse = await response.json();

        // Tableau plat et trié par id
        let allProducts: Product[] = Object.values(data).flat() as Product[];
        allProducts.sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));

        // Filtrer par catégorie
        const filteredByCategory = categoryParam !== 'All'
          ? allProducts.filter(p => p.category === categoryParam)
          : allProducts;

        setProducts(filteredByCategory);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur inconnue est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryParam]);

  // Appliquer filtres matière, taille et tri prix
  const displayedProducts = products
    .filter(p => !materialFilter || p.material?.toLowerCase() === materialFilter.toLowerCase())
    .filter(p => !sizeFilter || p.size?.toLowerCase() === sizeFilter.toLowerCase())
    .sort((a, b) => {
      if (sortOrder === 'asc') return (a.price || 0) - (b.price || 0);
      return (b.price || 0) - (a.price || 0);
    });

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erreur: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[var(--gold)] text-black px-4 py-2 rounded hover:bg-[var(--gold-dark)]"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        Chargement des œuvres...
      </div>
    );
  }

  if (!displayedProducts.length) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p>Aucune œuvre ne correspond aux filtres sélectionnés.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* FILTRES */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        {/* Matériel */}
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

        {/* Grandeur */}
        <div>
          <label className="mr-2 font-semibold">Filtrer par grandeur:</label>
          <select
            value={sizeFilter}
            onChange={e => setSizeFilter(e.target.value)}
            className="border px-2 py-1"
          >
            <option value="">Toutes</option>
            <option value="Small">Petite</option>
            <option value="Medium">Moyenne</option>
            <option value="Large">Grande</option>
          </select>
        </div>

        {/* Tri prix */}
        <div>
          <label className="mr-2 font-semibold">Trier par prix:</label>
          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="border px-2 py-1"
          >
            <option value="asc">Croissant</option>
            <option value="desc">Décroissant</option>
          </select>
        </div>
      </div>

      {/* GRID DES PRODUITS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {displayedProducts.map(product => (
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