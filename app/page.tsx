import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  const byCategory = products.reduce<Record<string, typeof products>>(
    (acc, product) => {
      acc[product.category] = acc[product.category] ?? [];
      acc[product.category].push(product);
      return acc;
    },
    {},
  );

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
        {products.length === 0 && (
          <p className="text-neutral-500">
            Nenhum produto cadastrado ainda. Rode o seed do banco de dados.
          </p>
        )}

        {Object.entries(byCategory).map(([category, items]) => (
          <section key={category} className="mb-8">
            <h2 className="mb-3 text-xl font-bold text-neutral-900">{category}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        ))}
      </main>
    </>
  );
}
