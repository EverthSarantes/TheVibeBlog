# Security & Privacy

This blog is 100% vibecoded and stores the minimum amount of sensitive data.

## What is stored
- Firebase Auth manages identity (Google). No passwords are ever stored by us.
- User profile: display name, email, photo URL, role, bio.
- Public content: articles, comments, tags, claps, view counts.
- Newsletter emails (opt-in).

## What is NOT stored
- Passwords, tokens, or payment info.
- Private messages.
- Tracking/analytics beyond view counts.

## Controls
- Firestore security rules restrict writes to authenticated writers/admins.
- Only the article author or an admin can edit/delete an article.
- Comments can be deleted by their author or an admin.
- Invitations are admin-only.

## Recommendations
- Keep your Firebase API key restricted by HTTP referrer in the Google Cloud console.
- Enable App Check for production.
- Rotate credentials if leaked.
- Review Firestore rules before deploying.