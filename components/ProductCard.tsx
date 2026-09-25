"use client";

import { useCart } from "@/lib/cart-context";
import { formatBRL } from "@/lib/format";

type Product = {
  id: string;
  name: string;
  category: string;
  weight: string;
  priceCents: number;
};

export function ProductCard({ product }: { product: Product }) {
  const { items, addItem, setQuantity } = useCart();
  const inCart = items.find((i) => i.productId === product.id);

  return (
    <div className="flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-amber-600">
          {product.category}
        </p>
        <h3 className="mt-1 font-semibold text-neutral-900">{product.name}</h3>
        <p className="text-sm text-neutral-500">{product.weight}</p>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-lg font-bold text-neutral-900">
          {formatBRL(product.priceCents)}
        </span>
        {inCart ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuantity(product.id, inCart.quantity - 1)}
              className="h-8 w-8 rounded-full border border-neutral-300 text-neutral-600 hover:bg-neutral-100"
            >
              −
            </button>
            <span className="w-6 text-center font-medium">{inCart.quantity}</span>
            <button
              onClick={() => setQuantity(product.id, inCart.quantity + 1)}
              className="h-8 w-8 rounded-full border border-neutral-300 text-neutral-600 hover:bg-neutral-100"
            >
              +
            </button>
          </div>
        ) : (
          <button
            onClick={() =>
              addItem({
                productId: product.id,
                name: product.name,
                priceCents: product.priceCents,
                weight: product.weight,
              })
            }
            className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-600"
          >
            Adicionar
          </button>
        )}
      </div>
    </div>
  );
}
