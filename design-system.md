# Kalenza Digital · design system do site

Direção de arte: **editorial noturno**, em ritmo de agência premium (rodada v2). Só três momentos da Home são faixas escuras de impacto (Hero, Projetos e Contato); as outras seções trazem o título dentro da própria página. O octógono é linguagem de interface, não só logo.

Código:
- `src/styles/global.css`: tokens, tipografia, grid, botões, animações de entrada e View Transitions;
- `src/styles/components.css`: header, faixas, seções e rodapé;
- `src/styles/home.css`: tudo o que entrou na v2 (intro, peça do hero, serviços, projetos e magnéticos). É carregado em todas as páginas pelo `layouts/Base.astro`.

---

## 1. Cores

| Token | Valor | Uso |
|---|---|---|
| `--noite` | #10151F | Faixas, serviços, processo, contato |
| `--marfim` | #F4EFE6 | Páginas claras, texto sobre Noite |
| `--champ` | #B89B72 | Destaques, botões, linhas e octógonos sobre Noite |
| `--pedra` | #6F6A62 | Texto secundário sobre Marfim |
| `--linho` | #E6DFD2 | Fundo dos trabalhos |
| `--noite-2` | #0B0F17 | Rodapé (profundidade) |
| `--champ-title` | #9A7F59 | Destaque de título **sobre fundo claro** (contraste ≥ 3:1) |
| `--champ-ink` | #7D6440 | Rótulos pequenos **sobre fundo claro** (contraste ≥ 4.5:1) |

Os dois tons de champanhe mais escuros existem só por acessibilidade: o #B89B72 sobre Marfim tem contraste de 2,3:1 e não passa no Lighthouse. Sobre Noite, usa-se sempre o champanhe da marca.

## 2. Tipografia

| Papel | PT / EN | AR |
|---|---|---|
| Display (hero) | Prata, `clamp(2.9rem, 7.2vw, 7.2rem)`, altura de linha 1.02 | Reem Kufi a 90%, altura de linha 1.3 |
| H2 (seções) | Prata, `clamp(2.35rem, 5vw, 4.9rem)` | Reem Kufi a 90% |
| H3 | Prata, `clamp(1.55rem, 2.3vw, 2.15rem)` | Reem Kufi a 90% |
| Destaque `<i>` | Noto Serif Display Italic 300, champanhe (itálico verdadeiro) | Reem Kufi em champanhe, sem inclinação |
| Texto | Albert Sans 17/18 px, altura de linha 1.65 | IBM Plex Sans Arabic 18/19 px, altura de linha 1.8 |
| Rótulo | Albert Sans 12 px 500, espaçamento .28em, caixa alta, sem marcador (o octógono de 11 px saiu a pedido do usuário) | Plex Arabic 14 px 500, sem caixa alta e sem espaçamento |

- As fontes são hospedadas no próprio site, em woff2 com subconjunto de caracteres (≈ 17–45 KB cada), com pré-carregamento.
- **Prata e NSD Italic:** `font-display: block`, com fontes de reserva calibradas (`Prata Fallback` = Georgia a 108,65%, `Prata Fallback T` = Times New Roman a 119,2%, `NSD Fallback` = Georgia Italic a 95,5%). O `size-adjust` iguala a largura média dos títulos: se a fonte chega depois do primeiro layout, o título quebra nas mesmas linhas e o hero, ancorado pela base, não pula. Sem isso, o CLS chegava a 0,29 em cerca de 1 a cada 6 carregamentos.
- **Albert Sans:** `font-display: swap`, com a `Albert Fallback` (Arial com métricas ajustadas), para o texto aparecer sem esperar a fonte.
- O árabe só carrega em `/ar`.

## 3. Grid e ritmo
- `.wrap`: largura máxima de 1440 px, margem lateral `clamp(16px, 5vw, 80px)`.
- `.grid`: 4 colunas no mobile, 8 no tablet (≥ 768) e 12 no desktop (≥ 1100); gap de 24 px.
- Espaço entre seções: `clamp(96px, 14vh, 176px)`.
- Tudo usa propriedades lógicas (`inset-inline`, `margin-inline`), então o RTL espelha sem CSS extra.
- A variável `--dir` (1 ou −1) multiplica todo deslocamento horizontal animado.

**Ritmo claro/escuro da Home (v2, 3 faixas):**
1. Hero (Noite, 100svh), com a peça de octógonos
2. Sobre (Marfim): título dentro da seção, imagem de apoio com moldura octogonal
3. Serviços (Linho): grade 2×2 de cards Noite
4. **Projetos: faixa Noite** (curta) → grade de mockups sobre Marfim
5. Processo (Noite): título dentro da área fixada
6. Por que nós (Marfim): faixa de imagem + 3 pontos
7. **Contato: faixa Noite** (compacta) → formulário Noite
8. Rodapé (Noite profundo)

