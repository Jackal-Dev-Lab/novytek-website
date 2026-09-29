#!/usr/bin/env bash
# Mixe la voix off (voice_final.wav, produite par voixoff.sh) avec les sons d'arrière-plan
# générés par sfx.py, avec ducking, puis remplace la piste audio de la vidéo.
# Usage : FF=/chemin/ffmpeg ./mixage.sh video_muette.mp4 sortie.mp4
set -euo pipefail
VID=$1; OUT=$2
python3 "$(dirname "$0")/sfx.py" sfx.wav
$FF -loglevel error -y -i voice_final.wav -i sfx.wav -filter_complex "\
[0]aformat=channel_layouts=stereo,asplit=2[v][sc];\
[1]loudnorm=I=-33:TP=-8:LRA=15,aresample=48000[bg];\
[bg][sc]sidechaincompress=threshold=0.03:ratio=4:attack=20:release=350:makeup=1[duck];\
[v][duck]amix=inputs=2:normalize=0,alimiter=limit=0.84:level=false[m]" -map "[m]" -ar 48000 mix_pre.wav
set -- $($FF -hide_banner -i mix_pre.wav -af loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/{/,/}/p' | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['input_i'],d['input_tp'],d['input_lra'],d['input_thresh'],d['target_offset'])")
$FF -loglevel error -y -i mix_pre.wav -af "loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=$1:measured_TP=$2:measured_LRA=$3:measured_thresh=$4:offset=$5:linear=true" -ar 48000 mix_final.wav
$FF -loglevel error -y -i "$VID" -i mix_final.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$OUT"
