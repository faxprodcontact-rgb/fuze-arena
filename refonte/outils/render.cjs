// Rendu de fichiers SVG ou HTML en PNG pour vérifier un dessin.
// node render.cjs out.png fichier1.svg [fichier2.svg ...] [--bg=#241f4f] [--h=300]   → les SVG côte à côte
// node render.cjs out.png page.html --w=390 --hh=844                                   → une page HTML (taille du téléphone)
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const args = process.argv.slice(2), out = path.resolve(args.shift());
  const opt = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => a.slice(2).split('=')));
  const files = args.filter(a => !a.startsWith('--')).map(f => path.resolve(f));
  const b = await chromium.launch();
  const errs = [];
  if (files.length === 1 && /\.html?$/.test(files[0])) {
    const p = await b.newPage({ viewport: { width: +(opt.w || 390), height: +(opt.hh || 844) }, deviceScaleFactor: 2 });
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
    await p.goto('file://' + files[0]); await p.waitForTimeout(800);
    await p.screenshot({ path: out, fullPage: true });
  } else {
    const h = +(opt.h || 300), bg = opt.bg || '#241f4f';
    const html = `<!doctype html><body style="margin:0;padding:16px;background:${bg};display:flex;gap:24px;align-items:flex-end;flex-wrap:wrap">` +
      files.map(f => `<div style="text-align:center;color:#fff;font:12px sans-serif"><img src="file://${f}" style="height:${h}px"><br>${path.basename(f)}</div>`).join('') + '</body>';
    const tmp = path.join(path.dirname(out), '.render-tmp.html'); fs.writeFileSync(tmp, html);
    const p = await b.newPage({ viewport: { width: Math.max(400, files.length * (h * 0.9 + 24) + 40), height: h + 70 }, deviceScaleFactor: 2 });
    p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + tmp); await p.waitForTimeout(500);
    await p.screenshot({ path: out, fullPage: true });
    fs.unlinkSync(tmp);
  }
  // contrôle : le SVG est bien formé (sinon l'image ne s'affiche pas)
  for (const f of files.filter(f => f.endsWith('.svg'))) {
    const s = fs.readFileSync(f, 'utf8');
    if (!/^\s*<svg[\s>]/.test(s) || !/<\/svg>\s*$/.test(s)) errs.push(`${path.basename(f)} : doit commencer par <svg et finir par </svg>`);
    if (/<style|<script|@keyframes|<animate|<image|<text|<foreignObject|class=/.test(s)) errs.push(`${path.basename(f)} : contient un élément interdit (style, script, animation, image, text, foreignObject ou class)`);
  }
  console.log(errs.length ? 'PROBLÈMES : ' + errs.join(' | ') : 'OK', '→', out);
  await b.close();
})();
