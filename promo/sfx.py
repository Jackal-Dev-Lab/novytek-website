"""Génère les sons d'arrière-plan de la vidéo promo (15 s, 48 kHz, stéréo).

Tout est synthétisé ici (aucun échantillon externe, donc aucun droit à gérer) :
- une nappe d'accords douce en fond,
- des « whoosh » sur les 4 transitions,
- des petits « pops » / clics sur les apparitions d'éléments,
- un « ding » sur le bouton final.
Les instants sont repris de la timeline de promo.html.
Usage : python3 sfx.py sortie.wav
"""
import sys
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 48000
DUR = 15.0
N = int(SR * DUR)
rng = np.random.default_rng(7)
L = np.zeros(N)
R = np.zeros(N)


def db(x):
    return 10 ** (x / 20)


def place(sig, t, gain_db=0.0, pan=0.0):
    """Ajoute sig à l'instant t (s), pan -1 (gauche) .. 1 (droite)."""
    i = int(t * SR)
    if i >= N:
        return
    sig = sig[: N - i] * db(gain_db)
    gl = np.cos((pan + 1) * np.pi / 4)
    gr = np.sin((pan + 1) * np.pi / 4)
    L[i:i + len(sig)] += sig * gl * np.sqrt(2)
    R[i:i + len(sig)] += sig * gr * np.sqrt(2)


def env(n, a, r):
    """Enveloppe attaque linéaire + décroissance exponentielle."""
    t = np.arange(n) / SR
    e = np.exp(-t / r)
    na = max(1, int(a * SR))
    e[:na] *= np.linspace(0, 1, na)
    return e


# ---------- Sons unitaires ----------
def whoosh(d=0.6, f0=300, f1=3500):
    """Bruit filtré passe-bande dont la fréquence monte puis redescend."""
    n = int(d * SR)
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    blk = 512
    for s in range(0, n, blk):
        x = s / n
        fc = f0 + (f1 - f0) * np.sin(np.pi * x) ** 1.5
        sos = butter(2, [max(60, fc * 0.6), min(SR / 2 - 100, fc * 1.4)], btype="band", fs=SR, output="sos")
        out[s:s + blk] = sosfilt(sos, noise[s:s + blk])
    shape = np.sin(np.pi * np.linspace(0, 1, n)) ** 2
    out *= shape
    return out / (np.max(np.abs(out)) + 1e-9)


def pop(f=880, d=0.12):
    """Petit « pop » : sinus avec chute de hauteur rapide."""
    n = int(d * SR)
    t = np.arange(n) / SR
    freq = f * (1 + 1.5 * np.exp(-t / 0.008))
    ph = 2 * np.pi * np.cumsum(freq) / SR
    return np.sin(ph) * env(n, 0.002, 0.03)


def click(f=2400, d=0.04):
    """Clic très court et feutré (type interface)."""
    n = int(d * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) * env(n, 0.0008, 0.006)
    s += 0.3 * rng.standard_normal(n) * env(n, 0.0005, 0.002)
    sos = butter(2, 5000, btype="low", fs=SR, output="sos")
    return sosfilt(sos, s)


def bell(f=1318.5, d=1.6):
    """« Ding » : partiels inharmoniques légers, décroissance longue."""
    n = int(d * SR)
    t = np.arange(n) / SR
    s = np.zeros(n)
    for k, (m, a, r) in enumerate([(1, 1, 0.9), (2.0, 0.35, 0.5), (3.01, 0.18, 0.3), (4.2, 0.08, 0.15)]):
        s += a * np.sin(2 * np.pi * f * m * t + k)
    return s * env(n, 0.003, 0.55)


def blip(f):
    """Blip doux pour les changements de couleur."""
    n = int(0.18 * SR)
    t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)) * env(n, 0.004, 0.05)


def riser(d=0.9):
    """Montée légère avant le logo final."""
    n = int(d * SR)
    w = whoosh(d, 200, 5000)
    fade = np.linspace(0, 1, n) ** 2
    return w * fade


