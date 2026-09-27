// Dados da marca e do contato. Os campos null ainda não foram informados:
// o site mostra um espaço reservado e deixa o item fora do JSON-LD.
export const SITE = {
  name: 'Kalenza Digital',
  domain: null as string | null, // ex.: 'https://kalenzadigital.com'
  email: null as string | null,
  instagram: null as string | null, // só o @, sem a URL
  whatsapp: '5519997429372',
  whatsappDisplay: '+55 19 99742-9372',
};

// Idiomas publicados.
export const LANGS = ['pt', 'en', 'ar'] as const;
export type Lang = (typeof LANGS)[number];
export const BUILD_LANGS: Lang[] = ['pt', 'en', 'ar'];
// Idiomas no seletor do header.
export const SELECTOR_LANGS: Lang[] = ['pt', 'en', 'ar'];

export const HREFLANG: Record<Lang, string> = { pt: 'pt-BR', en: 'en', ar: 'ar' };

// Projetos selecionados (textos em portfolio-*.json → cases). A Ülia Media é um site real no ar (LIVE);
// os demais são demonstrações autorais com marcas fictícias.
export const CASES = ['ulia', 'marvessa', 'ambrevel', 'ondessa', 'ardelis'] as const;
export type CaseId = (typeof CASES)[number];
// Capturas de cada projeto (public/img/projetos/{id}-{nome}-{largura}.webp). 'print' = peça impressa em retrato.
export const GALLERY: Record<CaseId, { img: string; w: number; h: number; print?: boolean }[]> = {
  ulia: [{ img: 'sobre', w: 1400, h: 930 }, { img: 'servicos', w: 1400, h: 1567 }],
  marvessa: [{ img: 'sobre', w: 1400, h: 875 }, { img: 'servicos', w: 1400, h: 972 }],
  ambrevel: [{ img: 'identidade', w: 1400, h: 788 }, { img: 'colecoes', w: 1400, h: 1100 }, { img: 'destaques', w: 1400, h: 972 },
    { img: 'catalogo-capa', w: 720, h: 1016, print: true }, { img: 'catalogo-pag', w: 720, h: 1016, print: true }],
  ondessa: [{ img: 'servicos', w: 1400, h: 1215 }, { img: 'sobre', w: 1400, h: 1021 }],
  ardelis: [{ img: 'linhas', w: 1400, h: 1030 }, { img: 'apresentacao-capa', w: 720, h: 1019, print: true }, { img: 'apresentacao-pag', w: 720, h: 1019, print: true }],
};
// Altura das capturas de página inteira (largura 720) usadas na prévia com rolagem.
export const FULL_H: Record<CaseId, number> = { ulia: 2168, marvessa: 2490, ambrevel: 3023, ondessa: 2451, ardelis: 3200 };
// Versão das imagens de projeto: aumentar quando uma captura for refeita com o mesmo nome, para o navegador não usar a antiga.
export const IMG_V = '2';
// Projetos reais publicados: endereço do site (link "Ver site" na página do projeto).
export const LIVE: Partial<Record<CaseId, string>> = { ulia: 'https://animations-ulia-media.ulia-media.workers.dev/' }  // versão animada, pedida pelo usuário em 26/09/2026;
// Projeto conceitual em árabe: página reservada, publicada junto com a versão AR.
export const CONCEPT_AR = { id: 'conceitual-ar', live: false };

// Vídeos das faixas. Um vídeo só é usado quando os três arquivos existem em public/videos.
export const VIDEOS = ['hero', 'sobre', 'servicos', 'trabalhos', 'processo', 'contato'] as const;
export type VideoName = (typeof VIDEOS)[number];

// Prefixo do site quando publicado numa subpasta (GitHub Pages): vem de `base` em astro.config.mjs. Vazio na raiz.
export const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export const wa = (text: string) => `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
