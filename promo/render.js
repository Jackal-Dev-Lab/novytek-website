const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const { spawn } = require('child_process');
const FPS = 30, DUR = 15;
const mode = process.argv[2] || 'preview';
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto('file://' + __dirname + '/promo.html');
  await page.evaluate(async () => { for (const w of [500,600,700,800]) await document.fonts.load(w + ' 50px Montserrat', 'Aé€'); await document.fonts.ready; });
  console.log(await page.evaluate(() => [...document.fonts].map(f => f.family + ' ' + f.weight + ' ' + f.status).join(' | ')));
  const ok = await page.evaluate(() => document.fonts.check('800 50px Montserrat') && [...document.fonts].some(f => f.family.includes('Montserrat') && f.status === 'loaded'));
  console.log('Montserrat chargée :', ok);
  if (!ok) { console.error('Police non chargée, arrêt.'); process.exit(1); }
  if (mode === 'preview') {
    for (const t of process.argv.slice(3).map(Number)) {
      await page.evaluate(t => renderFrame(t), t);
      await page.screenshot({ path: `prev_${t}.png` });
    }
  } else {
    const ff = spawn(process.env.FF, ['-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', 'novytek-promo-15s.mp4'], { stdio: ['pipe', 'inherit', 'inherit'] });
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
