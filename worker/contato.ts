// POST /api/contato: recebe o formulário, valida e envia por e-mail.
// Camadas, nesta ordem (qualquer falha encerra sem enviar):
//   1. só POST, só do próprio site (Origin + Sec-Fetch-Site), só formulário, corpo de no máximo 16 KB
//   2. limite por IP (binding LIMITER, se configurado)
//   3. campo-armadilha "empresa" preenchido → finge sucesso e descarta (robôs simples)
//   4. validação e limpeza de cada campo (tamanho, formato, sem caracteres de controle nem quebra de linha em cabeçalhos)
//   5. Cloudflare Turnstile verificado no servidor (sem o segredo configurado, recusa: nunca aceita sem verificação)
//   6. envio só como texto puro (sem HTML), com o e-mail do visitante em Reply-To, nunca em From
// Nada do conteúdo é gravado nem registrado em log: o log guarda só o resultado.
import { EmailMessage } from 'cloudflare:email';

interface RateLimiter { limit(opts: { key: string }): Promise<{ success: boolean }> }
interface Mailer { send(message: EmailMessage): Promise<void> }

export interface Env {
  ASSETS: Fetcher;
  TURNSTILE_SECRET?: string;       // segredo (wrangler secret put TURNSTILE_SECRET)
  TURNSTILE_HOSTNAME?: string;     // domínio de produção; se definido, o token precisa ter sido gerado nele
  ALLOWED_ORIGINS?: string;        // origens extras aceitas, separadas por vírgula (a própria origem já é aceita)
  CONTACT_TO?: string;             // quem recebe as mensagens
  CONTACT_FROM?: string;           // remetente no domínio do site (ex.: site@kalenzadigital.com)
  MAIL?: Mailer;                   // binding send_email (Cloudflare Email Routing)
  RESEND_API_KEY?: string;         // alternativa ao MAIL: segredo da API da Resend
  LIMITER?: RateLimiter;           // binding de limite de requisições
}

const LANGS = ['pt', 'en', 'ar'];
const MAX_BYTES = 16 * 1024;
const LIMITS = { nome: [2, 100], email: [6, 254], mensagem: [10, 4000] } as const;
// e-mail comum, sem espaços, sem < > ( ) [ ] \ , ; : " (evita qualquer truque em cabeçalhos)
const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]{1,64}@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*\.[A-Za-z]{2,24}$/;

type Code = 'ok' | 'method' | 'origin' | 'type' | 'size' | 'rate' | 'invalid' | 'captcha' | 'config' | 'send';

// texto de uma linha: sem nenhum caractere de controle (inclui \r e \n) nem caracteres invisíveis de direção
const oneLine = (s: string) => s.normalize('NFC').replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202e\u2066-\u2069\ufeff]/g, ' ').replace(/\s+/g, ' ').trim();
// texto de várias linhas: mantém \n, remove o resto dos controles
const multiLine = (s: string) => s.normalize('NFC').replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000b-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202e\u2066-\u2069\ufeff]/g, '').replace(/\n{4,}/g, '\n\n\n').trim();

function log(result: Code) { console.log(JSON.stringify({ evt: 'contato', result })); }

async function readCapped(req: Request): Promise<Uint8Array | null> {
  const len = Number(req.headers.get('Content-Length') ?? '0');
  if (len > MAX_BYTES) return null;
  if (!req.body) return new Uint8Array();
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = []; let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BYTES) { await reader.cancel(); return null; }
    chunks.push(value);
  }
  const out = new Uint8Array(total); let o = 0;
  for (const c of chunks) { out.set(c, o); o += c.byteLength; }
  return out;
}

const b64 = (s: string) => {
  const bytes = new TextEncoder().encode(s); let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
};
const wrap76 = (s: string) => s.replace(/(.{76})/g, '$1\r\n');
const encodeWord = (s: string) => `=?UTF-8?B?${b64(s)}?=`;

async function deliver(env: Env, d: { nome: string; email: string; mensagem: string; idioma: string }): Promise<boolean> {
  const subject = `Contato pelo site · ${d.nome}`;
  const text = [
    'Nova mensagem pelo formulário do site da Kalenza Digital.',
    '',
    `Nome: ${d.nome}`,
    `E-mail: ${d.email}`,
    `Idioma da página: ${d.idioma}`,
    `Recebida em: ${new Date().toISOString()}`,
    '',
    'Mensagem:',
    d.mensagem,
  ].join('\n');

  if (env.MAIL && env.CONTACT_TO && env.CONTACT_FROM) {
    const domain = env.CONTACT_FROM.split('@')[1];
    const raw = [
      `From: ${encodeWord('Site Kalenza Digital')} <${env.CONTACT_FROM}>`,
      `To: <${env.CONTACT_TO}>`,
      `Reply-To: <${d.email}>`,
      `Subject: ${encodeWord(subject)}`,
      `Date: ${new Date().toUTCString()}`,
      `Message-ID: <${crypto.randomUUID()}@${domain}>`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
      '',
      wrap76(b64(text.replace(/\n/g, '\r\n'))),
    ].join('\r\n');
    await env.MAIL.send(new EmailMessage(env.CONTACT_FROM, env.CONTACT_TO, raw));
    return true;
  }
  if (env.RESEND_API_KEY && env.CONTACT_TO && env.CONTACT_FROM) {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() },
      body: JSON.stringify({ from: `Site Kalenza Digital <${env.CONTACT_FROM}>`, to: [env.CONTACT_TO], reply_to: d.email, subject, text }),
    });
    return r.ok;
  }
  return false;
}

