// Capture l'aperçu des décors (refonte/apercu-decors.html) en PNG.
// Il faut un serveur sur la racine du dossier : python3 -m http.server 8091
// node refonte/outils/apercu-decors.cjs out.png [forest,cave,…]
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const path = require('path');
(async () => {
  const [out, list] = process.argv.slice(2);
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 1060, height: 900 }, deviceScaleFactor: 1 });
  const errs = [];
  pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => (m.type() === 'error' || m.type() === 'warning') && errs.push(m.text()));
  await pg.goto(`http://localhost:8091/refonte/apercu-decors.html?nc=${Date.now()}${list ? '&t=' + list : ''}`);
  await pg.waitForFunction(() => document.title === 'ok', null, { timeout: 30000 }).catch(() => errs.push('délai dépassé'));
  await pg.screenshot({ path: path.resolve(out), fullPage: true });
  console.log(errs.length ? 'PROBLÈMES : ' + errs.join(' | ') : 'OK', '→', out);
  await b.close();
})();
