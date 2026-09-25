import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MARKUP_PERCENT = 40;

function priceFromCost(costCents: number, markupPercent = MARKUP_PERCENT) {
  return Math.round(costCents * (1 + markupPercent / 100));
}

const products = [
  {
    slug: "chips-original-90g",
    name: "Chips de Banana Original",
    category: "Chips",
    weight: "90g",
    costCents: 277,
  },
  {
    slug: "chips-canela-acucar-90g",
    name: "Chips de Banana Canela e Açúcar",
    category: "Chips",
    weight: "90g",
    costCents: 277,
  },
  {
    slug: "chips-cebola-salsa-90g",
    name: "Chips de Banana Cebola e Salsa",
    category: "Chips",
    weight: "90g",
    costCents: 277,
  },
  {
    slug: "chips-limao-pepper-90g",
    name: "Chips de Banana Limão Pepper",
    category: "Chips",
    weight: "90g",
    costCents: 277,
  },
  {
    slug: "chips-oregano-90g",
    name: "Chips de Banana Orégano",
    category: "Chips",
    weight: "90g",
    costCents: 277,
  },
  {
    slug: "chips-natural-400g",
    name: "Chips de Banana Natural",
    category: "Chips",
    weight: "400g",
    costCents: 1417,
  },
  {
    slug: "doce-banana-tradicional",
    name: "Doce de Banana Tradicional",
    category: "Doce de Banana",
    weight: "400g",
    costCents: 850,
  },
  {
    slug: "barrinha-sete-graos",
    name: "Barrinha de Banana Sete Grãos",
    category: "Doce de Banana",
    weight: "25g",
    costCents: 78,
  },
  {
    slug: "bananinha-cremosa-tradicional-30g",
    name: "Bananinha Cremosa Tradicional",
    category: "Bananinha Cremosa",
    weight: "30g",
    costCents: 444,
  },
  {
    slug: "bananinha-cremosa-canela-30g",
    name: "Bananinha Cremosa com Canela",
    category: "Bananinha Cremosa",
    weight: "30g",
    costCents: 444,
  },
];

async function main() {
  for (const product of products) {
    const priceCents = priceFromCost(product.costCents);

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        category: product.category,
        weight: product.weight,
        costCents: product.costCents,
        markupPercent: MARKUP_PERCENT,
        priceCents,
      },
      create: {
        ...product,
        markupPercent: MARKUP_PERCENT,
        priceCents,
      },
    });
  }

  console.log(`Seed concluído: ${products.length} produtos.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
