# Converte as capturas de ulia_caps.js nas imagens do case Ülia Media (public/img/projetos/ulia-*.webp).
# A prévia com rolagem para antes da seção de cases (nomes de eventos e marcas atendidas) e das fotos com pessoas.
import os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'ulia-shots')
OUT = os.path.join(HERE, '..', 'public', 'img', 'projetos')
CORTE_FULL = 4335  # topo da seção "Marcas em movimento" (cases) na versão animada, página de 1440 px


def webp(im, name, w, q=76):
    im = im.convert('RGB').resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    im.save(os.path.join(OUT, f'ulia-{name}.webp'), quality=q, method=6)
    print(f'ulia-{name}.webp', im.size)
    return im.size


hero = Image.open(os.path.join(SRC, 'hero.png'))
webp(hero, 'hero-1600', 1600)
webp(hero, 'hero-800', 800)
webp(Image.open(os.path.join(SRC, 'mobile.png')), 'm-480', 480)
import json
full = Image.new('RGB', (1440, CORTE_FULL))
for f, y in json.load(open(os.path.join(SRC, 'tiles.json'))):
    full.paste(Image.open(f).convert('RGB'), (0, y))  # scrollY real de cada tela (a última pode ter parado antes)
webp(full, 'full-720', 720, q=70)
webp(Image.open(os.path.join(SRC, 'sobre.png')), 'sobre-1400', 1400)
webp(Image.open(os.path.join(SRC, 'servicos.png')), 'servicos-1400', 1400)
