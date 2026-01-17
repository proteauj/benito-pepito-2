'use client';

import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Virtual, Grid } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/grid';
import 'swiper/css/virtual';
import { useRouter } from 'next/navigation';
import ProductCard from './ProductCard';
import { Product } from '../../lib/db/types';

interface ProductsPageProps {
  products: Product[];
}

export default function ProductsPage({ products }: ProductsPageProps) {
  const router = useRouter();
  const [columnCount, setColumnCount] = useState(4);

  // --- Responsivité ---
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width >= 1280) setColumnCount(4);
      else if (width >= 768) setColumnCount(2);
      else setColumnCount(1);
    };
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  // --- Filtre multi-sélection ---
  const allMaterials = Array.from(
    new Set(products.flatMap((p) => p.material?.split(',') || []))
  );

  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);

  const toggleMaterial = (mat: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(mat) ? prev.filter((m) => m !== mat) : [...prev, mat]
    );
  };

  const filteredProducts =
    selectedMaterials.length === 0
      ? products
      : products.filter((p) =>
          (p.material?.split(',') || []).some((m) =>
            selectedMaterials.includes(m)
          )
        );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* --- Filtre Multi-sélection --- */}
      <div className="mb-4 flex gap-2 flex-wrap">
        {allMaterials.map((mat) => {
          const isSelected = selectedMaterials.includes(mat);
          return (
            <button
              key={mat}
              className={`px-3 py-1 rounded border ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-gray-200 border-gray-300'
              }`}
              onClick={() => toggleMaterial(mat)}
            >
              {mat}
            </button>
          );
        })}
        <button
          className="px-3 py-1 rounded border bg-gray-200 border-gray-300"
          onClick={() => setSelectedMaterials([])}
        >
          Réinitialiser
        </button>
      </div>

      {/* --- Swiper Grid Responsive --- */}
      <Swiper
        direction="vertical"
        slidesPerView={columnCount} // nombre de slides visibles selon écran
        spaceBetween={20}
        grid={{ rows: 1, fill: 'row' }}
        virtual
        modules={[Virtual, Grid]}
        style={{ height: 'calc(100vh - 150px)' }}
      >
        {filteredProducts.map((product, index) => (
          <SwiperSlide key={product.id} virtualIndex={index}>
            <ProductCard
              product={product}
              onClick={() => router.push(`/product/${product.id}`)} // ✅ OK maintenant
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}