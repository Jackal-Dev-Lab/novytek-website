// Rend promo.html image par image (30 i/s, 15 s) et encode en MP4 H.264.
// Usage : FF=/chemin/ffmpeg node render.js full   |   node render.js preview 1 2.5 ...
const { chromium } = require(process.env.PW || '/opt/node22/lib/node_modules/playwright');
const { spawn } = require('child_process');
const FPS = 30, DUR = 15;
const mode = process.argv[2] || 'preview';
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: +(process.env.VW || 1080), height: +(process.env.VH || 1920) } });
  await page.goto('file://' + __dirname + '/' + (process.env.PAGE || 'promo.html') + '');
  await page.evaluate(async () => {
    for (const f of ['800 50px "Bricolage Grotesque"', '700 50px "Bricolage Grotesque"', '500 50px Figtree', '600 50px Figtree', '700 50px Figtree'])
      await document.fonts.load(f, 'Aé€');
    await document.fonts.ready;
  });
  const ok = await page.evaluate(() => ['Bricolage Grotesque', 'Figtree'].every(fam => [...document.fonts].some(f => f.family.replace(/"/g, '') === fam && f.status === 'loaded')));
  console.log('Polices chargées :', ok);
  if (!ok) { console.error('Police non chargée, arrêt.'); process.exit(1); }
  if (mode === 'preview') {
    for (const t of process.argv.slice(3).map(Number)) {
      await page.evaluate(t => renderFrame(t), t);
      await page.screenshot({ path: `prev_${t}.png` });
    }
  } else {
    const ff = spawn(process.env.FF, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', process.env.OUT || 'novytek-promo-15s.mp4'], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let i = 0; i < FPS * DUR; i++) {
      await page.evaluate(t => renderFrame(t), i / FPS);
      const buf = await page.screenshot({ type: 'png' });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
  }
  await browser.close();
})();
