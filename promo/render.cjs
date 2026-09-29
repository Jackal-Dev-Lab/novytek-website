// Rend une page d'animation image par image (FPS=30 par défaut, durée = window.DURATION ou 15 s) et encode en MP4 H.264.
// Extension .cjs : le package.json du site est en "type": "module".
// Usage (depuis promo/) : FF=/chemin/ffmpeg [PAGE=variantes/pub-xxx.html] [VW=1920 VH=1080] [OUT=sortie.mp4] [CUES=reperes.json] node render.cjs full
//                        node render.cjs preview 1 2.5 ...
// La page est servie en HTTP local (nécessaire aux modules JS de la version 3D) ; WebGL passe par SwiftShader.
// Si la page définit window.READY = false, le rendu attend qu'elle passe à true.
const { chromium } = require(process.env.PW || '/opt/node22/lib/node_modules/playwright');
const { spawn } = require('child_process');
const http = require('http'), fs = require('fs'), path = require('path');
const FPS = +(process.env.FPS || 30);
let DUR = 15; // remplacé par window.DURATION si la page le définit
const mode = process.argv[2] || 'preview';
const ROOT = path.resolve(process.env.ROOT || __dirname);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(f, (err, data) => {
    if (err) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
    res.end(data);
  });
});
(async () => {
  await new Promise(ok => server.listen(0, '127.0.0.1', ok));
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: +(process.env.VW || 1080), height: +(process.env.VH || 1920) } });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  page.on('requestfailed', r => errs.push('Ressource introuvable : ' + r.url()));
  page.on('response', r => { if (r.status() >= 400) errs.push(`HTTP ${r.status()} : ${r.url()}`); });
  await page.goto(`http://127.0.0.1:${server.address().port}/${process.env.PAGE || 'promo.html'}`);
  await page.evaluate(async () => {
    for (const f of ['800 50px "Bricolage Grotesque"', '700 50px "Bricolage Grotesque"', '500 50px Figtree', '600 50px Figtree', '700 50px Figtree'])
      await document.fonts.load(f, 'Aé€');
    await document.fonts.ready;
  });
  await page.waitForFunction(() => window.READY !== false && typeof window.renderFrame === 'function', null, { timeout: 60000 });
  const ok = await page.evaluate(() => ['Bricolage Grotesque', 'Figtree'].every(fam => [...document.fonts].some(f => f.family.replace(/"/g, '') === fam && f.status === 'loaded')));
  console.log('Polices chargées :', ok);
  if (!ok) { console.error('Police non chargée, arrêt.'); process.exit(1); }
  if (errs.length) { console.error('Erreurs au chargement :', errs); process.exit(2); }
  DUR = await page.evaluate(() => window.DURATION) || 15;
  if (process.env.CUES) {
    const cues = await page.evaluate(() => ({ duration: window.DURATION, pad: window.PAD, sfx: window.SFX, vo: window.VO }));
    fs.writeFileSync(process.env.CUES, JSON.stringify(cues, null, 1));
    console.log('Repères écrits :', process.env.CUES, '(' + (cues.sfx || []).length + ' sons, ' + (cues.vo || []).length + ' phrases)');
  }
  if (mode === 'preview') {
    for (const t of process.argv.slice(3).map(Number)) {
      await page.evaluate(t => renderFrame(t), t);
      await page.screenshot({ path: `prev_${t}.png`, omitBackground: !!process.env.ALPHA });
    }
  } else {
    // ALPHA=1 : fond transparent, export ProRes 4444 avec couche alpha (.mov)
    const enc = process.env.ALPHA
      ? ['-c:v', 'prores_ks', '-profile:v', '4444', '-pix_fmt', 'yuva444p10le', '-alpha_bits', '16', '-vendor', 'apl0']
      : ['-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'];
    const ff = spawn(process.env.FF, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
      ...enc, process.env.OUT || 'novytek-promo-15s.mp4'], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let i = 0; i < FPS * DUR; i++) {
      await page.evaluate(t => renderFrame(t), i / FPS);
      const buf = await page.screenshot({ type: 'png', omitBackground: !!process.env.ALPHA });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
  }
  if (errs.length) { console.error('Erreurs JS :', errs); process.exit(2); }
  await browser.close();
  server.close();
})();
