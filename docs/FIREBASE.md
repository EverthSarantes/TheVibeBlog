# Firebase Configuration

## Collections & indexes
Composite indexes are required for the following queries (defined in `firebase/firestore.indexes.json`):

1. `articles`: `status` (ASC) + `publishedAt` (DESC)
2. `articles`: `status` (ASC) + `authorId` (ASC) + `publishedAt` (DESC)
3. `articles`: `status` (ASC) + `tags` (CONTAINS) + `publishedAt` (DESC)

Deploy them with:
```bash
firebase deploy --only firestore:indexes
```
Or click the auto-generated links in the browser console when the error appears.

## Authentication
Only Google provider is enabled. User profile is created on first sign-in. Role is assigned based on pending invitations: invited emails become `writer`, everyone else `reader`. Set your own user to `admin` manually.

## Storage
Used for optional cover images (currently URL-based). Rules allow reads for all and writes for authenticated users.

## Cost
Spark (free) plan covers typical personal blog traffic. Upgrade only if needed.