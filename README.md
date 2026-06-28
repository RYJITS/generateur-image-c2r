# Générateur Image C2R

## Rapport complet

Ce depot public presente le concept, les fonctions, les choix de conception, les outils utilises, les commandes locales et les captures d'ecran de l'application. Il est genere par l'orchestrateur uniquement apres validation de publication publique.

## Concept

Interface web locale pour piloter et visualiser la génération d'images via le moteur C2R historique, facilitant le prototypage et la réutilisation des assets graphiques.

Fournir un studio visuel ergonomique pour créer, valider et organiser des images générées par le moteur C2R, en évitant la duplication des données lourdes (corpus d'images) et en centralisant la gestion des jobs de génération.

Public vise: Créateurs visuels, designers, développeurs front-end et toute personne impliquée dans la production d'assets graphiques pour des projets web ou multimédias.


## Fonctionnement de l'application

L'application fonctionne en deux parties distinctes : un serveur Express (Node.js) qui expose une API REST et gère les jobs de génération, et un client React/Vite qui fournit l'interface utilisateur. Le serveur lit un manifeste JSON des images validées, exécute les générations via le moteur C2R, et sert les images générées. Le client permet de lancer des générations, de suivre les jobs, et de valider les résultats. Les jobs sont exécutés de manière asynchrone, et les feedbacks utilisateurs sont journalisés en JSONL pour une traçabilité complète.

## Fonctions de l'application

- Consulter la galerie des images validées
- Lancer une génération d'image avec des paramètres personnalisables
- Suivre l'état des jobs de génération en temps réel
- Valider ou rejeter les résultats générés
- Ajouter une image validée au corpus Image valide
- Rafraîchir le manifeste des images validées
- Configurer les paramètres de génération (version, dry-run, etc.)
- Visualiser les logs et métriques des jobs
- Génération d'images via le moteur C2R historique
- Suivi en temps réel des jobs de génération
- Validation ou rejet des résultats avec feedback utilisateur
- Ajout automatique des images validées au corpus
- Mode dry-run pour tester les générations sans impact
- Journalisation des feedbacks en JSONL pour analyse
- Configuration flexible des paramètres de génération
- Interface responsive adaptée aux écrans desktop et mobile
- Rafraîchissement automatique du manifeste des images validées
- Contrôle de santé du projet, du corpus et des outils associés

## Actualisations et evolution

- Statut projet : PUBLIC_READY avec sécurité OK_PUBLIC
- Compatibilité vérifiée avec le moteur C2R historique et ComfyUI
- Mode dry-run intégré pour tester les générations sans impact
- Rafraîchissement automatique du manifeste des images validées
- Journalisation des feedbacks utilisateurs en JSONL pour traçabilité
- Amélioration de l'interface utilisateur avec des composants React plus ergonomiques
- Optimisation des performances du serveur et du client
- Ajout de vérifications de santé pour le corpus et les outils associés
- Statut courant: PUBLIC_READY.
- Securite: OK_PUBLIC.
- Fonctionnement: FONCTIONNEL.

## Comment le projet a ete reflechi et construit

Le projet a été conçu comme une passerelle entre l'ancien moteur C2R et une interface moderne, en évitant la duplication des données lourdes (corpus d'images). Les choix de conception incluent : une architecture modulaire avec séparation claire entre le serveur et le client, une gestion centralisée des jobs via un store in-memory, un mode dry-run pour les tests, et une journalisation des feedbacks pour l'analyse. L'interface est responsive et utilise des composants React pour une expérience utilisateur intuitive. Le serveur est écrit en Node.js avec Express pour une API REST simple et efficace, et le client utilise Vite pour un développement rapide et une optimisation de production. La sécurité est renforcée par des vérifications de chemins pour éviter les accès non autorisés.

Cette section doit expliquer les choix qui ont guide le projet: besoin de depart, structure retenue, modules principaux, compromis techniques, interface ou logique metier, et raisons des outils utilises.

### Outils, IA et moteurs utilises

