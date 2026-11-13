# Deployment

## GitHub Pages (frontend)
1. Push repository to GitHub.
2. Settings → Pages → Source: **GitHub Actions**.
3. Add repository secrets for all `VITE_FIREBASE_*` values.
4. (Optional) Set repository variable `VITE_BASE_PATH` to your repo path (default `/Blog/`).
5. Push to `main`/`master` triggers `.github/workflows/deploy.yml`.

## Custom domain
Set `VITE_BASE_PATH=/` and configure the custom domain in GitHub Pages settings. Update `basename` accordingly.

## Firebase (backend)
Rules are deployed via `firebase deploy --only firestore:rules,storage`. The backend is serverless; no server to manage.