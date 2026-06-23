import type { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";
import { EmptyState } from "@/components/common/StateBlock";

export function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length) return <EmptyState message="No products match these filters." />;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
