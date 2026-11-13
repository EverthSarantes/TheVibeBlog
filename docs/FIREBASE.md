# Firebase Configuration

## Collections & indexes
Firestore composite indexes may be required for:
- `articles` where `status == published` orderBy `publishedAt desc`
- `articles` where `status == published` and `authorId == X` orderBy `publishedAt desc`
- `articles` where `status == published` and `tags array-contains Y` orderBy `publishedAt desc`

Create them when the console prompts, or add to `firestore.indexes.json`.

## Authentication
Only Google provider is enabled. User profile is created on first sign-in. Role is assigned based on pending invitations: invited emails become `writer`, everyone else `reader`. Set your own user to `admin` manually.

## Storage
Used for optional cover images (currently URL-based). Rules allow reads for all and writes for authenticated users.

## Cost
Spark (free) plan covers typical personal blog traffic. Upgrade only if needed.