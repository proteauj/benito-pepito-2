// app/product/[id]/page.tsx
import { products } from '../../data/products';
import ProductCard from '../../products/ProductCard';

interface ProductPageProps {
  params: { id: string };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = products.find(p => p.id === params.id);

  if (!product) return <p>Produit introuvable</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductCard product={product} />
      <div className="mt-4">
        <h2 className="text-lg font-semibold">Matériel</h2>
        <p>{product.materialFr}</p>
      </div>
    </div>
  );
}