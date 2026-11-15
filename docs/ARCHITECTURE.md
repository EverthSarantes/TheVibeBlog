# Architecture

## Frontend
- React 19 + Vite 8
- TailwindCSS 3 (dark mode via `class`)
- React Router 7 (BrowserRouter, basename from env)
- TipTap editor
- react-i18next (ES/EN)

## Backend (Firebase)
- **Auth**: Google Sign-In only. No passwords stored.
- **Firestore**: collections `users`, `articles`, `invitations`, `newsletter`. Articles contain a `comments` subcollection.
- **Storage**: optional media (rules allow authenticated writes).

## Data model
### users/{uid}
`displayName, email, photoURL, role (reader|writer|admin), bio, createdAt, updatedAt`

### articles/{id}
`title, subtitle, content (HTML), slug, coverImage, tags[], status (draft|published), authorId, authorName, authorPhoto, views, claps, commentCount, createdAt, updatedAt, publishedAt`

### articles/{id}/comments/{id}
`authorId, authorName, authorPhoto, content, createdAt`

### invitations/{id}
`email, invitedBy, status (pending|accepted), createdAt, acceptedAt`

### newsletter/{id}
`email, createdAt`

## Routing
`/`, `/article/:slug`, `/write`, `/edit/:id`, `/dashboard`, `/admin`, `/u/:uid`, `/login`, `/search`, `/privacy`.

## Key features
- **Likes**: Toggle like per user (stored in `likedBy` array on article). One like per user.
- **Image upload**: Images compressed to base64 (max 2400px, WebP/JPEG 85%) and stored in Firestore. No Firebase Storage needed.
- **Auto-save drafts**: Editor auto-saves to localStorage every second. Restores on page reload.
- **Admin panel**: User role management, article moderation (draft/publish/delete), comment deletion.
- **Privacy policy**: `/privacy` page disclosing AI-generated code and data collection.