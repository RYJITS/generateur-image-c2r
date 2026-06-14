# Migration C2R vers app web locale

## Objectif

Faire de `D:\00_Cerveau_IA\Projet\05_Generateur image C2R` le projet canonique pour C2R, sans casser Telegram.

## Strategie

1. Garder `Conpetances` fonctionnel.
2. Creer une app web locale avec API C2R.
3. Lire le corpus `Image valide` par manifeste.
4. Lancer les generations via le moteur legacy existant.
5. Migrer progressivement le moteur dans `src/c2r` quand l'app est validee.

## Hors Git

Les images lourdes, outputs, logs et modeles restent hors Git. Git suit le code, les configs, les versions et les manifestes.
