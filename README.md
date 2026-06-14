# Generateur Image C2R

Application web locale pour piloter C2R hors Telegram.

## Demarrage

```powershell
cd "D:\00_Cerveau_IA\Projet\05_Generateur image C2R"
npm install
npm run manifest:refresh
npm run dev
```

URL locale par defaut:

`http://localhost:5176`

## Principe

- `src/app` contient l'interface web.
- `src/server` expose l'API locale.
- `src/c2r` contient les adaptateurs C2R, manifestes et jobs.
- `versions` contient les versions concretes C2R.
- `runtime` contient outputs, logs, jobs et feedbacks locaux ignores par Git.

Le corpus `Image valide` n'est pas copie dans le depot. Il est lu depuis le dossier existant et suivi avec un manifeste JSON.

## Compatibilite

Telegram reste dans `D:\00_Cerveau_IA\Conpetances` et n'est pas deplace dans cette premiere version. L'application web appelle le script C2R legacy configure dans `config/c2r.paths.json`.
