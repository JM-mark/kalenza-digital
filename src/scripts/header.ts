// Header que muda de tom conforme o fundo que está por baixo dele (seções com data-tone),
// ganha fundo depois do topo e abre o menu de tela cheia no celular.
export function initHeader() {
  const hdr = document.getElementById('hdr');
  if (!hdr) return;
  const sections = [...document.querySelectorAll<HTMLElement>('main [data-tone], footer[data-tone]')];
  const burger = hdr.querySelector<HTMLButtonElement>('.hdr__burger')!;
  const menu = document.getElementById('menu')!;
  let ticking = false;

  const paint = () => {
    ticking = false;
    const y = hdr.offsetHeight / 2;
    let tone = 'dark';
    for (const s of sections) {
      const r = s.getBoundingClientRect();
      if (r.top <= y && r.bottom > y) { tone = s.dataset.tone!; break; }
    }
    if (!menu.hidden) tone = 'dark';
    hdr.dataset.tone = tone;
    hdr.classList.toggle('is-scrolled', window.scrollY > 8);
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(paint); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  paint();

  const setMenu = (open: boolean) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.querySelector('.sr')!.textContent = open ? burger.dataset.close! : burger.dataset.open!;
    document.documentElement.classList.toggle('menu-open', open);
    if (open) { menu.hidden = false; requestAnimationFrame(() => menu.classList.add('is-open')); }
    else { menu.classList.remove('is-open'); setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, 500); }
    paint();
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if ((e.target as HTMLElement).closest('a')) setMenu(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); burger.focus(); } });
  matchMedia('(min-width: 1100px)').addEventListener('change', (m) => { if (m.matches) setMenu(false); });
}
