# Generateur image C2R

## Rapport complet

Ce depot public presente le concept, les fonctions, les choix de conception, les outils utilises, les commandes locales et les captures d'ecran de l'application. Il est genere par l'orchestrateur uniquement apres validation de publication publique.

## Concept

Studio local de generation d'images C2R. Il expose une interface web, lit le corpus Image valide, lance les generations et organise les retours utiles.

Creer rapidement des images coherentes avec les projets et transformer les essais visuels en assets reutilisables.

Public vise: Creation visuelle, prototypage, contenus web et assets projets.


## Fonctionnement de l'application

Le serveur Express expose des routes de sante, configuration, galerie, generation, assets, jobs et feedback. L'application lit un manifeste JSON du corpus Image valide, sert les images de facon controlee, cree un job quand une generation est demandee, peut lancer le script C2R historique ou fonctionner en dry-run, puis stocke le resultat et le retour utilisateur. Une image valide peut etre copiee dans le corpus et le manifeste est rafraichi.

## Fonctions de l'application

- Centralise une interface de generation d'images.
- Lit le corpus Image valide via manifeste.
- Lance des jobs de generation et suit leurs resultats.
- Aide a valider ou rejeter les images produites.
- Consulter la galerie Image valide
- Rafraichir le manifeste d'images
- Lancer une generation d'image
- Suivre les jobs en cours
- Servir les images generees
- Valider ou rejeter un resultat
- Ajouter une image validee au corpus
- Utiliser un mode dry-run avant generation reelle

## Actualisations et evolution

- Statut courant: PUBLIC_READY.
- Securite: OK_PUBLIC.
- Fonctionnement: FONCTIONNEL.

## Options et conception

L'outil a ete concu comme une passerelle propre entre l'ancienne chaine C2R et une interface web plus confortable. Les donnees lourdes et le corpus existant ne sont pas dupliques dans le projet; ils sont references par configuration pour garder le depot plus propre.

### Outils, IA et moteurs utilises

- Moteur C2R historique
- ComfyUI detecte par health check
- Manifestes Image valide
- Store local de jobs
- Journal feedback JSONL
- Configuration de chemins C2R
- Service local d'assets securise
- Runtime outputs/logs/feedback
- React/Vite pour l'interface
- Express pour l'API locale
- Manifestes JSON
- Adaptateurs C2R
- ComfyUI system_stats
- Gestion de jobs
- Service d'assets avec verification de chemin
- Runtime local pour outputs/logs/feedback

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
- React/Vite pour l'interface
- Express pour l'API locale
- Manifestes JSON
- Adaptateurs C2R
- ComfyUI system_stats
- Gestion de jobs
- Service d'assets avec verification de chemin
- Runtime local pour outputs/logs/feedback

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

- Refresh automatique du manifeste Image valide
- Controle health du projet, corpus, script legacy et ComfyUI
- Creation et suivi de jobs
- Mode dry-run de generation
- Execution asynchrone du script C2R
- Feedback valide/rejete en JSONL
- Copie des images validees dans le corpus
- Rafraichissement du manifeste apres validation
- Checks npm compatibilite/build

## Installation locale

```powershell
npm install
```

## Lancement

```powershell
npm run dev
npm run start
npm run build
```

## Captures d'ecran

![Capture desktop](docs/github-captures/05-generateur-image-c2r-2026-06-28_00-21-36-desktop.png)

![Capture mobile](docs/github-captures/05-generateur-image-c2r-2026-06-28_00-21-36-mobile.png)

## Variables d'environnement

Copier `.env.example` vers `.env` en local puis remplir les valeurs privees.

## Securite

Ne jamais publier `.env`, tokens, sessions, logs sensibles, cles privees ou donnees personnelles.
