# Brouillon contenu fiche - Générateur Image C2R

## Resume
Interface web locale pour piloter et visualiser la génération d'images via le moteur C2R historique, facilitant le prototypage et la réutilisation des assets graphiques.

## A quoi sert le projet
Fournir un studio visuel ergonomique pour créer, valider et organiser des images générées par le moteur C2R, en évitant la duplication des données lourdes (corpus d'images) et en centralisant la gestion des jobs de génération.

## Fonctionnement
L'application fonctionne en deux parties distinctes : un serveur Express (Node.js) qui expose une API REST et gère les jobs de génération, et un client React/Vite qui fournit l'interface utilisateur. Le serveur lit un manifeste JSON des images validées, exécute les générations via le moteur C2R, et sert les images générées. Le client permet de lancer des générations, de suivre les jobs, et de valider les résultats. Les jobs sont exécutés de manière asynchrone, et les feedbacks utilisateurs sont journalisés en JSONL pour une traçabilité complète.

## Construction
Le projet a été conçu comme une passerelle entre l'ancien moteur C2R et une interface moderne, en évitant la duplication des données lourdes (corpus d'images). Les choix de conception incluent : une architecture modulaire avec séparation claire entre le serveur et le client, une gestion centralisée des jobs via un store in-memory, un mode dry-run pour les tests, et une journalisation des feedbacks pour l'analyse. L'interface est responsive et utilise des composants React pour une expérience utilisateur intuitive. Le serveur est écrit en Node.js avec Express pour une API REST simple et efficace, et le client utilise Vite pour un développement rapide et une optimisation de production. La sécurité est renforcée par des vérifications de chemins pour éviter les accès non autorisés.

## Installation
[object Object]

## Utilisation
Après installation, l'application est accessible via un navigateur web à l'adresse `http://localhost:<port>`. L'interface propose plusieurs onglets : une galerie des images validées, un formulaire pour lancer une génération, une liste des jobs en cours, et une section pour configurer les paramètres. Pour générer une image, l'utilisateur saisit un prompt, sélectionne une version du moteur C2R, et lance la génération. Les résultats sont affichés dans l'interface, et l'utilisateur peut valider ou rejeter l'image. Les images validées sont automatiquement ajoutées au corpus et le manifeste est rafraîchi.

## Fonctions
- Consulter la galerie des images validées
- Lancer une génération d'image avec des paramètres personnalisables
- Suivre l'état des jobs de génération en temps réel
- Valider ou rejeter les résultats générés
- Ajouter une image validée au corpus Image valide
- Rafraîchir le manifeste des images validées
- Configurer les paramètres de génération (version, dry-run, etc.)
- Visualiser les logs et métriques des jobs
