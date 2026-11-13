# VibeBlog

A Medium-inspired personal blog, 100% vibecoded. Multi-author, bilingual (ES/EN), with a rich text editor, claps, comments and newsletter.

## Stack (cheapest & simplest)

- **Frontend**: React + Vite + TailwindCSS, deployed to GitHub Pages (free).
- **Backend**: Firebase (Auth with Google, Firestore, Storage) on the free Spark plan.
- **Editor**: TipTap (rich text).
- **i18n**: react-i18next (Spanish + English).

No passwords are stored: authentication is delegated to Google via Firebase Auth. Only public content (articles, comments) and minimal profile data are persisted.

## Quick start

```bash
npm install
cp .env.example .env
# fill in your Firebase credentials
npm run dev
```

See [docs/SETUP.md](docs/SETUP.md) for full setup (Firebase, env, deploy).

## Scripts

- `npm run dev` – local dev server
- `npm run build` – production build
- `npm run preview` – preview production build

## Deploy

Push to `main`/`master`: GitHub Actions builds and deploys to GitHub Pages.
Add Firebase env vars as repository secrets (see docs/DEPLOYMENT.md).

## Docs

- [Setup](docs/SETUP.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Firebase](docs/FIREBASE.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Security](docs/SECURITY.md)
- [Contributing](docs/CONTRIBUTING.md)