- Express (serveur API REST)
- React/Vite (interface utilisateur)
- Node.js (runtime)
- ComfyUI (détection via health check)
- Manifestes JSON (gestion du corpus d'images)
- Journalisation en JSONL (feedback utilisateur)
- Vite/Dev server
- React
- Node.js
- Architecture modulaire (serveur/client séparés)
- Gestion asynchrone des jobs de génération
- Mode dry-run pour les tests
- Journalisation des feedbacks en JSONL
- Validation des chemins pour éviter les accès non autorisés
- Configuration centralisée via fichiers JSON
- Responsive design avec CSS moderne

### Options techniques detectees

- Type de projet: node
- Gestionnaire: npm
- Nom package: generateur-image-c2r
- Version: 0.1.0
- Statut securite: OK_PUBLIC

### Stack et dependances principales

- Vite/Dev server
- React
- Node.js
- Architecture modulaire (serveur/client séparés)
- Gestion asynchrone des jobs de génération
- Mode dry-run pour les tests
- Journalisation des feedbacks en JSONL
- Validation des chemins pour éviter les accès non autorisés
- Configuration centralisée via fichiers JSON
- Responsive design avec CSS moderne

### Scripts disponibles

- build: vite build --config vite.config.mjs
- check: node --check src/server/index.mjs && node --check src/c2r/config.mjs && node --check src/c2r/generator.mjs && node --check src/c2r/jobs.mjs && node --check src/c2r/manifest.mjs && node --check src/c2r/versions.mjs && node scripts/check-legacy-compat.mjs
- compat:check: node scripts/check-legacy-compat.mjs
- dev: node src/server/index.mjs
- manifest:refresh: node scripts/refresh-image-valide-manifest.mjs
- start: node src/server/index.mjs

### Dependances applicatives

- @vitejs/plugin-react ^5.1.2
- dotenv ^17.2.3
- express ^5.2.1
- lucide-react ^0.561.0
- react ^19.2.3
- react-dom ^19.2.3
- vite ^8.0.16

### Dependances de developpement

- Aucune dependance de developpement detectee.

## Automatisations et comportements internes

- Rafraîchissement automatique du manifeste des images validées
- Contrôle de santé du projet, du corpus et des outils associés
- Création et suivi des jobs de génération
- Exécution asynchrone des générations
- Copie automatique des images validées dans le corpus
- Mise à jour du manifeste après validation d'une image
- Vérification de compatibilité avec le moteur C2R historique

## Installation locale

[object Object]

### Pre-requis
- Node.js installe localement.
- Gestionnaire detecte: npm.
- Creer un fichier `.env` local a partir de `.env.example` si des variables sont necessaires.

### Commandes
```powershell
npm install
npm run build
npm run dev
npm run start
```

### Scripts utiles
- build: vite build --config vite.config.mjs
- check: node --check src/server/index.mjs && node --check src/c2r/config.mjs && node --check src/c2r/generator.mjs && node --check src/c2r/jobs.mjs && node --check src/c2r/manifest.mjs && node --check src/c2r/versions.mjs && node scripts/check-legacy-compat.mjs
- compat:check: node scripts/check-legacy-compat.mjs
- dev: node src/server/index.mjs
- manifest:refresh: node scripts/refresh-image-valide-manifest.mjs
- start: node src/server/index.mjs

## Lancement

```powershell
npm run dev
npm run start
npm run build
```

## Utilisation

Après installation, l'application est accessible via un navigateur web à l'adresse `http://localhost:<port>`. L'interface propose plusieurs onglets : une galerie des images validées, un formulaire pour lancer une génération, une liste des jobs en cours, et une section pour configurer les paramètres. Pour générer une image, l'utilisateur saisit un prompt, sélectionne une version du moteur C2R, et lance la génération. Les résultats sont affichés dans l'interface, et l'utilisateur peut valider ou rejeter l'image. Les images validées sont automatiquement ajoutées au corpus et le manifeste est rafraîchi.

## Captures d'ecran

![Capture desktop](docs/github-captures/05-generateur-image-c2r-2026-06-28_03-36-57-desktop.png)

![Capture mobile](docs/github-captures/05-generateur-image-c2r-2026-06-28_03-36-57-mobile.png)

## Variables d'environnement

Copier `.env.example` vers `.env` en local puis remplir les valeurs privees.

## Securite

Ne jamais publier `.env`, tokens, sessions, logs sensibles, cles privees ou donnees personnelles.
