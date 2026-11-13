# Setup Guide

## 1. Prerequisites
- Node.js 18+
- A Google account
- A GitHub account

## 2. Firebase project
1. Go to https://console.firebase.google.com and create a project.
2. Enable **Authentication** → Sign-in method → **Google**.
3. Create **Firestore Database** (start in production mode).
4. Create **Storage** bucket.
5. Project settings → Your apps → Web app → copy the config values into `.env`.

## 3. Environment
```bash
cp .env.example .env
# fill VITE_FIREBASE_* values
# set VITE_BASE_PATH to your repo path, e.g. /my-blog/
```

## 4. Firestore rules
Deploy rules from `firebase/`:
```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules,storage
```
Or paste `firebase/firestore.rules` and `firebase/storage.rules` in the console.

## 5. Make yourself admin
After first sign-in, open Firestore → `users/{yourUid}` and set `role` to `"admin"`. This lets you invite writers.

## 6. Run locally
```bash
npm install
npm run dev
```

## 7. Invite writers
From the Dashboard, enter an email and send an invitation. When that person signs in with Google using that email, they become a writer.