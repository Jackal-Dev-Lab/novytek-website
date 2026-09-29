// Kit commun des pubs NovyTek : outils d'animation, décor, transitions, carton de fin,
// et repères (sons + voix off) exportés pour le mixage.
// À charger après le balisage de #stage, avant le script de la variante.

const W = window.innerWidth || 1080, H = window.innerHeight || 1920;
const VERT = H >= W;
document.body.classList.add(VERT ? "v" : "h");

// ---------- Outils ----------

// Logo « Pli » : la barre gauche monte, la diagonale se déplie, la barre droite apparaît (d de 0 à 1)
function pliFrame(d) {
  const c = x => Math.min(1, Math.max(0, x));
  const k1 = c(d / 0.35), k2 = c((d - 0.25) / 0.45), k3 = c((d - 0.55) / 0.45);
  const sy = (id, k, y) => document.getElementById(id).setAttribute("transform", `translate(0 ${y}) scale(1 ${Math.max(0.0001, k)}) translate(0 ${-y})`);
  sy("plL", k1, 42); sy("plH", k1, 42); sy("plD", k2, 6); sy("plR", k3, 42);
  document.getElementById("plS").setAttribute("opacity", String(0.55 * Math.min(k2, k3)));
  document.getElementById("plH").setAttribute("opacity", String(0.35 * k2));
}
const $ = id => document.getElementById(id);
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const p = (t, a, b) => clamp((t - a) / (b - a));
const eOut = x => 1 - Math.pow(1 - x, 3);
const eIn = x => x * x * x;
const eIO = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const eBack = x => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const lerp = (a, b, x) => a + (b - a) * x;
const st = (el, o) => Object.assign((typeof el === "string" ? $(el) : el).style, o);
function inOut(el, t, a, b, c, d, { dx = 0, dy = 50, ox = 0, oy = -40, s0 = 1 } = {}) {
  if (typeof el === "string") el = $(el);
  const i = eOut(p(t, a, b)), o = eIn(p(t, c, d));
  st(el, { opacity: i * (1 - o), transform: `translate(${lerp(dx, 0, i) + ox * o}px,${lerp(dy, 0, i) + oy * o}px) scale(${lerp(s0, 1, i)})` });
}
const hex = h => [1, 3, 5].map(k => parseInt(h.slice(k, k + 2), 16));
const mix = (a, b, x) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, k) => Math.round(lerp(v, B[k], x))).join(",")})`; };
// Nombre à la française : espace insécable entre les milliers (l'espace fine est quasi invisible en très gros corps)
const fmt = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
const icon = (name, size, color = "currentColor", sw = 2) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;
function scene(id, t, a, b) { st(id, { display: t >= a && t < b ? "" : "none" }); }

// ---------- Repères exportés (lus par render.cjs) ----------
window.DURATION = 15;
window.SFX = [];   // bruitages : { type, t, ...options }
window.VO = [];    // fenêtres de voix off : { t0, t1, text }
window.PAD = null; // accords de la nappe (noms de notes)
const sfx = (type, t, o = {}) => SFX.push({ type, t: Math.round(t * 1000) / 1000, ...o });
const vo = (t0, t1, text) => VO.push({ t0, t1, text });

// ---------- Titres cinétiques ----------
// Texte : "\n" = retour à la ligne, *mots* = surlignés en bleu clair.
function words(id, text) {
  const el = $(id); let hl = false, i = 0;
  el.innerHTML = text.split("\n").map(line => line.split(" ").filter(Boolean).map(w => {
    if (w.startsWith("*")) { hl = true; w = w.slice(1); }
    const endHl = w.endsWith("*"); if (endHl) w = w.slice(0, -1);
    const s = `<span class="w"><span id="${id}_${i++}" class="${hl ? "hl" : ""}">${w}</span></span>`;
    if (endHl) hl = false;
    return s;
  }).join(" ")).join("<br>");
  el.dataset.n = i;
}
function wordsFrame(id, t, a, step, outA, dur = 0.45) {
  const n = +$(id).dataset.n;
  for (let i = 0; i < n; i++) {
    const s = a + i * step, k = eOut(p(t, s, s + dur)), o = eIn(p(t, outA + i * 0.02, outA + 0.3 + i * 0.02));
    st(`${id}_${i}`, { transform: `translateY(${lerp(110, 0, k) - 110 * o}%)` });
  }
}

// ---------- Décor : halo + bandes (comme le site) ----------
const stage = $("stage");
st(stage, { width: W + "px", height: H + "px" });
const halo = document.createElement("div"); halo.id = "halo";
const stripesEl = document.createElement("div");
stage.prepend(stripesEl); stage.prepend(halo);
const STRIPES = (VERT ? [180, 420, 760, 1010, 1380, 1650, 1830] : [90, 240, 410, 560, 760, 930, 1030])
  .map((y, i) => [y, [0.9, 0.6, 1.1, 0.7, 1.0, 0.8, 0.5][i]]);
STRIPES.forEach(([y], i) => {
  const d = document.createElement("div"); d.className = "stripe"; d.id = "st" + i;
  d.style.top = y + "px"; d.style.width = (VERT ? 900 : 1400) + "px"; stripesEl.appendChild(d);
});
function bgFrame(t) {
  st(halo, { left: (W / 2 - 550 + 160 * Math.sin(t * 0.5)) + "px", top: ((VERT ? 500 : 0) + (VERT ? 300 : 200) * Math.sin(t * 0.33)) + "px" });
  const span = VERT ? 2000 : 3400, off = VERT ? 900 : 1400;
  STRIPES.forEach(([, sp], i) => st("st" + i, { transform: `translateX(${((t * 260 * sp + i * 370) % span) - off}px)` }));
}

// ---------- Carton de fin : logo exact du site + bouton + adresse ----------
const endEl = document.createElement("div"); endEl.className = "scene"; endEl.id = "endcard";
endEl.innerHTML = `
  <div class="abs" id="brandWrap"><div id="brand">
    <svg id="mark" width="200" height="200" viewBox="0 0 48 48"><path id="plR" d="M31 6h9v36h-9z" fill="#0b4f96"/><path id="plD" d="M8 6h9l23 36h-9z" fill="#7cc6fb"/><path id="plS" d="M31 42h9l-5.8-9.1z" fill="#0b4f96" opacity=".55"/><path id="plL" d="M8 6h9v36H8z" fill="#1b8ce3"/><path id="plH" d="M17 6v14.1L8 6z" fill="#7cc6fb" opacity=".35"/></svg>
    <div class="word brand" id="word"><span id="wordIn">novytek</span></div>
  </div></div>
  <div class="abs" id="cta"><span class="btn" id="ctaBtn"></span></div>
  <div class="abs brand" id="url">novytek.fr</div>
  <div class="abs" id="fine">Votre site, <span class="hl">vos règles.</span></div>`;
stage.appendChild(endEl);

// ---------- Balayage de transition (au-dessus de tout) ----------
const sweepEl = document.createElement("div"); sweepEl.id = "sweep";
stage.appendChild(sweepEl);

let SWEEPS = [], END = null;
// Déclare les transitions ; la dernière mène au carton de fin.
function setup({ sweeps, end, cta, pad }) {
  SWEEPS = sweeps; END = end; window.PAD = pad;
  $("ctaBtn").textContent = cta;
  sweeps.forEach((s, k) => sfx("whoosh", s - 0.33, { gain: -12, pan: k % 2 ? -0.4 : 0.4 }));
  const base = end + 0.15;
  sfx("riser", end - 0.85, { gain: -18, dur: 0.9 });
  sfx("pop", base + 0.2, { f: 660, dur: 0.16, gain: -9 });
  sfx("bell", base + 0.8, { f: 1318.5, gain: -16 });
  sfx("bell", base + 0.82, { f: 1975.5, dur: 1.2, gain: -26, pan: 0.3 });
}

function frameCommon(t) {
  bgFrame(t);
  // Balayage : une bande bleue traverse l'écran de bas en haut
  let k = null;
  for (const s of SWEEPS) if (t >= s - 0.25 && t < s + 0.25) k = eIO(p(t, s - 0.25, s + 0.25));
  if (k === null) st(sweepEl, { display: "none" });
  else st(sweepEl, { display: "", top: lerp(H, -H * 0.2, k) + "px", height: (H * 0.2 + 260 * Math.sin(Math.PI * k)) + "px" });
  // Carton de fin
  const on = t >= END;
  st(endEl, { display: on ? "" : "none" });
  if (!on) return;
  const base = END + 0.15;
  st("mark", { transform: `scale(${eBack(p(t, base, base + 0.6))}) rotate(${lerp(-25, 0, eOut(p(t, base, base + 0.6)))}deg)` });
  pliFrame(eIO(p(t, base + 0.35, base + 1.05)));
  const wr = eOut(p(t, base + 0.8, base + 1.5));
  st("word", { width: $("wordIn").offsetWidth * wr + "px", opacity: clamp(wr * 3) });
  st("wordIn", { transform: `translateX(${lerp(-40, 0, wr)}px)` });
  st("brand", { gap: 34 * clamp(wr * 4) + "px" });
  inOut("cta", t, base + 0.75, base + 1.25, 99, 100, { dy: 60, s0: 0.8 });
  if (t > base + 1.25) $("cta").style.transform += ` scale(${1 + 0.025 * Math.sin((t - base - 1.25) * 6)})`;
  inOut("url", t, base + 1.0, base + 1.45, 99, 100, { dy: 40 });
  inOut("fine", t, base + 1.15, base + 1.6, 99, 100, { dy: 30 });
}
