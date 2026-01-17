'use client';

import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Virtual, Grid } from 'swiper/modules';
import { useRouter } from 'next/navigation';
import 'swiper/css';
import 'swiper/css/grid';
import 'swiper/css/virtual';
import ProductCard from './ProductCard';
import { Product } from '../../lib/db/types';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>(''); // filtre material
  const router = useRouter();

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

  // On applique le filtre material si sélectionné
  const filteredProducts = filter
    ? products.filter(p => p.material?.toLowerCase() === filter.toLowerCase())
    : products;

  if (!filteredProducts.length)
    return <p>Aucun produit ne correspond au filtre "{filter}"</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Filtre Material */}
      <div className="mb-4">
        <label className="mr-2 font-semibold">Filtrer par matière:</label>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
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

      {/* Swiper */}
      <Swiper
        direction="vertical"
        slidesPerView={4}
        spaceBetween={20}
        grid={{ rows: 1, fill: 'row' }}
        virtual
        modules={[Virtual, Grid]}
        style={{ height: 'calc(100vh - 120px)' }}
      >
        {filteredProducts.map((product, index) => (
          <SwiperSlide key={product.id} virtualIndex={index}>
            <ProductCard
              product={product}
              onClick={() => router.push(`/product/${product.id}`)}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}