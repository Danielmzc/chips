# Catálogo de Doces e Chips de Banana

Catálogo online com carrinho e checkout via Pix, para venda direta (link enviado nos grupos de WhatsApp).

## Stack

- Next.js (App Router) + Tailwind
- Prisma + PostgreSQL
- Mercado Pago (Pix) para cobrança automática

## Preços

Os preços de venda são calculados com **markup de 40% sobre o custo do distribuidor** (`prisma/seed.ts`). Ajuste `costCents` e `markupPercent` lá e rode `npm run db:seed` de novo para atualizar.

## Rodando localmente

1. Suba um Postgres local (ou use o do Railway) e configure `.env` a partir de `.env.example`:
   ```
   DATABASE_URL="postgresql://usuario:senha@host:porta/banco"
   ```
2. Instale as dependências e sincronize o schema:
   ```
   npm install
   npm run db:push
   npm run db:seed
   ```
3. `npm run dev` e acesse `http://localhost:3000`

## Deploy no Railway

1. Crie um projeto no Railway e adicione um serviço **PostgreSQL** (Railway gera o `DATABASE_URL` automaticamente).
2. Adicione um serviço a partir deste repositório GitHub (`Danielmzc/chips`, branch de produção).
3. Em **Variables** do serviço da aplicação, referencie o Postgres (`${{Postgres.DATABASE_URL}}`) e adicione:
   - `MERCADOPAGO_ACCESS_TOKEN` — token de produção da sua conta Mercado Pago
   - `NEXT_PUBLIC_BASE_URL` — a URL pública que o Railway gerar pro serviço (necessária para o webhook do Pix)
4. Depois do primeiro deploy, rode uma vez (via Railway shell ou localmente apontando pro Postgres do Railway):
   ```
   npm run db:push
   npm run db:seed
   ```
5. No painel do Mercado Pago, nenhuma configuração extra de webhook é necessária — a URL é enviada dinamicamente em cada pagamento criado (`notification_url`).

## Pendências conhecidas (decisões de negócio em aberto)

- **Frete via transportadora**: ainda não há tabela de preço por região/peso. Hoje o checkout aceita entrega via transportadora mas com frete R$0 registrado — o valor real precisa ser combinado manualmente até definirmos a tabela.
- **Catálogo completo (~50 SKUs)**: hoje só os 10 produtos mais vendáveis estão cadastrados. Para adicionar mais, edite `prisma/seed.ts` com os dados da tabela de distribuidor.
- **Venda em caixa fechada (B2B)**: schema atual assume venda unitária ao consumidor final. Se decidirmos vender caixa fechada também, o modelo de `Product` precisa de um segundo preço/unidade de venda.
