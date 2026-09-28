// Backend do site (Cloudflare Worker com arquivos estáticos em ./dist).
//   GET  /             → redireciona para /pt/, /en/ ou /ar/ (?lang= → Accept-Language → PT)
//   POST /api/contato  → formulário de contato (ver contato.ts)
//   resto              → arquivos estáticos; cabeçalhos de segurança vêm de dist/_headers (gerado no build)
import { handleContato, type Env } from './contato';
import { SECURITY_HEADERS } from './headers';

const LANGS = ['pt', 'en', 'ar'] as const;

function pickLang(req: Request): string {
  const url = new URL(req.url);
  const q = url.searchParams.get('lang')?.slice(0, 2).toLowerCase();
  if (q && (LANGS as readonly string[]).includes(q)) return q;
  // Accept-Language: "ar-SA,ar;q=0.9,en;q=0.8" → primeira língua publicada, respeitando o peso q
  const prefs = (req.headers.get('Accept-Language') ?? '')
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const qv = params.find((p) => p.trim().startsWith('q='));
      return { lang: tag.slice(0, 2).toLowerCase(), q: qv ? Number(qv.split('=')[1]) || 0 : 1 };
    })
    .sort((a, b) => b.q - a.q);
  return prefs.find((p) => p.q > 0 && (LANGS as readonly string[]).includes(p.lang))?.lang ?? 'pt';
}

function withSecurity(res: Response): Response {
  const out = new Response(res.body, res);
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) if (!out.headers.has(k)) out.headers.set(k, v);
  return out;
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    // www → domínio principal (um endereço só para o Google e para os links compartilhados)
    if (url.hostname.startsWith('www.')) {
      url.hostname = url.hostname.slice(4);
      return withSecurity(new Response(null, { status: 301, headers: { Location: url.toString() } }));
    }
    if (url.pathname === '/api/contato') return withSecurity(await handleContato(req, env));
    if (url.pathname.startsWith('/api/')) return withSecurity(new Response('Not found', { status: 404 }));
    if (url.pathname === '/' && (req.method === 'GET' || req.method === 'HEAD')) {
      return withSecurity(new Response(null, {
        status: 302,
        headers: { Location: `/${pickLang(req)}/`, Vary: 'Accept-Language', 'Cache-Control': 'private, no-store' },
      }));
    }
    return env.ASSETS.fetch(req);
  },
} satisfies ExportedHandler<Env>;
