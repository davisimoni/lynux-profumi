import type { Product } from "@/types/product";
import { ProductCard } from "@/components/product/ProductCard";

interface RelatedProductsProps {
  products: Product[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-center gap-2 text-center">
          <p className="text-xs uppercase tracking-luxe text-gold">Continua a Scoprire</p>
          <h2 className="font-display text-3xl font-light text-cream">Fragranze Correlate</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
