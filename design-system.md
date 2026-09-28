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

## 2. Tipografia (sistema editorial, 27/09/2026)

Tokens em `global.css` (`--fs-*`, `--lh-*`, `--ls-*`). Escala modular: celular (390 px) base 17 × 1,25; desktop (1440 px) base 18 × 1,333, arredondada. Cada nível tem **um** tamanho, **uma** entrelinha e **um** espaçamento; nenhum componente define tamanho próprio de título.

| Nível | Classe | Tamanho (390 → 1440) | Entrelinha | Espaçamento | Uso |
|---|---|---|---|---|---|
| display | `.display` | 56 → 128 px | .96 | −.02em | Só o título do hero |
| h1 | `.h1` | 48 → 100 px | .98 | −.02em | Capa da página de projeto e de "obrigado" |
| h2 | `.h2` | 38 → 76 px | 1.02 | −.02em | Títulos de seção, título da etapa do Processo (desktop), título do projeto em destaque, "Próximo projeto" |
| h3 | `.h3` | 26,5 → 32 px | 1.12 | −.01em | Itens do Sobre e do Por que nós, cards de Serviços, cards de projeto, blocos da página de projeto, contato, etapa do Processo no carrossel |
| lead | `.lead` | 19 → 22 px | 1.5 | — | Parágrafo de abertura (hero, bandas); maior e mais escuro (Noite no claro, Marfim no escuro) |
| body | (padrão) | 17 → 18 px | 1.6 | — | Texto corrido, até 64ch, `text-wrap: pretty` |
| small | `.small` / menu | 14 px | 1.5 | .01em | Menu, notas, "Voltar", rodapé |
| micro | `.label` | 11 px, caixa alta | 1.3 | .18em | Rótulos de campo, tags, chips, trilho do Processo, seletor de idioma |
| botão | `.btn` | 15 px, peso 500, caixa normal | 1 | .01em | Todos os botões, sempre com seta; "Ver projeto" segue o mesmo estilo |
| número | `.num` | 22 → 26 px | 1 | — | 01, 02, 03 em todas as seções, alinhado pela linha de base com o h3 |

**Fontes**
- Títulos: **Prata** 400.
- Destaques `<i>`: **Noto Serif Display Italic 400** (`nsd-italic-400.woff2`, recortada do arquivo oficial do Google Fonts, 21 KB) com `size-adjust: 96,6%`, que iguala a altura de x da Prata (0,518 / 0,536). Mesmo peso de tinta; o peso 300 anterior e a variação com traço reforçado foram descartados (comparação em `capturas/v2/tipografia/italico-A-B.png`).
- Texto: Albert Sans. Árabe: Reem Kufi (títulos, a 90%) e IBM Plex Sans Arabic (texto), na mesma escala, com entrelinhas maiores (1.25–1.8) e sem espaçamento entre letras; o itálico vira Reem Kufi champanhe sem inclinação.
- **Reservas calibradas** (sem pulo de layout quando a fonte chega): Prata → Georgia 108,65% / Times 119,2%; NSD → Georgia Italic 98,7%; Albert → Arial com métricas; Reem Kufi → Arial 101,7%; Plex Arabic → Arial 111,1% com `ascent/descent-override`.

**Regras de título**
- `text-wrap: balance` em todos os títulos.
- O destaque em itálico sempre começa em linha nova nos níveis display/h1/h2 (`i { display: block }`).
- `split()` em `lib/i18n.ts` prende palavras de até 2 letras à seguinte com espaço não separável ("à primeira", "to be").

**Rótulo de seção** (`components/Eyebrow.astro`): número em itálico serifado + traço fino de 28 px + nome em caixa normal, 14 px ("01 — Sobre nós"). Numeração da Home: 01 Sobre, 02 Serviços, 03 Projetos, 04 Processo, 05 Por que nós, 06 Contato. Sem número (hero, "Capturas", "Próximo projeto", "obrigado"), o marcador é um octógono de linha de 9 px.

**Cores de texto no claro (WCAG AA)**: `--texto` #4F4B45 (7,6:1 Marfim / 6,5:1 Linho) para texto corrido; `--texto-2` #625D56 (5,7 / 4,9) para secundário; `--champ-ink` #6E5836 (5,9 / 5,1) para números e rótulos. As regras gerais usam `:where()` (especificidade zero) para não sobrepor componentes escuros.

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
| Rótulo de seção | `components/Eyebrow.astro` | Ver seção 2. |
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

## 10. Entradas: fail-safe e `?motion=on`
- **Nada fica em branco:** `scripts/reveal.ts` usa o IntersectionObserver e, além dele, uma varredura (rolagem, `scrollend`, clique em âncora, `hashchange` e 1,2 s após carregar) que revela tudo que já está na altura da tela. No Processo fixado, os textos passam a ser controlados só pelo GSAP (entram visíveis). Teste: `node _ferramentas/ancoras.js [pt|en|ar]` clica em cada link do menu e dá saltos de rolagem, no desktop e no celular.
- **Efeitos no celular:** a peça do hero tem os 4 anéis que se desenham e giram também abaixo de 1100 px (sem o K, que ficaria atrás do título); o giro contínuo começa 3 s depois, para aliviar a CPU no carregamento.
- **Efeitos sempre ligados (28/09/2026, pedido do usuário, como no site da Ülia Media):** `html.motion-on` é aplicada por padrão em todos os aparelhos, inclusive com "reduzir movimento" ativo. Só `?motion=off` desliga (fica salvo no aparelho em `localStorage kz-motion`); `?motion=on` volta a ligar. As regras `prefers-reduced-motion` do CSS continuam escopadas com `html:not(.motion-on)` e `reduced()` respeita a classe.
- **Celular e tablet** (abaixo de 1100 px), com os efeitos ligados, recebem tudo o que antes era exclusivo do desktop:
  - peça do hero completa, com o K e os anéis girando desde o início, acima do título (`min(50vw, 300px)`); sem mouse, as camadas flutuam sozinhas nas mesmas profundidades do parallax (`drift` em `hero-art.ts`);
  - Processo com os capítulos fixados (GSAP) em uma coluna, trilho sem rótulos e terminando antes do botão do WhatsApp (`process.ts`, `QUERY`);
  - Projetos: a página rola dentro do mockup quando o card está na tela (`.pj.is-playing`, em `projects.ts`), no lugar do hover;
  - Serviços: o card aberto mostra a foto de fundo, no lugar do hover.
  Com `?motion=off`, o celular volta à versão leve (peça sem o K, carrossel no Processo).