export async function handleContato(req: Request, env: Env): Promise<Response> {
  const self = new URL(req.url);
  const wantsJson = (req.headers.get('Accept') ?? '').includes('application/json');
  let lang = 'pt';
  const reply = (status: number, code: Code, extra: HeadersInit = {}): Response => {
    log(code);
    const base = { 'Cache-Control': 'no-store', ...extra } as Record<string, string>;
    if (wantsJson || status === 405) {
      return new Response(JSON.stringify({ ok: code === 'ok', error: code === 'ok' ? undefined : code }), {
        status, headers: { ...base, 'Content-Type': 'application/json; charset=utf-8' },
      });
    }
    // envio sem JavaScript: volta para uma página do site
    const to = code === 'ok' ? `/${lang}/obrigado/` : `/${lang}/?contato=erro#contato`;
    return new Response(null, { status: 303, headers: { ...base, Location: to } });
  };

  if (req.method !== 'POST') return reply(405, 'method', { Allow: 'POST' });

  // 1. origem e formato
  const allowed = [self.origin, ...(env.ALLOWED_ORIGINS ?? '').split(',').map((s) => s.trim()).filter(Boolean)];
  const origin = req.headers.get('Origin');
  const site = req.headers.get('Sec-Fetch-Site');
  if (!origin || !allowed.includes(origin) || (site && site !== 'same-origin')) return reply(403, 'origin');
  const rawType = req.headers.get('Content-Type') ?? '';
  const ctype = rawType.toLowerCase(); // só para conferir o tipo; o boundary do multipart diferencia maiúsculas
  if (!ctype.startsWith('application/x-www-form-urlencoded') && !ctype.startsWith('multipart/form-data')) return reply(415, 'type');
  const body = await readCapped(req);
  if (!body) return reply(413, 'size');

  // 2. limite por IP
  const ip = req.headers.get('CF-Connecting-IP') ?? '';
  if (env.LIMITER && ip) {
    // se o serviço de limite falhar, segue: o Turnstile (passo 5) continua obrigatório
    let allowed = true;
    try { allowed = (await env.LIMITER.limit({ key: ip })).success; } catch { console.log(JSON.stringify({ evt: 'contato', warn: 'limiter' })); }
    if (!allowed) return reply(429, 'rate');
  }

  let form: FormData;
  try { form = await new Response(body, { headers: { 'Content-Type': rawType } }).formData(); }
  catch { return reply(400, 'invalid'); }
  const field = (k: string) => { const v = form.get(k); return typeof v === 'string' ? v : null; };
  if ([...form.values()].some((v) => typeof v !== 'string')) return reply(400, 'invalid'); // nenhum arquivo é aceito

  const idioma = field('idioma') ?? 'pt';
  lang = LANGS.includes(idioma) ? idioma : 'pt';

  // 3. armadilha: robôs que preenchem tudo recebem "sucesso" e nada é enviado
  if ((field('empresa') ?? '').trim() !== '') return reply(200, 'ok');

  // 4. validação
  const nome = oneLine(field('nome') ?? '');
  const email = oneLine(field('email') ?? '').toLowerCase();
  const mensagem = multiLine(field('mensagem') ?? '');
  const within = (v: string, [min, max]: readonly [number, number]) => [...v].length >= min && [...v].length <= max;
  if (!within(nome, LIMITS.nome) || !within(email, LIMITS.email) || !within(mensagem, LIMITS.mensagem) || !EMAIL_RE.test(email)) {
    return reply(422, 'invalid');
  }

  // 5. Turnstile (fail closed: sem segredo, nada é aceito)
  if (!env.TURNSTILE_SECRET) return reply(503, 'config');
  const token = field('cf-turnstile-response') ?? '';
  if (!token || token.length > 2048) return reply(403, 'captcha');
  try {
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token, ...(ip ? { remoteip: ip } : {}), idempotency_key: crypto.randomUUID() }),
    });
    const out = await r.json() as { success?: boolean; hostname?: string; action?: string };
    if (!out.success) return reply(403, 'captcha');
    if (env.TURNSTILE_HOSTNAME && out.hostname !== env.TURNSTILE_HOSTNAME) return reply(403, 'captcha');
    if (out.action && out.action !== 'contato') return reply(403, 'captcha');
  } catch { return reply(502, 'captcha'); }

  // 6. envio
  try {
    if (!(await deliver(env, { nome, email, mensagem, idioma: lang }))) return reply(503, env.CONTACT_TO ? 'send' : 'config');
  } catch { return reply(502, 'send'); }
  return reply(200, 'ok');
}
