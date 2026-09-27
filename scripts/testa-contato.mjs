// Testes de segurança do formulário (POST /api/contato). Rodar contra o Worker local:
//   wrangler dev (com TURNSTILE_SECRET de teste em .dev.vars) e depois: node scripts/testa-contato.mjs http://127.0.0.1:8787
// Localmente, cada teste usa um CF-Connecting-IP diferente para não esbarrar no limite por IP
// (na Cloudflare esse cabeçalho é definido pela própria rede e não pode ser falsificado).
const BASE = process.argv[2] ?? 'http://127.0.0.1:8787';
const URL_API = `${BASE}/api/contato`;
const ORIGIN = new URL(BASE).origin;
const TOKEN = 'XXXX.DUMMY.TOKEN.XXXX'; // aceito pela chave secreta de teste do Turnstile
let ipN = 1;
const ok = { nome: 'Maria Teste', email: 'maria@exemplo.com', mensagem: 'Quero conversar sobre um site novo.', idioma: 'pt', empresa: '', 'cf-turnstile-response': TOKEN };

async function post(fields, { headers = {}, ip = `10.0.0.${ipN++}`, body, type } = {}) {
  const h = { Origin: ORIGIN, 'Sec-Fetch-Site': 'same-origin', Accept: 'application/json', 'CF-Connecting-IP': ip, ...headers };
  let b = body;
  if (!b) { b = new URLSearchParams(fields).toString(); h['Content-Type'] = type ?? 'application/x-www-form-urlencoded'; }
  for (const [k, v] of Object.entries(h)) if (v === null) delete h[k];
  const r = await fetch(URL_API, { method: 'POST', headers: h, body: b, redirect: 'manual' });
  return { status: r.status, json: await r.json().catch(() => null) };
}

const casos = [
  ['GET é recusado', async () => (await fetch(URL_API)).status, 405],
  ['sem Origin', async () => (await post(ok, { headers: { Origin: null } })).status, 403],
  ['Origin de outro site (CSRF)', async () => (await post(ok, { headers: { Origin: 'https://site-malicioso.com' } })).status, 403],
  ['Sec-Fetch-Site cross-site', async () => (await post(ok, { headers: { 'Sec-Fetch-Site': 'cross-site' } })).status, 403],
  ['JSON em vez de formulário', async () => (await post(null, { body: JSON.stringify(ok), headers: { 'Content-Type': 'application/json' } })).status, 415],
  ['corpo acima de 16 KB', async () => (await post({ ...ok, mensagem: 'a'.repeat(20000) })).status, 413],
  ['e-mail inválido', async () => (await post({ ...ok, email: 'nao-e-email' })).status, 422],
  ['injeção de cabeçalho no e-mail (CRLF + Bcc)', async () => (await post({ ...ok, email: 'maria@exemplo.com\r\nBcc: alvo@exemplo.com' })).status, 422],
  ['mensagem curta demais', async () => (await post({ ...ok, mensagem: 'oi' })).status, 422],
  ['nome longo demais', async () => (await post({ ...ok, nome: 'x'.repeat(101) })).status, 422],
  ['sem token do Turnstile', async () => (await post({ ...ok, 'cf-turnstile-response': '' })).status, 403],
  ['envio multipart válido (como o navegador envia)', async () => {
    const fd = new FormData(); for (const [k, v] of Object.entries(ok)) fd.append(k, v);
    return (await post(null, { body: fd, headers: {} })).status;
  }, 200],
  ['arquivo anexado (multipart)', async () => {
    const fd = new FormData(); for (const [k, v] of Object.entries(ok)) fd.append(k, v);
    fd.append('anexo', new Blob(['MZ...'], { type: 'application/octet-stream' }), 'virus.exe');
    return (await post(null, { body: fd, headers: {} })).status;
  }, 400],
  ['armadilha preenchida: finge sucesso, não envia', async () => { const r = await post({ ...ok, empresa: 'Spam Ltda' }); return r.status === 200 && r.json?.ok ? 200 : r.status; }, 200],
  ['nome com CRLF é limpo e o envio passa', async () => (await post({ ...ok, nome: 'Maria\r\nBcc: alvo@exemplo.com' })).status, 200],
  ['envio válido', async () => (await post(ok)).status, 200],
  ['limite: 6º envio seguido do mesmo IP', async () => {
    let last = 0; for (let i = 0; i < 6; i++) last = (await post(ok, { ip: '10.9.9.9' })).status; return last;
  }, 429],
];

let falhas = 0;
for (const [nome, fn, esperado] of casos) {
  let got; try { got = await fn(); } catch (e) { got = 'erro: ' + e.message; }
  const passou = got === esperado; if (!passou) falhas++;
  console.log(`${passou ? 'ok   ' : 'FALHA'} ${nome}: ${got}${passou ? '' : ` (esperado ${esperado})`}`);
}
console.log(falhas ? `\n${falhas} falha(s)` : '\nTodos os testes passaram.');
process.exit(falhas ? 1 : 0);
