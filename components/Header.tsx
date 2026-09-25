"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export function Header() {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold text-lg">
          🍌 Banana Chips &amp; Doces
        </Link>
        <Link
          href="/carrinho"
          className="relative rounded-full bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
        >
          Carrinho
          {totalItems > 0 && (
            <span className="ml-2 rounded-full bg-white/25 px-2 py-0.5 text-xs">
              {totalItems}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
