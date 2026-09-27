# Imagens de apoio do site (Sobre, Por que nós, cards de Serviços) e páginas inteiras das demos
# para a prévia com rolagem automática nos cards de projeto.
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from lp import lp
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'public', 'img')
os.makedirs(lp(os.path.join(OUT, 'apoio')), exist_ok=True)


def crop_ratio(im, rw, rh, fy=0.5):
    w, h = im.size
    if w / h > rw / rh:
        nw = round(h * rw / rh)
        x = (w - nw) // 2
        return im.crop((x, 0, x + nw, h))
    nh = round(w * rh / rw)
    y = round((h - nh) * fy)
    return im.crop((0, y, w, y + nh))


def save(im, name, widths, q=76):
    for wd in widths:
        im.resize((wd, round(im.height * wd / im.width)), Image.LANCZOS).save(
            lp(os.path.join(OUT, 'apoio', f'{name}-{wd}.webp')), quality=q, method=6)


SRC = os.path.join(HERE, 'pexels-site')
APOIO = {  # nome: (id Pexels, proporção, posição vertical do corte, larguras)
    'sobre': ('16495457-limpa', (4, 5), 0.66, (560, 1000)),  # estúdio com luz dourada (logo do equipamento removido)
    'porque': ('18899950-limpa', (16, 9), 0.67, (800, 1600)),  # estúdio escuro (logo e saco verde retocados)
    'svc-sites': ('28608611', (4, 3), 0.35, (720,)),
    'svc-identidade': ('6638269', (4, 3), 0.5, (720,)),
    'svc-design': ('20490986', (4, 3), 0.5, (720,)),
    'svc-estrategia': ('38538541', (4, 3), 0.7, (720,)),
}
for name, (pid, (rw, rh), fy, widths) in APOIO.items():
    im = Image.open(os.path.join(SRC, f'f{pid}.jpg')).convert('RGB')
    save(crop_ratio(im, rw, rh, fy), name, widths)

# páginas inteiras das demos (capturadas em work/demo-full) → prévia com rolagem
os.makedirs(lp(os.path.join(OUT, 'projetos')), exist_ok=True)
for k in ('marvessa', 'ambrevel', 'ondessa', 'ardelis'):
    p = os.path.join(HERE, 'demo-full', f'{k}.png')
    if not os.path.exists(p):
        continue
    im = Image.open(p).convert('RGB')
    wd = 720
    im = im.resize((wd, round(im.height * wd / im.width)), Image.LANCZOS)
    im = im.crop((0, 0, wd, min(im.height, 4200)))  # limite de altura: arquivo leve
    im.save(lp(os.path.join(OUT, 'projetos', f'{k}-full-720.webp')), quality=70, method=6)

for d in ('apoio', 'projetos'):
    fs = sorted(os.listdir(lp(os.path.join(OUT, d))))
    for f in fs:
        if d == 'apoio' or 'full' in f:
            im = Image.open(lp(os.path.join(OUT, d, f)))
            print(d, f, im.size, os.path.getsize(lp(os.path.join(OUT, d, f))) // 1024, 'KB')
