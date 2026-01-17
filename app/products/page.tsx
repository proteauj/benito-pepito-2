// app/product/[id]/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { products } from '../data/products';
import ProductCard from './ProductCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Virtual } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/virtual';
import { useI18n } from '@/i18n/I18nProvider';

interface ProductPageProps {
  params: { id: string };
}

export default function ProductPage({ params }: ProductPageProps) {
  const router = useRouter();
  const { t } = useI18n();

  const product = products.find(p => p.id.toString() === params.id);
  if (!product) return <p>Produit introuvable</p>;

  // Autres œuvres de la même catégorie
  const relatedProducts = products.filter(
    p => p.id !== product.id && p.category === product.category
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Produit principal */}
      <div className="max-w-3xl mx-auto">
        <ProductCard product={product} />
        <div className="mt-4 space-y-2">
          <h2 className="text-lg font-semibold">{t('material')}</h2>
          <p>{product.materialFr}</p>

          <h2 className="text-lg font-semibold">{t('size')}</h2>
          <p>{product.size}</p>

          <h2 className="text-lg font-semibold">{t('description')}</h2>
          <p>{product.title}</p>

          <h2 className="text-lg font-semibold">{t('price')}</h2>
          <p>{product.price} $</p>
        </div>
      </div>

      {/* Mini-galerie d’autres œuvres */}
      {relatedProducts.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">{t('relatedWorks')}</h3>

          {/* Desktop Grid */}
          <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onClick={() => router.push(`/product/${p.id}`)}
              />
            ))}
          </div>

          {/* Mobile Swiper */}
          <div className="md:hidden">
            <Swiper
              slidesPerView={1}
              spaceBetween={10}
              autoHeight
              virtual
              modules={[Virtual]}
            >
              {relatedProducts.map((p, index) => (
                <SwiperSlide key={p.id} virtualIndex={index}>
                  <ProductCard
                    product={p}
                    onClick={() => router.push(`/product/${p.id}`)}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}
    </div>
  );
}