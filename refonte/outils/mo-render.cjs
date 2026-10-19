// Variante de render.cjs pour les monstres : fichier temporaire unique (pas de collision avec les autres rendus)
// node mo-render.cjs out.png a.svg b.svg [--h=300 | --scale=1] [--bg=#241f4f] [--zoom=x0,y0,x1,y1 --zw=800]
//  --scale=k : chaque SVG est affiché à (hauteur du viewBox × k) px → même échelle réelle pour tous
//  --zoom    : rend UN seul SVG et recadre sur la zone donnée (coordonnées du viewBox), largeur zw px
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const args = process.argv.slice(2), out = path.resolve(args.shift());
  const opt = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => a.slice(2).split('=')));
  const files = args.filter(a => !a.startsWith('--')).map(f => path.resolve(f));
  const vb = f => fs.readFileSync(f, 'utf8').match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
  const b = await chromium.launch();
  const bg = opt.bg || '#241f4f';
  let html, vw, vh;
  if (opt.zoom) {
    const [x0, y0, x1, y1] = opt.zoom.split(',').map(Number), zw = +(opt.zw || 800), k = zw / (x1 - x0);
    const [, , W, H] = vb(files[0]);
    vw = zw; vh = Math.round((y1 - y0) * k);
    html = `<!doctype html><body style="margin:0;background:${bg};overflow:hidden"><img src="file://${files[0]}" style="position:absolute;left:${-x0 * k}px;top:${-y0 * k}px;width:${W * k}px;height:${H * k}px">`;
  } else {
    const sizes = files.map(f => { const [, , W, H] = vb(f); const h = opt.scale ? H * +opt.scale : +(opt.h || 300); return [W * h / H, h]; });
    vw = Math.max(400, sizes.reduce((a, [w]) => a + w + 24, 40)); vh = Math.max(...sizes.map(s => s[1])) + 60;
    html = `<!doctype html><body style="margin:0;padding:16px;background:${bg};display:flex;gap:24px;align-items:flex-end">` +
      files.map((f, i) => `<div style="text-align:center;color:#fff;font:12px sans-serif"><img src="file://${f}" style="height:${sizes[i][1]}px;width:${sizes[i][0]}px"><br>${path.basename(f)}</div>`).join('') + '</body>';
  }
  const tmp = path.join(path.dirname(out), `.mo-tmp-${process.pid}-${Date.now()}.html`); fs.writeFileSync(tmp, html);
  const p = await b.newPage({ viewport: { width: Math.ceil(vw), height: Math.ceil(vh) }, deviceScaleFactor: opt.dpr ? +opt.dpr : 2 });
  await p.goto('file://' + tmp); await p.waitForTimeout(400);
  await p.screenshot({ path: out, fullPage: !opt.zoom });
  fs.unlinkSync(tmp);
  console.log('OK →', out);
  await b.close();
})();
