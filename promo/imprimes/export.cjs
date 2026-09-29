// Exporte des pages HTML en PDF (vectoriel, polices intégrées) et en PNG 300 DPI.
// Usage : node export.cjs page.html:largeur_mm:hauteur_mm [...]
// Les fichiers sont servis en HTTP local depuis le dossier parent (pour ../fonts.css).
const { chromium } = require(process.env.PW || '/opt/node22/lib/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png', '.js': 'text/javascript' };
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(f, (e, d) => { if (e) { res.writeHead(404); res.end(); return; } res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); res.end(d); });
});
const MM = 96 / 25.4; // px CSS par mm
(async () => {
  await new Promise(ok => server.listen(0, '127.0.0.1', ok));
  const browser = await chromium.launch();
  for (const arg of process.argv.slice(2)) {
    const [file, wmm, hmm] = arg.split(':');
    const w = Math.round(+wmm * MM), h = Math.round(+hmm * MM);
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 300 / 96 });
    const errs = [];
    page.on('pageerror', e => errs.push(String(e)));
    page.on('response', r => { if (r.status() >= 400) errs.push(`HTTP ${r.status()} ${r.url()}`); });
    await page.goto(`http://127.0.0.1:${server.address().port}/${path.relative(ROOT, path.join(__dirname, file))}`);
    await page.evaluate(async () => { for (const f of ['800 50px "Bricolage Grotesque"', '600 50px Figtree', '700 50px Figtree', '500 50px Figtree']) await document.fonts.load(f, 'Aé€'); await document.fonts.ready; });
    await page.waitForLoadState('networkidle');
    const fontsOk = await page.evaluate(() => ['Bricolage Grotesque', 'Figtree'].every(fam => [...document.fonts].some(f => f.family.replace(/"/g, '') === fam && f.status === 'loaded')));
    const overflow = await page.evaluate(() => { const r = document.querySelector('.page').getBoundingClientRect(); return [...document.querySelectorAll('.page *')].filter(el => { const b = el.getBoundingClientRect(); return b.width && (b.right > r.right + 1 || b.bottom > r.bottom + 1); }).map(el => el.className || el.tagName); });
    if (!fontsOk || errs.length) { console.error(file, 'ERREUR', { fontsOk, errs }); process.exit(1); }
    const base = file.replace(/\.html$/, '');
    await page.pdf({ path: path.join(__dirname, 'out', base + '.pdf'), width: wmm + 'mm', height: hmm + 'mm', printBackground: true, preferCSSPageSize: true });
    await page.screenshot({ path: path.join(__dirname, 'out', base + '-300dpi.png') });
    console.log(`${file} → ${wmm}×${hmm} mm (${Math.round(+wmm / 25.4 * 300)}×${Math.round(+hmm / 25.4 * 300)} px)` + (overflow.length ? `  débordements : ${overflow.join(', ')}` : ''));
    await page.close();
  }
  await browser.close(); server.close();
})();
