// Gera dist/sitemap.xml depois do build: uma entrada por página publicada nos três idiomas,
// com as versões alternativas (hreflang) de cada uma. Fica fora: raiz (só redireciona), "obrigado" e 404.
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const SITE = (process.env.SITE_URL || 'https://kalenzadigital.com') + (process.env.BASE_PATH || '').replace(/\/$/, '');
const LANGS = { pt: 'pt-BR', en: 'en', ar: 'ar' };
const SKIP = /(^|\/)(obrigado|404)(\/|$)/;

const pages = new Set(); // caminho sem o idioma: '', 'projetos/ulia/' …
(function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f === 'index.html') {
      const rel = relative(DIST, dir).split(sep).join('/');
      const [lang, ...rest] = rel.split('/');
      if (!(lang in LANGS)) continue;
      const path = rest.length ? rest.join('/') + '/' : '';
      if (!SKIP.test(path)) pages.add(path);
    }
  }
})(DIST);

const today = new Date().toISOString().slice(0, 10);
const url = (lang, path) => `${SITE}/${lang}/${path}`;
const entries = [...pages].sort().flatMap((path) => Object.keys(LANGS).map((lang) => `  <url>
    <loc>${url(lang, path)}</loc>
    <lastmod>${today}</lastmod>
${Object.entries(LANGS).map(([l, h]) => `    <xhtml:link rel="alternate" hreflang="${h}" href="${url(l, path)}"/>`).join('\n')}
    <xhtml:link rel="alternate" hreflang="x-default" href="${url('pt', path)}"/>
  </url>`));

writeFileSync(join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`);
console.log(`sitemap.xml: ${entries.length} endereços (${pages.size} páginas × ${Object.keys(LANGS).length} idiomas)`);
