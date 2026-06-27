# Generateur image C2R

## Liens vers l'application
- Lien public: non detecte
- GitHub: https://github.com/RYJITS/generateur-image-c2r

## A quoi sert le projet
Generateur image C2R est un studio local pour piloter la generation d'images. Il permet de consulter le corpus Image valide, lancer des generations, suivre les jobs, recuperer les images produites et indiquer celles qui doivent etre gardees ou rejetees.

## Fonctionnement de l'application ou du projet
Le serveur Express expose des routes de sante, configuration, galerie, generation, assets, jobs et feedback. L'application lit un manifeste JSON du corpus Image valide, sert les images de facon controlee, cree un job quand une generation est demandee, peut lancer le script C2R historique ou fonctionner en dry-run, puis stocke le resultat et le retour utilisateur. Une image valide peut etre copiee dans le corpus et le manifeste est rafraichi.

## Comment le projet a ete construit
L'outil a ete concu comme une passerelle propre entre l'ancienne chaine C2R et une interface web plus confortable. Les donnees lourdes et le corpus existant ne sont pas dupliques dans le projet; ils sont references par configuration pour garder le depot plus propre.

## Fonctions disponibles dans l'application
- Consulter la galerie Image valide
- Rafraichir le manifeste d'images
- Lancer une generation d'image
- Suivre les jobs en cours
- Servir les images generees
- Valider ou rejeter un resultat
- Ajouter une image validee au corpus
- Utiliser un mode dry-run avant generation reelle

## Outils, IA et moteurs en arriere-plan
- Moteur C2R historique
- ComfyUI detecte par health check
- Manifestes Image valide
- Store local de jobs
- Journal feedback JSONL
- Configuration de chemins C2R
- Service local d'assets securise
- Runtime outputs/logs/feedback

## Automatisations integrees
- Refresh automatique du manifeste Image valide
- Controle health du projet, corpus, script legacy et ComfyUI
- Creation et suivi de jobs
- Mode dry-run de generation
- Execution asynchrone du script C2R
- Feedback valide/rejete en JSONL
- Copie des images validees dans le corpus
- Rafraichissement du manifeste apres validation
- Checks npm compatibilite/build

## Captures d'ecran
![Capture 1 - Generateur image C2R](docs/captures/05-generateur-image-c2r-2026-06-21_23-36-58-desktop.png)

![Capture 2 - Generateur image C2R](docs/captures/05-generateur-image-c2r-2026-06-21_23-36-58-mobile.png)

## Mises a jour
- Fiche actualisee depuis le registre orchestrateur et le catalogue projet.

> Fichier genere par l'orchestrateur pour le hub Site Ma Methode.
