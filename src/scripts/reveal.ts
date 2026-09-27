import { reduced } from './motion';

// Entradas: títulos palavra por palavra, blocos que sobem, abertura octogonal das imagens e
// octógonos que se desenham. Cada elemento anima uma vez só.
// Fail-safe: além do IntersectionObserver, uma varredura revela tudo que já está na altura da tela
// (âncora do menu, rolagem rápida, salto de posição causado pelo pin do Processo). Nada fica em branco.
const SEL = '[data-split], [data-reveal], .aperture, [data-in]';

export function initReveal() {
  const els = [...document.querySelectorAll<HTMLElement>(SEL)];
  const show = (el: Element) => el.classList.add('is-in');
  if (reduced() || !('IntersectionObserver' in window)) { els.forEach(show); return; }
  let pending = els;
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      show(e.target);
      io.unobserve(e.target);
    }
  }, { rootMargin: '0px 0px -2% 0px', threshold: 0 });
  els.forEach((el) => io.observe(el));

  // varredura: só a posição vertical conta (cards de um carrossel horizontal também entram)
  let raf = 0;
  const sweep = () => {
    raf = 0;
    const h = innerHeight;
    pending = pending.filter((el) => {
      if (el.classList.contains('is-in')) return false;
      const r = el.getBoundingClientRect();
      if (r.bottom > 0 && r.top < h) { show(el); io.unobserve(el); return false; }
      return true;
    });
    if (!pending.length) stop();
  };
  const queue = () => { if (!raf) raf = requestAnimationFrame(sweep); };
  const stop = () => { ['scroll', 'resize', 'hashchange', 'scrollend'].forEach((ev) => removeEventListener(ev, queue)); };
  ['scroll', 'resize', 'hashchange', 'scrollend'].forEach((ev) => addEventListener(ev, queue, { passive: true }));
  document.addEventListener('click', (e) => { if ((e.target as Element).closest?.('a[href*="#"]')) setTimeout(queue, 60); });
  setTimeout(queue, 1200);
}
