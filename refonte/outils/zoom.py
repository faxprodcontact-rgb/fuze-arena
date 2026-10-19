import sys, subprocess
from PIL import Image
# usage: zoom.py svg out_prefix x0 y0 x1 y1 [...]
svg, pre = sys.argv[1], sys.argv[2]
subprocess.run(['node','tools/render.cjs','previews/.big.png',svg,'--h=1200'],check=True,capture_output=True)
im=Image.open('previews/.big.png'); s=8; o=32
a=list(map(float,sys.argv[3:]))
for k in range(0,len(a),4):
    x0,y0,x1,y1=a[k:k+4]
    im.crop((o+int(x0*s),o+int(y0*s),o+int(x1*s),o+int(y1*s))).save(f'{pre}{k//4}.png')
