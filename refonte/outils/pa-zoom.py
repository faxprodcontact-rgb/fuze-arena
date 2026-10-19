import sys, subprocess, os
from PIL import Image
# usage: pa-zoom.py svg out_prefix x0 y0 x1 y1 [...]  (coordonnées du viewBox)
R = os.path.dirname(os.path.abspath(__file__))
svg, pre = os.path.abspath(sys.argv[1]), sys.argv[2]
big = os.path.join(R, '..', 'previews', '.pa-big.png')
subprocess.run(['node', os.path.join(R, 'render.cjs'), big, svg, '--h=1200'], check=True, capture_output=True)
im = Image.open(big); s = 8; o = 32
a = list(map(float, sys.argv[3:]))
for k in range(0, len(a), 4):
    x0, y0, x1, y1 = a[k:k+4]
    im.crop((o+int(x0*s), o+int(y0*s), o+int(x1*s), o+int(y1*s))).save(f'{pre}{k//4}.png')