## 11. Backend e segurança
O site é estático (Astro → `dist/`) servido por um **Cloudflare Worker** (`worker/`, configurado em `wrangler.jsonc`). O Worker só entra em duas rotas; todo o resto é arquivo estático.

| Rota | O que faz |
|---|---|
| `GET /` | Redireciona para `/pt/`, `/en/` ou `/ar/` (`?lang=` válido → `Accept-Language` com peso q → PT). Substitui o `_redirects` da Netlify. |
| `POST /api/contato` | Formulário de contato (`worker/contato.ts`). |

**Camadas do formulário** (qualquer falha encerra sem enviar):
1. Só `POST`, só do próprio site (`Origin` e `Sec-Fetch-Site`, contra CSRF), só formulário (`415` para outros tipos), corpo de até 16 KB (`413`), nenhum arquivo aceito.
2. Limite de 5 envios por minuto por IP (binding `LIMITER`). Se o serviço de limite falhar, segue, porque o Turnstile continua obrigatório.
3. Campo-armadilha `empresa` (invisível): quem preenche recebe "ok" e nada é enviado.
4. Validação e limpeza: nome 2–100, e-mail válido até 254, mensagem 10–4000; remove caracteres de controle e invisíveis de direção; nome e e-mail sem quebra de linha (sem injeção de cabeçalho).
5. **Cloudflare Turnstile** verificado no servidor, com `action` e, em produção, `TURNSTILE_HOSTNAME`. Sem o segredo configurado, recusa tudo (fail closed).
6. Envio só em texto puro, com o e-mail do visitante em `Reply-To` (nunca em `From`) e assunto codificado (RFC 2047). Entrega pelo **Email Routing da Cloudflare** (binding `MAIL`) ou pela Resend (`RESEND_API_KEY`).
- Nada é gravado; o log registra só o resultado (`ok`, `captcha`, `rate`…), nunca nome, e-mail ou mensagem.
- No site: Turnstile carregado só quando o formulário se aproxima; envio sem recarregar a página, com mensagens nos 3 idiomas; aviso de privacidade; sem JavaScript, aparece o convite para o WhatsApp. O formulário só existe no HTML se `PUBLIC_TURNSTILE_SITEKEY` estiver definido no build (a prévia do GitHub Pages sai sem formulário).

**Cabeçalhos** (`dist/_headers`, gerado por `scripts/security-headers.mjs` a cada `npm run build`):
- `Content-Security-Policy`: scripts só do próprio site, do Turnstile e os 2 scripts embutidos, liberados pelo hash SHA-256; `frame-ancestors 'none'`, `base-uri 'none'`, `object-src 'none'`, `form-action 'self'`.
- `Strict-Transport-Security` (1 ano, subdomínios), `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Cross-Origin-Opener-Policy`, `Permissions-Policy` (câmera, microfone, localização, pagamento, USB e tópicos desligados).
- Observações aceitas: `style-src 'unsafe-inline'` (estilos embutidos e variáveis CSS; não executam código) e HSTS sem `preload` até o domínio definitivo estar no ar.

**Testes**: `node scripts/testa-contato.mjs http://127.0.0.1:8787` com o Worker local rodando (17 casos: métodos, CSRF, tipos, tamanho, injeção de cabeçalho, arquivos, armadilha, Turnstile, limite por IP, envio válido). Chaves de teste públicas do Turnstile: site `1x00000000000000000000AA`, segredo `1x0000000000000000000000000000000AA` (sempre aprova) ou `2x0000000000000000000000000000000AA` (sempre reprova), no `.dev.vars` (fora do git).

**Em produção desde 28/09/2026** em https://kalenzadigital.com (Worker `kalenza-digital`, domínios `kalenzadigital.com` e `www.kalenzadigital.com`). Atualizar o site: `npm run deploy`. Os passos abaixo ficam como referência para refazer a configuração.

**Publicar na Cloudflare** (referência):
1. Domínio na Cloudflare; no painel, **Turnstile** → criar widget para o domínio → copiar a chave do site e a secreta.
2. **Email Routing** → ativar no domínio e verificar o e-mail que recebe as mensagens; no `wrangler.jsonc`, descomentar `send_email` e preencher `CONTACT_TO`, `CONTACT_FROM` (ex.: `site@dominio`) e `TURNSTILE_HOSTNAME`.
3. `wrangler secret put TURNSTILE_SECRET` (o segredo nunca vai para o repositório).
4. Build com `PUBLIC_TURNSTILE_SITEKEY=<chave do site> npm run build` e `wrangler deploy`; ligar o domínio ao Worker (Custom Domain).
5. Recomendado: 2FA nas contas Cloudflare e GitHub; regra de WAF/Rate Limiting para `/api/contato`; depois de estável, HSTS com `preload` e inscrição em hstspreload.org.
