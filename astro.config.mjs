import { defineConfig } from 'astro/config';

// Produção: https://kalenzadigital.com (Cloudflare). SITE_URL e BASE_PATH só mudam na prévia do GitHub Pages
// (https://jm-mark.github.io + /kalenza-digital, ver _ferramentas/publicar_pages.sh).
export default defineConfig({
  site: process.env.SITE_URL || 'https://kalenzadigital.com',
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'always',
  build: { inlineStylesheets: 'always' },
  devToolbar: { enabled: false },
});
