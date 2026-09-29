"""Génère le fond sonore d'une pub à partir de ses repères (cues-*.json, exportés par render.cjs).

Tout est synthétisé ici (aucun échantillon externe, donc aucun droit à gérer) :
nappe d'accords, whoosh, pops, clics, tics, frappe clavier, « ding », montée.
Usage : python3 sons.py cues-xxx.json sortie.wav
"""
import json
import sys

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 48000
cues = json.load(open(sys.argv[1], encoding="utf-8"))
DUR = float(cues.get("duration") or 15)
N = int(SR * DUR)
rng = np.random.default_rng(7)
L = np.zeros(N)
R = np.zeros(N)


def db(x):
    return 10 ** (x / 20)


def note(name):
    """'A3' -> fréquence en Hz (La 4 = 440 Hz)."""
    pcs = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}
    pc = pcs[name[0]]
    rest = name[1:]
    if rest.startswith("#"):
        pc += 1
        rest = rest[1:]
    elif rest.startswith("b"):
        pc -= 1
        rest = rest[1:]
    midi = 12 * (int(rest) + 1) + pc
    return 440.0 * 2 ** ((midi - 69) / 12)


def place(sig, t, gain_db=0.0, pan=0.0):
    i = int(max(0.0, t) * SR)
    if i >= N:
        return
    sig = sig[: N - i] * db(gain_db)
    gl = np.cos((pan + 1) * np.pi / 4) * np.sqrt(2)
    gr = np.sin((pan + 1) * np.pi / 4) * np.sqrt(2)
    L[i:i + len(sig)] += sig * gl
    R[i:i + len(sig)] += sig * gr


def env(n, a, r):
    t = np.arange(n) / SR
    e = np.exp(-t / r)
    na = max(1, int(a * SR))
    e[:na] *= np.linspace(0, 1, na)
    return e


# ---------- Sons unitaires ----------
def whoosh(d=0.65, f0=300, f1=3500):
    n = int(d * SR)
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    blk = 512
    for s in range(0, n, blk):
        x = s / n
        fc = f0 + (f1 - f0) * np.sin(np.pi * x) ** 1.5
        sos = butter(2, [max(60, fc * 0.6), min(SR / 2 - 100, fc * 1.4)], btype="band", fs=SR, output="sos")
        out[s:s + blk] = sosfilt(sos, noise[s:s + blk])
    out *= np.sin(np.pi * np.linspace(0, 1, n)) ** 2
    return out / (np.max(np.abs(out)) + 1e-9)


def pop(f=880, d=0.12):
    n = int(d * SR)
    t = np.arange(n) / SR
    freq = f * (1 + 1.5 * np.exp(-t / 0.008))
    return np.sin(2 * np.pi * np.cumsum(freq) / SR) * env(n, 0.002, 0.03)


def click(f=2400, d=0.04):
    n = int(d * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) * env(n, 0.0008, 0.006)
    s += 0.3 * rng.standard_normal(n) * env(n, 0.0005, 0.002)
    return sosfilt(butter(2, 5000, btype="low", fs=SR, output="sos"), s)


def tick(d=0.02):
    """Tic de compteur / d'horloge, très court et sec."""
    n = int(d * SR)
    s = rng.standard_normal(n) * env(n, 0.0003, 0.0015)
    s = sosfilt(butter(2, [2500, 7000], btype="band", fs=SR, output="sos"), s)
    return s / (np.max(np.abs(s)) + 1e-9)


def keytype(d=0.05):
    """Frappe de clavier feutrée."""
    n = int(d * SR)
    s = rng.standard_normal(n) * env(n, 0.0005, 0.006)
    s = sosfilt(butter(2, [900, 4000], btype="band", fs=SR, output="sos"), s)
    t = np.arange(n) / SR
    s += 0.3 * np.sin(2 * np.pi * 180 * t) * env(n, 0.0005, 0.01)
    return s / (np.max(np.abs(s)) + 1e-9)


def thud(f=110, d=0.45):
    """Impact grave et doux (chute de hauteur)."""
    n = int(d * SR)
    t = np.arange(n) / SR
    freq = f * (1 + 1.2 * np.exp(-t / 0.03))
    s = np.sin(2 * np.pi * np.cumsum(freq) / SR) * env(n, 0.003, 0.12)
    s += 0.25 * sosfilt(butter(2, 900, btype="low", fs=SR, output="sos"), rng.standard_normal(n)) * env(n, 0.001, 0.02)
    return s / (np.max(np.abs(s)) + 1e-9)


