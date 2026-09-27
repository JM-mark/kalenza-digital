// Serviços: no celular cada card vira um acordeão (um aberto por vez); no desktop tudo fica visível.
export function initServices() {
  const cards = [...document.querySelectorAll<HTMLElement>('[data-sv]')];
  if (!cards.length) return;
  const desk = matchMedia('(min-width: 900px)');
  cards.forEach((card) => {
    const btn = card.querySelector<HTMLButtonElement>('.sv__head')!;
    btn.addEventListener('click', () => {
      if (desk.matches) return;
      const open = !card.hasAttribute('data-open');
      cards.forEach((c) => { c.removeAttribute('data-open'); c.querySelector('.sv__head')!.setAttribute('aria-expanded', 'false'); });
      if (open) { card.setAttribute('data-open', ''); btn.setAttribute('aria-expanded', 'true'); }
    });
  });
  const sync = () => cards.forEach((c) => c.querySelector('.sv__head')!.setAttribute('aria-expanded', String(desk.matches || c.hasAttribute('data-open'))));
  desk.addEventListener('change', sync); sync();
}
