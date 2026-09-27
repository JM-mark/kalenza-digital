# Monta as folhas-resumo de capturas/v2 a partir das capturas por seção (rodar depois do section_caps.js).
#   python resumo.py  →  resumo-desktop-1.jpg, resumo-desktop-2.jpg (2×3, 720×450) e resumo-mobile.jpg (5×2, 390×844)
import glob, os
from PIL import Image
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'capturas', 'v2')
GAP, BG = 12, (138, 133, 125)
def sheet(files, cols, rows, w, h, out):
    im = Image.new('RGB', (cols * w + (cols - 1) * GAP, rows * h + (rows - 1) * GAP), BG)
    for k, f in enumerate(files):
        im.paste(Image.open(f).convert('RGB').resize((w, h), Image.LANCZOS), ((k % cols) * (w + GAP), (k // cols) * (h + GAP)))
    im.save(os.path.join(D, out), quality=86)
dk = sorted(glob.glob(os.path.join(D, 'desktop-*.png')))
mb = sorted(glob.glob(os.path.join(D, 'mobile-*.png')))
sheet(dk[:6], 2, 3, 720, 450, 'resumo-desktop-1.jpg')
sheet(dk[6:12], 2, 3, 720, 450, 'resumo-desktop-2.jpg')
sheet(mb[:10], 5, 2, 390, 844, 'resumo-mobile.jpg')
print(len(dk), 'desktop ·', len(mb), 'mobile')