def bell(f=1318.5, d=1.6):
    n = int(d * SR)
    t = np.arange(n) / SR
    s = np.zeros(n)
    for k, (m, a) in enumerate([(1, 1), (2.0, 0.35), (3.01, 0.18), (4.2, 0.08)]):
        s += a * np.sin(2 * np.pi * f * m * t + k)
    return s * env(n, 0.003, 0.55)


def blip(f):
    n = int(0.18 * SR)
    t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)) * env(n, 0.004, 0.05)


def riser(d=0.9):
    return whoosh(d, 200, 5000) * np.linspace(0, 1, int(d * SR)) ** 2


# ---------- Nappe d'accords ----------
def pad(chords):
    """Accords enchaînés sur toute la durée ; la 1re note de chaque accord sert de basse."""
    t = np.arange(N) / SR
    outL = np.zeros(N)
    outR = np.zeros(N)
    seg = N // len(chords)
    xf = int(0.35 * SR)
    for c, names in enumerate(chords):
        a = max(0, c * seg - xf)
        b = min(N, (c + 1) * seg + xf)
        tt = t[a:b]
        freqs = [note(x) for x in names]
        s_l = 0.8 * np.sin(2 * np.pi * freqs[0] * tt)
        s_r = s_l.copy()
        for j, f in enumerate(freqs[1:]):
            det = 1 + 0.0025 * (j % 2 * 2 - 1)
            vib = 1 + 0.002 * np.sin(2 * np.pi * 4.5 * tt + j)
            s_l += np.sin(2 * np.pi * f * det * vib * tt) + 0.25 * np.sin(4 * np.pi * f * tt)
            s_r += np.sin(2 * np.pi * f / det * vib * tt + 0.7) + 0.25 * np.sin(4 * np.pi * f * tt + 0.3)
        w = np.ones(b - a)
        ramp = np.linspace(0, 1, xf)
        if a > 0:
            w[:xf] = ramp
        if b < N:
            w[-xf:] = ramp[::-1]
        outL[a:b] += s_l * w
        outR[a:b] += s_r * w
    pulse = 0.75 + 0.25 * (0.5 + 0.5 * np.cos(2 * np.pi * (100 / 60 * 2) * t))
    master = np.minimum(1, t / 1.2) * np.minimum(1, (DUR - t) / 1.5)
    sos = butter(2, 2500, btype="low", fs=SR, output="sos")
    outL = sosfilt(sos, outL * pulse * master)
    outR = sosfilt(sos, outR * pulse * master)
    m = max(np.max(np.abs(outL)), np.max(np.abs(outR)))
    return outL / m, outR / m


if cues.get("pad"):
    pl, pr = pad(cues["pad"])
    L += pl * db(-20)
    R += pr * db(-20)

for c in cues.get("sfx", []):
    kind, t, g, pan = c["type"], float(c["t"]), float(c.get("gain", -12)), float(c.get("pan", 0))
    if kind == "whoosh":
        sig = whoosh(float(c.get("dur", 0.65)))
    elif kind == "pop":
        sig = pop(float(c.get("f", 880)), float(c.get("dur", 0.12)))
    elif kind == "click":
        sig = click(float(c.get("f", 2400)))
    elif kind == "tick":
        sig = tick()
    elif kind == "type":
        sig = keytype()
    elif kind == "thud":
        sig = thud(float(c.get("f", 110)))
    elif kind == "bell":
        sig = bell(float(c.get("f", 1318.5)), float(c.get("dur", 1.6)))
    elif kind == "blip":
        sig = blip(float(c.get("f", 1046.5)))
    elif kind == "riser":
        sig = riser(float(c.get("dur", 0.9)))
    else:
        raise SystemExit(f"type de son inconnu : {kind}")
    place(sig, t, g, pan)


def verb(x):
    """Réverbération simple (échos décroissants filtrés) pour fondre les effets."""
    y = x.copy()
    sos = butter(1, 3000, btype="low", fs=SR, output="sos")
    for dly, g in [(0.029, 0.22), (0.041, 0.18), (0.067, 0.14), (0.097, 0.1), (0.131, 0.07)]:
        d = int(dly * SR)
        y[d:] += sosfilt(sos, x[:-d]) * g
    return y


L, R = verb(L), verb(R)
peak = max(np.max(np.abs(L)), np.max(np.abs(R)))
out = np.stack([L, R], axis=1) * (db(-3) / peak)
wavfile.write(sys.argv[2], SR, (out * 32767).astype(np.int16))
print(f"{sys.argv[2]} : {len(cues.get('sfx', []))} sons, crête d'origine {20 * np.log10(peak):.1f} dBFS")
