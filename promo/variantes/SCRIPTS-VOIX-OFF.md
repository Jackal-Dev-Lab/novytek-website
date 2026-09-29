# Scripts de voix off : variantes de pub NovyTek

Trois pubs de 15 s au format vertical 1080×1920, dans le même style que la première. Les textes et les tarifs
sont repris de https://novytek.fr (accueil et /formules).

## Comment enregistrer

- **Un fichier par pub**, par exemple `voix-probleme.m4a`, `voix-boutique.m4a` et `voix-minute.m4a`.
- Lisez les phrases **dans l'ordre**, avec une **pause d'environ 1 seconde entre chaque phrase**.
  Inutile de suivre un chrono : l'outil découpe aux pauses et cale chaque phrase sur sa scène.
- Laissez environ 1 seconde de silence au début et à la fin. Gardez les mêmes conditions que la première fois.
- La « durée cible » est le temps disponible pour la phrase. À votre débit habituel, c'est tenable.
  Si une phrase dépasse un peu, j'adapterai l'animation à votre voix plutôt que de la couper.

## Pub 1 : « Le problème »

| # | À l'écran | À dire | Durée cible |
|---|---|---|---|
| 1 | « Un site pro ? 2 000 à 4 000 € d'un coup » | « Deux à quatre mille euros… d'un coup. » | 3,0 s |
| 2 | « Et après la livraison ? » + message sans réponse, puis « Plus personne. » | « Et après la livraison… plus personne. » | 2,8 s |
| 3 | « La réponse de NovyTek : un abonnement, un site construit pour vous, le même interlocuteur » | « NovyTek : un abonnement, un site construit pour vous. » | 3,3 s |
| 4 | « À partir de 19 €/mois, sans frais de création » | « Dès dix-neuf euros par mois, sans frais de création. » | 2,4 s |
| 5 | Logo + « Composer mon site → » | « Rendez-vous sur novytek.fr. » | 2,3 s |

## Pub 2 : « Boutique »

| # | À l'écran | À dire | Durée cible |
|---|---|---|---|
| 1 | Panier + « Vous voulez vendre en ligne ? » | « Vous voulez vendre en ligne ? » | 2,7 s |
| 2 | Boutique en action + catalogue, paiement Stripe, livraisons, codes promo | « Catalogue, panier, paiement, livraisons : tout est compris. » | 4,2 s |
| 3 | « Formule Boutique : 29 €/mois », « Le plus choisi » | « Formule Boutique : vingt-neuf euros par mois, sans frais de création. » | 4,1 s |
| 4 | Logo + « Choisir Boutique » | « Choisissez Boutique sur novytek.fr. » | 2,9 s |

## Pub 3 : « En ligne dans la minute »

| # | À l'écran | À dire | Durée cible |
|---|---|---|---|
| 1 | Chrono + « Votre site en ligne dans la minute » | « Votre site en ligne… dans la minute ? » | 2,9 s |
| 2 | Étape 1 : choix de la formule | « Vous configurez, » | 1,7 s |
| 3 | Étape 2 : paiement | « vous payez, » | 1,6 s |
| 4 | Étape 3 : l'adresse se tape, le site apparaît | « et votre site existe. » | 1,7 s |
| 5 | « Vous le rendez vôtre » : textes, couleurs, disposition… | « Vous le modifiez vous-même, sans engagement. » | 3,1 s |
| 6 | Logo + « Configurer votre site » | « Lancez-vous sur novytek.fr. » | 2,3 s |

Pour la pub 3, les phrases 2 à 4 sont très courtes : marquez bien une pause nette entre elles.
La mention « Dès le paiement validé · formules Vitrine et Boutique » reste à l'écran, car la formule
Personnalisé demande 10 à 15 jours ouvrés d'après le site.

## Côté technique

- `pub-*.html` : animations (kit commun dans `kit.css` / `kit.js`). Rendu (depuis `promo/`) : `PAGE=variantes/pub-xxx.html OUT=… node render.cjs full`.
- `cues-*.json` : repères exportés (instants des sons et fenêtres de voix off).
- `sons.py` : génère le fond sonore d'une pub à partir de ses repères (tout est synthétisé, aucun droit à gérer).
- `voix.py` : nettoie un enregistrement, le découpe en phrases, les cale sur les fenêtres, mixe avec le fond
  (-16 LUFS) et signale toute phrase qui déborde.
