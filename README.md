# BG Parallel Count

Angular SPA за паралелно преброяване в секция. Приложението е offline-first и пази всички данни само в `localStorage`.

## Stack

- Angular standalone application
- TypeScript strict mode
- NgRx Store + Effects
- Angular CDK Dialog
- jsPDF + `jspdf-autotable`

## Local development

```bash
npm install
npm start
```

## Build

```bash
npm run build
```

Build output е в `dist/bg-parallel-count/browser`.

## Data files

Reference данните идват от:

- `src/assets/data/election.json`
- `src/assets/data/parties.json`
- `src/assets/data/preferences.json`

## Persistence

- История: `bpc_sessions_v2`
- Активен draft: `bpc_draft_v2`

`StorageService` мигрира автоматично от legacy `v1` ключове, ако са налични.

## PDF font

За коректна кирилица добави `DejaVuSans.ttf` в `src/assets/fonts/`.
Без този файл export-ът пада обратно към вградения шрифт на jsPDF.

## GitHub Pages

Workflow-ът е в `.github/workflows/deploy.yml`.

- `base-href` е настроен за repo `vote-2026`
- `index.html` се копира към `404.html` за SPA routing
