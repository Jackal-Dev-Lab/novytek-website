"""Pose une voix off enregistrée sur une pub : nettoyage, découpe en phrases, calage, mixage.

Usage :
  FF=/chemin/ffmpeg python3 voix.py enregistrement.(m4a|mp4|wav…) cues-xxx.json sons-xxx.wav video-muette.mp4 sortie.mp4

- Nettoyage : passe-haut 80 Hz, débruitage léger, gate doux, EQ, compression (réglages validés sur la 1re pub).
- Découpe : les phrases sont séparées aux silences ; il en faut autant que de fenêtres « vo » dans les repères.
- Calage : chaque phrase démarre au début de sa fenêtre ; si elle déborde, c'est signalé (rien n'est coupé).
- Mixage : fond sonore à -33 LUFS, baissé automatiquement sous la voix, total normalisé à -16 LUFS.
"""
import json
import os
import re
import subprocess
import sys
import tempfile

import numpy as np
from scipy.io import wavfile

FF = os.environ["FF"]
SR = 48000
src, cues_path, bed, video, out = sys.argv[1:6]
cues = json.load(open(cues_path, encoding="utf-8"))
VO = cues["vo"]
DUR = float(cues.get("duration") or 15)
tmp = tempfile.mkdtemp(prefix="voix-")


def ff(*args):
    return subprocess.run([FF, "-hide_banner", "-y", *args], capture_output=True, text=True, check=True)


# 1) Extraction + nettoyage
clean = os.path.join(tmp, "clean.wav")
ff("-i", src, "-vn", "-ac", "1", "-ar", str(SR), "-af",
   "highpass=f=80,afftdn=nf=-60:nr=12:tn=1,agate=threshold=0.004:ratio=3:attack=5:release=120,"
   "equalizer=f=250:t=q:w=1.2:g=-2.5,equalizer=f=3200:t=q:w=1.0:g=2.5,equalizer=f=7000:t=q:w=1.5:g=-1.5,"
   "acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=2", clean)
sr, x = wavfile.read(clean)
x = x.astype(np.float64) / 32768.0
total = len(x) / SR


# 2) Détection des phrases (zones de parole séparées par des silences)
def speech_segments(noise_db, min_sil):
    r = subprocess.run([FF, "-hide_banner", "-i", clean, "-af", f"silencedetect=n={noise_db}dB:d={min_sil}", "-f", "null", "-"],
                       capture_output=True, text=True)
    starts = [float(v) for v in re.findall(r"silence_start: ([0-9.]+)", r.stderr)]
    ends = [float(v) for v in re.findall(r"silence_end: ([0-9.]+)", r.stderr)]
    sil = list(zip(starts, ends + [total] * (len(starts) - len(ends))))
    segs, cur = [], 0.0
    for a, b in sil:
        if a > cur:
            segs.append([cur, a])
        cur = b
    if cur < total:
        segs.append([cur, total])
    return [s for s in segs if s[1] - s[0] >= 0.15]  # ignore clics et souffles isolés


want = len(VO)
found = None
for noise in (-38, -35, -41, -32):
    for d in (0.30, 0.35, 0.25, 0.40, 0.45, 0.20, 0.50, 0.60):
        segs = speech_segments(noise, d)
        if len(segs) == want:
            found = (segs, noise, d)
            break
    if found:
        break
if not found:
    segs = speech_segments(-38, 0.3)
    print(f"ÉCHEC : {len(segs)} phrases détectées, {want} attendues. Zones de parole trouvées :")
    for a, b in segs:
        print(f"  {a:6.2f} → {b:6.2f} s")
    sys.exit(3)
segs, noise, d = found
print(f"{want} phrases détectées (seuil {noise} dB, silence ≥ {d} s)")

# 3) Calage : chaque phrase au début de sa fenêtre (avec 80 ms d'avance pour l'attaque)
PRE, POST = 0.08, 0.12
timeline = np.zeros(int(DUR * SR))
report, prev_end = [], 0.0
for i, ((a, b), w) in enumerate(zip(segs, VO)):
    a0 = max(0.0, a - PRE if i == 0 else max(a - PRE, (segs[i - 1][1] + a) / 2))
    b0 = min(total, b + POST if i == want - 1 else min(b + POST, (b + segs[i + 1][0]) / 2))
    clip = x[int(a0 * SR):int(b0 * SR)].copy()
    n = len(clip)
    fi, fo = int(0.02 * SR), int(0.06 * SR)
    clip[:fi] *= np.linspace(0, 1, fi)
    clip[-fo:] *= np.linspace(1, 0, fo)
    start = max(w["t0"] - PRE, prev_end + 0.05)
    speech = b - a
    end_speech = start + PRE + speech
    over = end_speech - w["t1"]
    i0 = int(start * SR)
    if i0 + n > len(timeline):
        n = len(timeline) - i0
        clip = clip[:n]
    timeline[i0:i0 + n] += clip
    prev_end = start + (b0 - a0)
    report.append((i + 1, w["text"], speech, w["t0"], w["t1"], start + PRE, end_speech, over))

print("\nPhrase | durée | fenêtre prévue | placée | état")
bad = False
for k, text, sp, t0, t1, s, e, over in report:
    state = "OK" if over <= 0.05 else f"DÉBORDE de {over:.2f} s"
    bad |= over > 0.05
    print(f"  {k}. {sp:4.2f} s | {t0:5.2f}–{t1:5.2f} | {s:5.2f}–{e:5.2f} | {state}  « {text} »")
voice = os.path.join(tmp, "voice.wav")
wavfile.write(voice, SR, (np.clip(timeline, -1, 1) * 32767).astype(np.int16))



def loudnorm(src_wav, dst_wav, target):
    """Normalisation EBU R128 en deux passes (mesure puis correction linéaire)."""
    r = subprocess.run([FF, "-hide_banner", "-i", src_wav, "-af", f"loudnorm=I={target}:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                       capture_output=True, text=True)
    m = json.loads(r.stderr[r.stderr.rindex("{"):r.stderr.rindex("}") + 1])
    ff("-i", src_wav, "-af", f"loudnorm=I={target}:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
       f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true", "-ar", str(SR), dst_wav)


# 4) Voix seule à -16 LUFS (comme pour la 1re pub), puis mixage : fond à -33 LUFS,
#    baissé sous la voix, total renormalisé à -16 LUFS
voice_n = os.path.join(tmp, "voice_n.wav")
loudnorm(voice, voice_n, -16)
pre = os.path.join(tmp, "mix_pre.wav")
ff("-i", voice_n, "-i", bed, "-filter_complex",
   "[0]aformat=channel_layouts=stereo,asplit=2[v][sc];"
   "[1]loudnorm=I=-33:TP=-8:LRA=15,aresample=48000[bg];"
   "[bg][sc]sidechaincompress=threshold=0.03:ratio=4:attack=20:release=350:makeup=1[duck];"
   "[v][duck]amix=inputs=2:normalize=0,alimiter=limit=0.84:level=false[m]", "-map", "[m]", "-ar", str(SR), pre)
final = os.path.join(tmp, "mix_final.wav")
loudnorm(pre, final, -16)
ff("-i", video, "-i", final, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest",
   "-movflags", "+faststart", out)
print(f"\n→ {out}" + ("  (ATTENTION : au moins une phrase déborde de sa fenêtre)" if bad else ""))
