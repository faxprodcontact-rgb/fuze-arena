// Planche de revue des icônes : node tools/ui-planche.cjs out.html [taille-grande] [liste,de,noms]
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..', 'art', 'ui');
const out = path.resolve(process.argv[2] || 'planche.html'), big = +(process.argv[3] || 150);
const names = process.argv[4] ? process.argv[4].split(',') : fs.readdirSync(dir).filter(f => f.endsWith('.svg')).map(f => f.replace('.svg', ''));
const img = (n, h) => `<img src="file://${dir}/${n}.svg" style="height:${h}px;width:${h}px">`;
const row = (bg, h) => `<div style="background:${bg};padding:8px 12px;display:flex;gap:${Math.max(8, h / 3)}px;align-items:center;flex-wrap:wrap">${names.map(n => img(n, h)).join('')}</div>`;
fs.writeFileSync(out, `<!doctype html><body style="margin:0;background:#241f4f;font:12px sans-serif;color:#fff">
<div style="display:flex;flex-wrap:wrap;gap:14px;padding:12px">${names.map(n => `<div style="text-align:center">${img(n, big)}<br>${n}</div>`).join('')}</div>
${row('#241f4f', 48)}${row('#241f4f', 32)}${row('#241f4f', 24)}${row('#e9e4d8', 32)}${row('#e9e4d8', 24)}${row('#3a6b3a', 24)}</body>`);
