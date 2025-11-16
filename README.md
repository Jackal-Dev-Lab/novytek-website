# 🌐 NovyTek - Site Web Officiel

![NovyTek Logo](public/logo.png)

Site web professionnel de **NovyTek**, spécialiste en services tech à domicile.

## 🚀 Technologies

- **React 18** - Framework UI
- **TypeScript** - Typage statique
- **Vite** - Build tool ultra-rapide
- **Tailwind CSS** - Styling moderne
- **Supabase** - Backend & Database
- **React Router** - Navigation
- **Shadcn/ui** - Composants UI

## 📦 Installation

```bash
# Cloner le repository
git clone https://github.com/VOTRE-USERNAME/novytek-website.git
cd novytek-website

# Installer les dépendances
npm install

# Lancer en développement
npm run dev
```

## 🌍 Déploiement

### Vercel (Recommandé)

1. Fork ce repository
2. Connecte-toi sur [Vercel](https://vercel.com)
3. Importe ton repository
4. Configure les variables d'environnement
5. Deploy ! 🚀

### Netlify

```bash
# Build
npm run build

# Le dossier dist/ est prêt pour Netlify
```

## ⚙️ Variables d'environnement

Crée un fichier `.env` :

```env
VITE_SUPABASE_URL=https://ton-projet.supabase.co
VITE_SUPABASE_ANON_KEY=ta-clé-publique
```

## 🏗️ Structure du projet

```
novytek-tech-solutions/
├── public/              # Fichiers statiques
│   ├── logo.png        # Logo NovyTek
│   └── favicon.png     # Favicon
├── src/
│   ├── components/     # Composants React
│   ├── pages/          # Pages du site
│   ├── lib/            # Utilitaires
│   └── integrations/   # Supabase
├── supabase/           # Configuration backend
└── package.json
```

## 📄 Pages

- **Accueil** (`/`) - Page d'accueil
- **Services** (`/services`) - Liste des services
- **À propos** (`/about`) - Présentation de l'entreprise
- **Avis** (`/reviews`) - Témoignages clients
- **Contact** (`/contact`) - Formulaire de contact

## 🛠️ Commandes disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build pour production
npm run preview      # Preview du build
npm run lint         # Vérifier le code
```

## 📧 Contact

- **Email** : nahmematthieu@gmail.com
- **Téléphone** : 06 67 62 32 92
- **Zone** : Montpellier et environs

## 📝 License

© 2025 NovyTek. Tous droits réservés.

---

**Développé avec ❤️ par NovyTek**
