// Gera dist/_headers depois do build (Cloudflare lê este arquivo e aplica os cabeçalhos a cada resposta).
// A Content-Security-Policy só libera scripts do próprio site, do Turnstile e os scripts embutidos
// que existem de fato no HTML gerado, identificados pelo hash SHA-256 de cada um.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const html = [];
(function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f.endsWith('.html')) html.push(p);
  }
})(DIST);

// scripts embutidos executáveis (sem src; JSON-LD não executa e não precisa de hash)
const hashes = new Set();
for (const file of html) {
  const src = readFileSync(file, 'utf8');
  for (const m of src.matchAll(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
    const attrs = m[1] ?? '';
    if (/\ssrc=/.test(attrs) || /type="application\/ld\+json"/.test(attrs)) continue;
    hashes.add(`'sha256-${createHash('sha256').update(m[2], 'utf8').digest('base64')}'`);
  }
}

const TURNSTILE = 'https://challenges.cloudflare.com';
const csp = [
  "default-src 'self'",
  `script-src 'self' ${[...hashes].join(' ')} ${TURNSTILE}`,
  "style-src 'self' 'unsafe-inline'", // estilos embutidos e variáveis CSS em style="": não executam código
  "img-src 'self' data:",             // data: = máscaras SVG dos octógonos e setas no CSS
  "font-src 'self'",
  "media-src 'self'",
  "connect-src 'self'",
  `frame-src ${TURNSTILE}`,
  "form-action 'self'",
  "base-uri 'none'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');

const out = `# Gerado por scripts/security-headers.mjs — não editar à mão.
/*
  Content-Security-Policy: ${csp}
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Cross-Origin-Opener-Policy: same-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()

/_astro/*
  Cache-Control: public, max-age=31536000, immutable
/fonts/*
  Cache-Control: public, max-age=31536000, immutable
/videos/*
  Cache-Control: public, max-age=31536000, immutable
`;
writeFileSync(join(DIST, '_headers'), out);
console.log(`_headers: ${html.length} páginas, ${hashes.size} script(s) embutido(s) liberado(s) por hash`);
