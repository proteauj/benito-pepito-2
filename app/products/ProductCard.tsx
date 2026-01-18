import { Product } from "@/lib/db/types";

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  expanded?: boolean;
  useFullImg?: boolean;
  keepImgProportions?: boolean;
  onAddToCart?: (product: Product) => void;
  added?: boolean;
}

export default function ProductCard({
  product,
  onClick,
  expanded = false,
  useFullImg = false,
  keepImgProportions = false,
  onAddToCart,
  added = false,
}: ProductCardProps) {
  return (
    <div
      className={`cursor-pointer rounded overflow-hidden shadow hover:shadow-lg transition`}
      onClick={onClick}
    >
      <div
        className={`relative w-full overflow-hidden ${
          useFullImg ? 'h-auto max-h-[600px]' : 'h-64'
        }`}
      >
        <img
          src={useFullImg ? product.image : product.imageThumbnail || product.image}
          alt={product.title}
          className={`w-full h-full ${
            keepImgProportions || useFullImg ? 'object-contain' : 'object-cover'
          }`}
        />
      </div>

      {expanded && (
        <div className="bg-white p-2">
          <p className="font-bold text-sm truncate">{product.titleFr || product.title}</p>
          <p className="text-xs">{product.price} $</p>
          <p><strong>Matériel:</strong> {product.materialFr || product.material}</p>
          <p><strong>Taille:</strong> {product.size}</p>

          {onAddToCart && (
            <button
              className={`block w-full text-center bg-[var(--gold)] text-black py-3 font-semibold hover:bg-[var(--gold-dark)] hover:text-[var(--leaf)] mt-2 ${
                added ? 'bg-[var(--gold-dark)] cursor-default' : ''
              }`}
              onClick={() => onAddToCart(product)}
              disabled={added}
            >
              {added ? 'Ajouté au panier' : 'Ajouter au panier'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}