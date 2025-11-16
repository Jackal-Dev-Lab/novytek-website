#!/bin/bash

echo "🚀 Script de déploiement NovyTek"
echo "================================"
echo ""

# Vérifier si Git est installé
if ! command -v git &> /dev/null; then
    echo "❌ Git n'est pas installé. Installe-le d'abord."
    exit 1
fi

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Installe-le d'abord."
    exit 1
fi

echo "📦 Installation des dépendances..."
npm install

echo ""
echo "🔨 Build du projet..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build réussi !"
    echo ""
    echo "📁 Les fichiers sont prêts dans le dossier 'dist/'"
    echo ""
    echo "🌐 Prochaines étapes :"
    echo "  1. Créer un compte sur Vercel.com"
    echo "  2. Connecter ce projet à GitHub"
    echo "  3. Déployer depuis Vercel"
    echo ""
    echo "Ou manuellement :"
    echo "  - Glisse-dépose le dossier 'dist/' sur Netlify Drop"
    echo ""
else
    echo ""
    echo "❌ Erreur lors du build"
    echo "Vérifie les erreurs ci-dessus"
    exit 1
fi
