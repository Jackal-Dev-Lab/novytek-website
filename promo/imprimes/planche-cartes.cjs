// Planche de comparaison : les 4 slogans sur la carte (recto + verso), en 300 DPI.
const { chromium } = require(process.env.PW || '/opt/node22/lib/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const T = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': T[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); });
(async () => {
  await new Promise(ok => srv.listen(0, '127.0.0.1', ok));
  const b = await chromium.launch(); const out = process.argv[2];
  for (const s of [1, 2, 3, 4]) for (const face of ['recto', 'verso']) {
    const p = await b.newPage({ viewport: { width: 333, height: 219 }, deviceScaleFactor: 300 / 96 });
    await p.goto(`http://127.0.0.1:${srv.address().port}/imprimes/carte2.html#${face}&s=${s}`);
    await p.evaluate(async () => { for (const f of ['800 50px "Bricolage Grotesque"', '600 20px Figtree', '700 20px Figtree']) await document.fonts.load(f); });
    await p.waitForFunction(() => window.READY); await p.waitForLoadState('networkidle');
    await p.screenshot({ path: `${out}/s${s}-${face}.png` }); await p.close();
  }
  await b.close(); srv.close();
})();
