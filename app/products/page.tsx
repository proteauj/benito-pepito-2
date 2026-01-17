'use client';

import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useRouter } from 'next/navigation';
import 'swiper/css';
import ProductCard from './ProductCard';
import { Product } from '../../lib/db/types';
import { useI18n } from '../i18n/I18nProvider';

export default function ProductsPage() {
  const { t } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtres et tri
  const [materialFilter, setMaterialFilter] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const router = useRouter();

  // Fetch produits
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then((data) => {
        const flatProducts = Object.values(data).flat() as Product[];
        setProducts(flatProducts);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Chargement des produits...</p>;
  if (!products.length) return <p>Aucun produit disponible</p>;

  // Appliquer les filtres
  let filteredProducts = products;

  if (materialFilter) {
    filteredProducts = filteredProducts.filter(
      (p) => p.material?.toLowerCase() === materialFilter.toLowerCase()
    );
  }

  if (sizeFilter) {
    filteredProducts = filteredProducts.filter(
      (p) => p.size?.toLowerCase() === sizeFilter.toLowerCase()
    );
  }

  // Appliquer le tri
  filteredProducts.sort((a, b) => {
    if (sortOrder === 'asc') return (a.price || 0) - (b.price || 0);
    return (b.price || 0) - (a.price || 0);
  });

  if (!filteredProducts.length)
    return <p>Aucun produit ne correspond aux filtres sélectionnés</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* FILTRES */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        {/* Matériel */}
        <div>
          <label className="mr-2 font-semibold">Filtrer par matière:</label>
          <select
            value={materialFilter}
            onChange={(e) => setMaterialFilter(e.target.value)}
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

        {/* Taille / Grandeur */}
        <div>
          <label className="mr-2 font-semibold">Filtrer par grandeur:</label>
          <select
            value={sizeFilter}
            onChange={(e) => setSizeFilter(e.target.value)}
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

        {/* Tri */}
        <div>
          <label className="mr-2 font-semibold">Trier par prix:</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="border px-2 py-1"
          >
            <option value="asc">{t('sort.priceAsc')}</option>
            <option value="desc">{t('sort.priceDesc')}</option>
          </select>
        </div>
      </div>

      {/* GRILLE DES PRODUITS POUR TABLETTE / DESKTOP */}
      <div className="hidden md:grid gap-6 grid-cols-3 lg:grid-cols-4">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={() => router.push(`/product/${product.id}`)}
          />
        ))}
      </div>

      {/* SWIPER HORIZONTAL POUR MOBILE */}
      <div className="md:hidden">
        <Swiper slidesPerView={1} spaceBetween={10} autoHeight>
          {filteredProducts.map((product) => (
            <SwiperSlide key={product.id}>
              <ProductCard
                product={product}
                onClick={() => router.push(`/product/${product.id}`)}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