# ---------- Nappe musicale ----------
def pad():
    """Accords doux (Do maj7 -> La m7 -> Fa maj7 -> Sol sus), 3,75 s chacun."""
    chords = [
        [261.63, 329.63, 392.00, 493.88],  # Cmaj7
        [220.00, 261.63, 329.63, 392.00],  # Am7
        [174.61, 220.00, 261.63, 329.63],  # Fmaj7
        [196.00, 261.63, 293.66, 392.00],  # Gsus4
    ]
    t = np.arange(N) / SR
    outL = np.zeros(N)
    outR = np.zeros(N)
    seg = N // 4
    xf = int(0.35 * SR)
    for c, notes in enumerate(chords):
        a = max(0, c * seg - xf)
        b = min(N, (c + 1) * seg + xf)
        tt = t[a:b]
        s_l = np.zeros(b - a)
        s_r = np.zeros(b - a)
        for j, f in enumerate(notes):
            det = 1 + 0.0025 * (j % 2 * 2 - 1)
            # son doux : fondamentale + un peu d'octave, léger vibrato
            vib = 1 + 0.002 * np.sin(2 * np.pi * 4.5 * tt + j)
            s_l += np.sin(2 * np.pi * f * det * vib * tt) + 0.25 * np.sin(4 * np.pi * f * tt)
            s_r += np.sin(2 * np.pi * f / det * vib * tt + 0.7) + 0.25 * np.sin(4 * np.pi * f * tt + 0.3)
        # basse une octave sous la fondamentale
        s_l += 0.8 * np.sin(np.pi * notes[0] * tt)
        s_r += 0.8 * np.sin(np.pi * notes[0] * tt)
        w = np.ones(b - a)
        ramp = np.linspace(0, 1, xf)
        if a > 0:
            w[:xf] = ramp
        if b < N:
            w[-xf:] = ramp[::-1]
        outL[a:b] += s_l * w
        outR[a:b] += s_r * w
    # pulsation légère (≈ 100 bpm en croches) pour donner du mouvement
    pulse = 0.75 + 0.25 * (0.5 + 0.5 * np.cos(2 * np.pi * (100 / 60 * 2) * t))
    master = np.minimum(1, t / 1.2) * np.minimum(1, (DUR - t) / 1.5)
    sos = butter(2, 2500, btype="low", fs=SR, output="sos")
    outL = sosfilt(sos, outL * pulse * master)
    outR = sosfilt(sos, outR * pulse * master)
    m = max(np.max(np.abs(outL)), np.max(np.abs(outR)))
    return outL / m, outR / m


# ---------- Placement (timeline de promo.html) ----------
pl, pr = pad()
L += pl * db(-20)
R += pr * db(-20)

# Intro logo : pop du « N », scintillement pendant le tracé, petit whoosh du mot
place(pop(660, 0.16), 0.30, -8)
place(whoosh(0.5, 800, 6000), 0.55, -24, 0.3)
place(whoosh(0.45, 400, 2500), 0.95, -22, 0.5)

# Transitions (balayages à 2.4, 6.0, 9.4, 12.4 ; durée ±0.25 s)
for k, ts in enumerate([2.4, 6.0, 9.4]):
    place(whoosh(0.65), ts - 0.33, -12, -0.4 if k % 2 else 0.4)

# Scène 3 : clics pour chaque section (6.6 + i*0.27) et blips des couleurs
for i in range(6):
    place(click(2200 + 120 * i), 6.6 + i * 0.27, -16, -0.3 + 0.12 * i)
for k, (tc, f) in enumerate([(8.3, 1046.5), (8.6, 1174.7), (8.9, 1318.5)]):
    place(blip(f), tc, -20, 0.2 * (k - 1))

# Scène 4 : pops sur les 3 formules (9.85 + i*0.22) et clics légers sur les puces
for i, f in enumerate([523.25, 659.25, 783.99]):
    place(pop(f), 9.85 + i * 0.22, -12, (-0.35, 0.35, -0.35)[i])
for i in range(5):
    place(click(3000), 10.8 + i * 0.12, -24, 0.2 * (i - 2))

# Outro : montée + whoosh du balayage, pop du logo, « ding » sur le bouton
place(riser(0.9), 11.55, -18)
place(whoosh(0.65), 12.07, -12, 0.4)
place(pop(660, 0.16), 12.75, -9)
place(bell(1318.5), 13.35, -16)
place(bell(1975.5, 1.2), 13.37, -26, 0.3)

# Réverbération simple (quelques échos décroissants filtrés) pour fondre les effets
def verb(x):
    y = x.copy()
    sos = butter(1, 3000, btype="low", fs=SR, output="sos")
    for dly, g in [(0.029, 0.22), (0.041, 0.18), (0.067, 0.14), (0.097, 0.1), (0.131, 0.07)]:
        d = int(dly * SR)
        y[d:] += sosfilt(sos, x[:-d]) * g
    return y

L, R = verb(L), verb(R)
peak = max(np.max(np.abs(L)), np.max(np.abs(R)))
scale = db(-3) / peak  # crête à -3 dBFS avant mixage
out = np.stack([L * scale, R * scale], axis=1)
wavfile.write(sys.argv[1] if len(sys.argv) > 1 else "sfx.wav", SR, (out * 32767).astype(np.int16))
print("crête avant normalisation :", round(20 * np.log10(peak), 2), "dBFS")