A página ficou cerca de 30% mais curta que na v1. Medido com `_ferramentas/measure.js`: desktop 1440 com 8 913 px no carregamento (o trecho fixado do Processo soma rolagem quando o GSAP entra) e celular 390 com 8 605 px.

## 4. Octógono: regras
1. **Logo:** intocado. Os SVGs da marca vão inline, com `currentColor` no texto para o header trocar de tom.
2. **Padrão 4.8.8** (`--pattern`, célula de 96 px):
   - só sobre Noite, com opacidade de 5–8,5% e máscara radial;
   - aparece no placeholder das faixas, no menu, no processo e no rodapé;
   - nunca sobre Marfim.
3. **Abertura octogonal** (`.aperture`): as imagens entram recortadas em octógono, que se abre até virar retângulo em 1,5 s, com a imagem indo de 1.14 → 1. Só na entrada.
4. **Botões chanfrados:** cantos cortados a 45° (`--chamfer: 10px`). As tags de serviço usam chanfro de 5 px.
5. **Números de item** `.octnum`: só o número em NSD Italic 28 px, champanhe, sem moldura (o octógono em volta saiu a pedido do usuário).
6. **WhatsApp flutuante:** octógono champanhe com anel octogonal que pulsa a cada 6 s. Acima dele, um balão Noite com três pontos champanhe "digitando" entra em 1,6 s e flutua devagar (menor no celular; parado com movimento reduzido).
7. **Peça do hero** (`HeroArt.astro`): 4 octógonos concêntricos de linha champanhe. É a única exceção à regra de não girar: a rotação é lentíssima (120–240 s por volta) e alterna o sentido.
8. **Não fazer:** octógono girando rápido ou como enfeite fora do hero, octógono como moldura fixa de foto, dois padrões na mesma tela.

## 5. Componentes

| Componente | Arquivo | Notas |
|---|---|---|
| Header | `components/Header.astro`, `scripts/header.ts` | Transparente sobre Noite; ganha fundo depois do topo (vidro Noite a 78% ou Marfim a 90%). O tom vem do `data-tone` da seção sob o header. O seletor usa sublinhado champanhe e mostra só `SELECTOR_LANGS` (hoje PT · EN; عربي volta junto com o AR). |
| Intro | `components/Intro.astro` | Ver seção 6. |
| Peça do hero | `components/HeroArt.astro`, `scripts/hero-art.ts` | Fica atrás do texto e na frente do vídeo. Ocupa `min(38vw, 580px)`, alinhada à margem final da grade. Abaixo de 1100 px: só o anel externo, parado, a 38% de opacidade. |
| Menu mobile | idem | Tela cheia em Noite, itens em Prata entrando em cascata de 70 ms, Esc fecha, trava a rolagem |
| Botão | `components/Button.astro` | `primary` (champanhe), `ghost` (contorno de 1 px). No hover, o preenchimento varre a partir do início da linha e a seta anda 4 px. `shine` = reflexo único (só no CTA do contato). Os CTAs principais são magnéticos (`data-magnetic`). |
| Faixa com vídeo | `components/VideoBand.astro`, `scripts/video.ts` | `hero` (100svh) ou `band` (64vh). Mostra o placeholder até existirem os 3 arquivos em `public/videos`. |
| Título dividido | `components/Split.astro` | Entrada palavra por palavra (0,56 s por palavra, 30 ms entre elas, com cascata limitada a 8 palavras); o texto completo fica em `.sr` para leitores de tela. Com `load`, entra por CSS no carregamento, sem esperar o JavaScript: é usado no hero da Home e na capa das páginas de projeto, junto com `.load-rise` nas linhas de apoio. |
| Número de item | `components/OctNum.astro` | Número em NSD Italic, sem moldura |
| Projetos | `.work2` / `.pj`, `scripts/projects.ts` | 5 projetos. O 1º (Ülia Media, site real no ar, `LIVE` em `lib/config.ts`) é o destaque `.pj--feature`: largura total, mockup à esquerda e texto à direita. Os outros 4 formam a grade 2×2 a partir de 900 px (o 2º card de cada linha desce 64 px). Cada card é um mockup de navegador (barra Linho com 3 pontos, janela 16:10) com um celular sobreposto (23% da largura, borda Noite de 6 px). No hover, a captura da página inteira (`public/img/projetos/*-full-720.webp`) rola dentro do navegador: a distância vem da altura real da imagem e a duração é distância/520, entre 3 e 9 s. O celular sobe 10 px, o nome ganha sublinhado champanhe e a seta anda. Cada card mostra só o número (01–05), sem tag e sem aviso sobre marcas fictícias (pedido do usuário). A página de projeto também não mostra a linha de marca/setor; a da Ülia tem um botão "Ver site" para uliamedia.com. |
| Serviços | `.svc2` / `.sv`, `scripts/services.ts` | A partir de 900 px, grade 2×2 de cards Noite sobre Linho, com chanfro de 14 px, número, título e texto. No hover ou foco, entra uma foto de apoio (`public/img/apoio/svc-*`, escala 1.08 → 1, 0,7 s) e sobem as tags. No celular, acordeão com "+" que vira "−". |
| Processo | `.proc`, `scripts/process.ts` | Desktop: capítulos fixados (GSAP + ScrollTrigger carregados sob demanda), com o título dentro da área fixada e trilho de 5 octógonos. Abaixo de 1100 px: carrossel horizontal de cards chanfrados com scroll-snap (`scroll-padding-inline` igual à margem, para o 1º card alinhar com o texto). Com movimento reduzido: lista vertical. |
| Imagens de apoio | `.about__img`, `.why2__img` | Sobre: foto 4:4.6 com moldura octogonal de linha. Por que nós: faixa de imagem de 130–240 px. Fontes em `creditos-imagens.md`. |
| Atendimento WhatsApp | `.wa-card` (Contato) | Painel chanfrado de linha champanhe com ícone, título, texto de apoio e botão "Iniciar conversa". O número de telefone não aparece no site (só no link do WhatsApp). O ícone vem de `lib/icons.ts` (o mesmo do botão flutuante). A faixa rolante de frentes (marquee) foi removida a pedido do usuário. |
| Formulário | `.form` | Netlify Forms com honeypot; campos só com linha inferior; vai para `/{lang}/obrigado/` |
| Rodapé | `components/Footer.astro` | Assinatura grande; no AR, com "كالينزا ديجيتال" |
| WhatsApp flutuante | `components/WaFloat.astro` | Em todas as páginas; fica no fim da linha (à esquerda no árabe) |

