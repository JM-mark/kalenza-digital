import { defineConfig } from 'astro/config';

// SITE_URL e BASE_PATH vêm do ambiente de publicação (GitHub Pages: https://jm-mark.github.io + /kalenza-digital).
// Sem eles, o site é gerado para a raiz (prévia local e Netlify).
export default defineConfig({
  site: process.env.SITE_URL || 'https://SEU-DOMINIO.com',
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'always',
  build: { inlineStylesheets: 'always' },
  devToolbar: { enabled: false },
});
