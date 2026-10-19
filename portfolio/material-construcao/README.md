# Catálogo demo: material de construção

Página estática, sem build e sem dependências (só Google Fonts). Abra `index.html` no navegador ou suba a pasta em qualquer host estático (Netlify Drop, Vercel, GitHub Pages).

- `catalogo.html`: fonte da página (sem `<html>/<head>`), usada na publicação como Artifact.
- `index.html`: mesma página embrulhada em documento completo, pronta para hospedar.
- `mobile.html`: versão app para celular (abas, ficha do produto, orçamento). No computador aparece dentro de uma moldura de celular, para apresentação.

## Personalizar para uma loja

No `<script>`, edite o objeto `STORE` (nome, slogan, WhatsApp com DDI+DDD, telefone, desconto Pix, valor do frete grátis, produto da oferta), a lista `PRODUCTS` (preço no cartão em centavos; `was` = preço anterior para entrar em Ofertas) e `KITS`. Depois de editar `catalogo.html`, regenere o `index.html` ou edite os dois.

Imagens são ilustrações SVG geradas no próprio código (sem fotos de terceiros, sem problema de direito de imagem).
