'use client';

import { useEffect } from 'react';
import { Product } from '../lib/db/types';
import { products } from './data/products';
import HomeClient from './HomeClient';

type ProductsByCategory = Record<string, Product[]>;

export default function HomePage() {
  // Catégories à afficher sur la home
  const categoriesToShow = ['Galerie', 'Home Garden', 'Sculpture', 'Impression 3D'];

  // Mapping anglais → français
  const categoryMap: Record<string, string> = {
    'Painting': 'Galerie',
    'Home-Garden': 'Home Garden',
    'Sculpture': 'Sculpture',
    '3DPrint': 'Impression 3D',
  };

  // Grouper les produits par catégorie française
  const productsByCategory: ProductsByCategory = products.reduce(
    (acc: ProductsByCategory, product) => {
      const categoryFr = categoryMap[product.category] || product.category;
      if (!acc[categoryFr]) acc[categoryFr] = [];
      acc[categoryFr].push(product);
      return acc;
    },
    {} as ProductsByCategory
  );

  // S'assurer que toutes les catégoriesToShow existent même si elles n'ont pas encore de produits
  categoriesToShow.forEach(category => {
    if (!productsByCategory[category]) productsByCategory[category] = [];
  });

  // Track homepage visit
  useEffect(() => {
    const trackVisit = async () => {
      try {
        await fetch('/api/analytics/track?page=homepage', { method: 'POST' });
      } catch (error) {
        console.debug('Analytics tracking failed:', error);
      }
    };
    trackVisit();
  }, []);

  return <HomeClient productsByCategory={productsByCategory} />;
}