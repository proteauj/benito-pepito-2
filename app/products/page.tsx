import { Suspense } from 'react';
import ProductsClient from './ProductsClient';

export default function Page() {
  return (
    <Suspense fallback={<div className="py-12 text-center">Chargement…</div>}>
      <ProductsClient />
    </Suspense>
  );
}
