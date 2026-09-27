// Projetos: ao passar o mouse, a captura da página inteira rola dentro do navegador.
// Calcula a distância (--scroll) e a duração (--dur) a partir da altura real da imagem.
export function initProjects() {
  const cards = [...document.querySelectorAll<HTMLElement>('[data-pj]')];
  const set = (card: HTMLElement) => {
    const view = card.querySelector<HTMLElement>('.pj__view')!;
    const img = view.querySelector('img')!;
    if (!img.complete || !img.naturalWidth) return;
    const dist = Math.max(0, img.getBoundingClientRect().height - view.clientHeight);
    card.style.setProperty('--scroll', `-${dist.toFixed(0)}px`);
    card.style.setProperty('--dur', `${Math.min(9, Math.max(3, dist / 520)).toFixed(1)}s`);
  };
  cards.forEach((card) => {
    const img = card.querySelector('.pj__view img') as HTMLImageElement;
    img.addEventListener('load', () => set(card));
    card.addEventListener('pointerenter', () => set(card));
    set(card);
  });
  addEventListener('resize', () => cards.forEach(set), { passive: true });

  // ?motion=on em telas de toque (sem hover): a página rola no mockup quando o card está na tela
  if (document.documentElement.classList.contains('motion-on') && !matchMedia('(hover: hover) and (pointer: fine)').matches && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      const card = e.target as HTMLElement;
      if (e.isIntersecting) set(card);
      card.classList.toggle('is-playing', e.isIntersecting);
    }), { threshold: 0.55 });
    cards.forEach((c) => io.observe(c));
  }
}
