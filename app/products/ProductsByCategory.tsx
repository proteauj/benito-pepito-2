import ProductsList from './ProductsList';
import { products } from '../data/products';

export default function ProductsByCategoryPage({ category }: { category: string }) {
  return <ProductsList products={products} category={category} />;
}
