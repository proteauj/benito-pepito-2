import { products } from '../../data/products';
import ProductCard from '../../products/ProductCard';

interface ProductPageProps {
  params: { slug: string };
}

export default function ProductPage({ params }: ProductPageProps) {
  // Recherche par slug ou par id pour plus de robustesse
  const product = products.find(
    p => p.slug === params.slug || p.id === params.slug
  );

  if (!product) return <p>Produit introuvable</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductCard product={product} />
      <div className="mt-4">
        <h2 className="text-lg font-semibold">Matériel</h2>
        <p>{product.materialFr}</p>
      </div>
      <div className="mt-2">
        <h2 className="text-lg font-semibold">Taille</h2>
        <p>{product.size}</p>
      </div>
      <div className="mt-2">
        <h2 className="text-lg font-semibold">Prix</h2>
        <p>{product.price} $</p>
      </div>
    </div>
  );
}