## 6. Movimento
- Curva única: `cubic-bezier(.22, 1, .36, 1)`. Cascatas de 30 a 140 ms.
- **Regra da v2:** toda entrada de texto começa quando o elemento entra na tela e termina em até 0,8 s. Os `data-reveal` duram 0,7 s, com atraso limitado a 100 ms.
- **Primeiro carregamento:** o hero entra por CSS (`Split load` + `.load-rise`), sem esperar o JavaScript. Tempos medidos com `_ferramentas/timing.js`:

| Situação | Título completo | Botões completos |
|---|---|---|
| Visita seguinte (sem intro) | 0,68 s | 0,83 s |
| 1ª visita (com intro) | 0,99 s | 1,17 s |
| Movimento reduzido | 0,12 s | 0,12 s |
| Capa da página de projeto | 0,55–0,59 s | — |

- **Intro** (`Intro.astro`):
  - roda só na primeira visita da sessão (`sessionStorage kz-intro`) e nunca com movimento reduzido;
  - sequência: o octógono se desenha (0,55 s), o K aparece (a partir de 0,3 s), a marca sai com escala 1.12 (0,56 s) e a tela se abre em duas metades Noite (0,62 → 1,1 s);
  - `html.intro` define `--intro: 320ms`, que atrasa o hero e a peça para entrarem junto com a abertura.
- **Peça do hero:**
  - cada anel se desenha em 1,4 s, com 140 ms entre eles;
  - depois gira sem parar (150, 190, 240 e 120 s por volta, alternando o sentido);
  - o ponto central aparece em 1,1 s;
  - parallax pelo mouse: cada camada se desloca `profundidade × 7 px`, com transição de 1,4 s (só com mouse e ≥ 1100 px).
- **Cursor:** o site usa o cursor padrão do sistema (o cursor octogonal da v2 foi removido a pedido do usuário).
- **Botões magnéticos** (`data-magnetic`): seguem o mouse até 10 px na horizontal e 8 px na vertical, e voltam em 0,5 s.
- **Transição entre páginas:** View Transitions nativas (`@view-transition { navigation: auto }`), com saída em 0,32 s e entrada em 0,5 s.
- **Contínuas:**
  - zoom lento do hero (18 s);
  - deriva do padrão (80 s) e luz que respira (16 s), que só rodam com a faixa na tela;
  - rotação da peça do hero;
  - linha "Role";
  - pulso do WhatsApp.
- **RTL:**
  - sublinhados, varreduras e o trilho começam pela direita;
  - as setas espelham;
  - o padrão deriva no sentido oposto.
