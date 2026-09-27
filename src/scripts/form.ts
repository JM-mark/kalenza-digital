// Formulário de contato: carrega o Turnstile (Cloudflare) só quando a seção se aproxima,
// libera o botão depois da verificação e envia para /api/contato sem sair da página.
type Turnstile = {
  render(el: HTMLElement, opts: Record<string, unknown>): string;
  reset(id?: string): void;
};
declare global { interface Window { turnstile?: Turnstile } }

const SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

function loadTurnstile(): Promise<Turnstile> {
  return new Promise((resolve, reject) => {
    if (window.turnstile) return resolve(window.turnstile);
    const s = document.createElement('script');
    s.src = SRC; s.async = true;
    s.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error('turnstile')));
    s.onerror = () => reject(new Error('turnstile'));
    document.head.append(s);
  });
}

export function initForm() {
  const form = document.querySelector<HTMLFormElement>('[data-form]');
  if (!form) return;
  const box = form.querySelector<HTMLElement>('.form__captcha')!;
  const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const status = form.querySelector<HTMLElement>('[data-status]')!;
  const initial = status.textContent ?? '';
  const say = (key: string, error = false) => {
    status.textContent = form.dataset[`msg${key[0].toUpperCase()}${key.slice(1)}`] ?? initial;
    status.classList.toggle('is-error', error);
  };
  let widget = '';
  let token = '';

  // voltando de um envio sem JavaScript que falhou
  if (new URLSearchParams(location.search).get('contato') === 'erro') say('error', true);

  const start = () => loadTurnstile().then((ts) => {
    widget = ts.render(box, {
      sitekey: box.dataset.sitekey, action: 'contato', language: box.dataset.lang, theme: 'dark', appearance: 'interaction-only',
      callback: (t: string) => { token = t; btn.disabled = false; },
      'expired-callback': () => { token = ''; btn.disabled = true; },
      'error-callback': () => { token = ''; btn.disabled = true; say('captcha', true); },
    });
  }).catch(() => say('captcha', true));

  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); start(); } }, { rootMargin: '600px 0px' });
  io.observe(form);

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    if (!token || btn.disabled) return;
    if (!form.reportValidity()) return;
    btn.disabled = true; say('sending');
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' }, credentials: 'same-origin' });
      const out = await res.json().catch(() => ({})) as { ok?: boolean; error?: string };
      if (out.ok) { form.reset(); say('ok'); }
      else say(out.error === 'rate' ? 'rate' : out.error === 'invalid' ? 'invalid' : out.error === 'captcha' ? 'captcha' : 'error', true);
    } catch { say('error', true); }
    token = ''; window.turnstile?.reset(widget); // cada token vale para um envio só
  });
}
