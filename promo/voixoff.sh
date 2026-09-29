#!/usr/bin/env bash
# Nettoie la voix off (raw.wav), cale chaque phrase sur sa scène et l'assemble à la vidéo.
# Usage : FF=/chemin/ffmpeg ./voixoff.sh raw.wav video_muette.mp4 sortie.mp4
set -euo pipefail
RAW=$1; VID=$2; OUT=$3
# Passe-haut, débruitage léger, gate doux, EQ (-boue 250 Hz, +présence 3,2 kHz, -sifflantes 7 kHz), compression
$FF -loglevel error -y -i "$RAW" -af "highpass=f=80,afftdn=nf=-60:nr=12:tn=1,agate=threshold=0.004:ratio=3:attack=5:release=120,equalizer=f=250:t=q:w=1.2:g=-2.5,equalizer=f=3200:t=q:w=1.0:g=2.5,equalizer=f=7000:t=q:w=1.5:g=-1.5,acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=2" clean.wav
# debut_dans_la_prise fin_dans_la_prise position_dans_la_video (secondes)
SEGS="3.70 4.75 0.80
5.00 8.55 2.45
8.80 11.70 6.35
11.95 14.45 9.55
14.78 17.40 12.45"
i=0; inputs=(); filt=""; mix=""
while read -r a b pos; do
  d=$(python3 -c "print(round($b-$a,3))"); ms=$(python3 -c "print(int($pos*1000))")
  inputs+=(-ss "$a" -t "$d" -i clean.wav)
  filt+="[$i]afade=t=in:d=0.02,afade=t=out:st=$(python3 -c "print($d-0.06)"):d=0.06,adelay=$ms|$ms[s$i];"
  mix+="[s$i]"; i=$((i+1))
done <<< "$SEGS"
$FF -loglevel error -y "${inputs[@]}" -filter_complex "${filt}${mix}amix=inputs=$i:normalize=0,apad=whole_dur=15,atrim=0:15" voice_timeline.wav
# Normalisation -16 LUFS / -1,5 dBTP en deux passes
set -- $($FF -hide_banner -i voice_timeline.wav -af loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/{/,/}/p' | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['input_i'],d['input_tp'],d['input_lra'],d['input_thresh'],d['target_offset'])")
$FF -loglevel error -y -i voice_timeline.wav -af "loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=$1:measured_TP=$2:measured_LRA=$3:measured_thresh=$4:offset=$5:linear=true" -ar 48000 voice_final.wav
$FF -loglevel error -y -i "$VID" -i voice_final.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -ac 2 -shortest -movflags +faststart "$OUT"
