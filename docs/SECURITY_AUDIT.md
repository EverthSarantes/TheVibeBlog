# Security Audit — VibeBlog

## Threat Model
The codebase, Firebase config, and Firestore rules are **public**. This document outlines risks and mitigations.

## Risks & Mitigations

### 1. Firebase API Key Exposure
- **Risk**: API key is in the client bundle (unavoidable for web apps).
- **Mitigation**: Restrict the API key by HTTP referrer in Google Cloud Console (only allow your domain + localhost). Enable App Check for production.

### 2. Firestore Rules Bypass
- **Risk**: Attacker reads/modifies data directly via Firebase SDK.
- **Mitigation**: Strict rules with data validation:
  - Users cannot change their own `role` field (prevents privilege escalation).
  - Articles can only be created by writers/admins.
  - Articles can only be edited by their author or admin.
  - Comments can only be deleted by author or admin.
  - Newsletter emails are validated (max 254 chars).
  - Article content max 100,000 chars, title max 200 chars.
  - Comment content max 2,000 chars.

### 3. XSS (Cross-Site Scripting)
- **Risk**: Malicious HTML in article content or comments.
- **Mitigation**:
  - DOMPurify sanitizes article content before rendering.
  - Comments are rendered as plain text (not HTML).
  - CSP headers restrict script execution.

### 4. Privilege Escalation
- **Risk**: User modifies their role to admin.
- **Mitigation**: Firestore rules prevent users from modifying the `role` field on their own document. Only admins can change roles.

### 5. Data Enumeration
- **Risk**: Attacker lists all users/articles.
- **Mitigation**: 
  - Users collection is readable (needed for author profiles). Consider restricting to authenticated users only if privacy is a concern.
  - Articles are readable only if published (drafts are protected).

### 6. Denial of Service / Cost Abuse
- **Risk**: Attacker makes thousands of reads/writes to inflate Firebase costs.
- **Mitigation**:
  - Client-side rate limiting on comments (3s cooldown) and likes (1s cooldown).
  - Firestore quotas and billing alerts (configure in Firebase Console).
  - Caching reduces repeated reads.
  - App Check (recommended for production) verifies requests come from the legitimate app.

### 7. Content Injection
- **Risk**: Attacker creates articles with malicious content.
- **Mitigation**: Only invited writers/admins can create articles. Invitations are admin-only.

### 8. Storage Abuse
- **Risk**: Large file uploads.
- **Mitigation**: Images are compressed client-side (max 2400px, WebP/JPEG 85%). Max file size 10MB. No Firebase Storage used (base64 in Firestore, 1MB doc limit).

## Recommended Production Steps

1. **Restrict API Key**: Google Cloud Console → Credentials → HTTP referrers.
2. **Enable App Check**: Firebase Console → App Check → Register app.
3. **Set billing alerts**: Firebase Console → Usage and billing → Budget alerts.
4. **Review rules periodically**: Especially after adding new features.
5. **Enable 2FA** on the Firebase/Google account.
6. **Monitor usage**: Firebase Console → Usage tab.

## Remaining Risks (Accepted)

- Client-side rate limiting can be bypassed by determined attackers. Firestore rules are the real boundary.
- User profiles (display name, email, photo) are publicly readable. This is by design for a blog.
- Article content is public (by design).