- **`prefers-reduced-motion`:**
  - tudo aparece de imediato;
  - nenhuma animação contínua;
  - sem intro, sem magnéticos, sem parallax e sem View Transitions;
  - a peça do hero fica desenhada e parada;
  - o processo vira lista;
  - o vídeo não é baixado e fica o pôster;

## 7. Vídeos
- **Hero (em uso):** portal de luz com névoa, 10 s em loop, fornecido pelo usuário. Arquivos: `hero-desktop.mp4` (1664×936, 16:9, 1,4 MB), `hero-mobile.mp4` (720×1280, corte central 9:16, 751 KB) e `hero-poster.webp` (13 KB), comprimidos com o ffmpeg do pacote Python `imageio-ffmpeg` (libx264, CRF 21/24, sem áudio, faststart).
- **Tratamento no hero** (`home.css`):
  - filtro `sepia(1) brightness(.5) saturate(2) hue-rotate(-12deg) contrast(1.15)`, que leva o branco do portal para um dourado baixo e mantém o K e os anéis legíveis;
  - no desktop, o vídeo é deslocado (`--art-shift`, com a mesma fórmula de posição da `.ha`) para o portal ficar exatamente atrás da peça de octógonos, com o K "dentro" da porta; a borda de entrada some no Noite com máscara em gradiente;
  - scrim próprio: escurece à esquerda (texto) e embaixo; no celular, escurece mais atrás do texto.
- Arquivos em `public/videos`: `hero`, `sobre`, `servicos`, `trabalhos`, `processo` e `contato`, cada um com `-desktop.mp4`, `-mobile.mp4` e `-poster.webp`.
- **Carregamento:**
  - o vídeo carrega a 300 px da tela e pausa fora dela;
  - usa o corte 9:16 abaixo de 768 px;
  - aparece com fade de 1,2 s quando começa a tocar.
- **Quando não carrega:** movimento reduzido, economia de dados e 2G/3G ficam com o pôster.
- **Especificação:**

| | Desktop | Mobile |
|---|---|---|
| Formato | 1920×1080 | 720×1280 |
| Duração | loop de 8–12 s | loop de 6–8 s |
| Peso | hero ≤ 2,5 MB; demais ≤ 1,5 MB | hero ≤ 800 KB; demais ≤ 500 KB |

  Todos em H.264, sem áudio. O pôster WebP tem no máximo 120 KB.

## 8. Idiomas e SEO
- As rotas `/pt/`, `/en/` e `/ar/` saem de `pages/[lang]`, e `BUILD_LANGS` em `lib/config.ts` controla o que é publicado (hoje os três). Textos próprios do site em `i18n/site-{pt,en,ar}.json`.
- **RTL:** a peça do hero usa só `inset-inline-end` (fica oposta ao texto nos dois sentidos); números compostos como "03 / 05" vão em `.ltr`; o mockup de projeto (`.pj__stage`) é sempre LTR, porque mostra sites em LTR.
- **Detecção de idioma:**
  - na raiz, o `_redirects` da Netlify usa o `Accept-Language`;
  - como reserva, um script JS considera a escolha salva, o `?lang=` e o idioma do navegador.
- **SEO:**
  - `hreflang` para cada idioma publicado + x-default;
  - title e description por idioma;
  - Open Graph;
  - JSON-LD `Organization`: e-mail e Instagram entram quando forem preenchidos em `lib/config.ts`.
- **Textos:** os PT/EN/AR vêm de `i18n/portfolio-*.json` (os mesmos do PDF) mais `i18n/site-*.json`.

## 9. Conferência e medições
Ferramentas em `_ferramentas/`, todas contra `node _ferramentas/serve_dist.js 4321`. A pasta tem um `package.json` próprio (CommonJS + Playwright), porque o projeto é `"type": "module"`.

| Script | Uso |
|---|---|
| `section_caps.js` + `resumo.py` | Uma captura por seção (desktop 1440 e celular 390, com hovers) e as folhas-resumo em `capturas/v2/` |
| `video.js` | Vídeo da Home em 1440×900 (intro, hero com mouse, rolagem até o Contato) → `capturas/v2/home-pt-desktop.webm`. O ffmpeg do Playwright só gera VP8/PNG; o GIF é montado com PIL a partir dos quadros. |
| `timing.js`, `measure.js` | Tempo até o título e os botões aparecerem; altura de cada seção |
| `lh.mjs <url> mobile\|desktop` | Lighthouse |

**Lighthouse da v2** (servidor local, 25/09/2026):

| Página | Mobile (perf · acess. · boas práticas · SEO) | Desktop |
|---|---|---|
| Home | 98–99 · 100 · 100 · 100 | 100 nas quatro (6 de 6 execuções) |
| Projeto (Ambrevel) | 99 · 100 · 100 · 100 | 100 nas quatro |
