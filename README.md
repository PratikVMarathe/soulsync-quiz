# SoulSync Quiz Remote

The quiz app is a federated remote consumed by the host.

It exposes:

```text
./QuizWidget -> ./src/App.jsx
```

## Default Port

`5001`

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Environment Variables

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
VITE_DEV_PORT=5001
VITE_PREVIEW_PORT=5001
```

## Responsibilities

- fetch quiz content from Firestore
- normalize quiz payloads
- render quiz intro before starting
- render responsive quiz attempt UI
- show friendly fallback states for missing quiz or permission failures

## Development Note

`src/data/previewQuiz.js` exists as local preview/fallback data for UI development and normalization safety. Production quiz content should come from Firestore.

## Important Files

- `src/App.jsx`
- `src/utils/normalizeQuiz.js`
- `src/data/previewQuiz.js`
- `src/data/quizVisuals.js`
- `vite.config.js`

## Related Docs

- [../README.md](../README.md)
- [../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)
- [../docs/FIREBASE_DATA_MODEL.md](../docs/FIREBASE_DATA_MODEL.md)

