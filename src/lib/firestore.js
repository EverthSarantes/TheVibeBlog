import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import * as demo from "./demo";
import * as cache from "./cache";

const isDemo = () => demo.isDemoMode();

// ---------- Articles ----------

export const articlesCol = () => (isDemo() ? null : collection(db, "articles"));

export async function getArticles(opts = {}) {
  if (isDemo()) return demo.demoGetArticles(opts);
  const { tag, authorId, status = "published", max = 50 } = opts;
  const cacheKey = `articles:${status}:${tag || ""}:${authorId || ""}:${max}`;
  const cached = cache.cacheGet(cacheKey);
  if (cached) return cached;

  let q = query(collection(db, "articles"), where("status", "==", status), orderBy("publishedAt", "desc"), limit(max));
  if (tag) q = query(collection(db, "articles"), where("status", "==", status), where("tags", "array-contains", tag), orderBy("publishedAt", "desc"), limit(max));
  if (authorId) q = query(collection(db, "articles"), where("status", "==", status), where("authorId", "==", authorId), orderBy("publishedAt", "desc"), limit(max));
  const snap = await getDocs(q);
  const result = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  cache.cacheSet(cacheKey, result, cache.TTL.SHORT);
  return result;
}

export async function getArticleBySlug(slug) {
  if (isDemo()) return demo.demoGetArticleBySlug(slug);
  const cacheKey = `article:slug:${slug}`;
  const cached = cache.cacheGet(cacheKey);
  if (cached) return cached;

  const q = query(collection(db, "articles"), where("slug", "==", slug), where("status", "==", "published"), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  const result = { id: d.id, ...d.data() };
  cache.cacheSet(cacheKey, result, cache.TTL.MEDIUM);
  return result;
}

export async function getArticle(id) {
  if (isDemo()) return demo.demoGetArticle(id);
  const cacheKey = `article:id:${id}`;
  const cached = cache.cacheGet(cacheKey);
  if (cached) return cached;

  const ref = doc(db, "articles", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const result = { id: snap.id, ...snap.data() };
  cache.cacheSet(cacheKey, result, cache.TTL.MEDIUM);
  return result;
}

export async function createArticle(data) {
  if (isDemo()) {
    const id = await demo.demoCreateArticle(data);
    cache.cacheInvalidatePrefix("articles:");
    return id;
  }
  const ref = await addDoc(collection(db, "articles"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    publishedAt: data.status === "published" ? serverTimestamp() : null,
    views: 0,
    claps: 0,
    likedBy: [],
    commentCount: 0,
  });
  cache.cacheInvalidatePrefix("articles:");
  return ref.id;
}

export async function updateArticle(id, data) {
  if (isDemo()) {
    await demo.demoUpdateArticle(id, data);
    cache.cacheInvalidate(`article:id:${id}`);
    cache.cacheInvalidatePrefix("articles:");
    return;
  }
  const ref = doc(db, "articles", id);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
    ...(data.status === "published" ? { publishedAt: serverTimestamp() } : {}),
  });
  cache.cacheInvalidate(`article:id:${id}`);
  cache.cacheInvalidatePrefix("articles:");
  // Also invalidate slug cache if slug exists
  const art = await getArticle(id);
  if (art?.slug) cache.cacheInvalidate(`article:slug:${art.slug}`);
}

export async function deleteArticle(id) {
  if (isDemo()) {
    await demo.demoDeleteArticle(id);
    cache.cacheInvalidate(`article:id:${id}`);
    cache.cacheInvalidatePrefix("articles:");
    return;
  }
  const art = await getArticle(id);
  await deleteDoc(doc(db, "articles", id));
  cache.cacheInvalidate(`article:id:${id}`);
  if (art?.slug) cache.cacheInvalidate(`article:slug:${art.slug}`);
  cache.cacheInvalidatePrefix("articles:");
}

export async function incrementViews(id) {
  if (isDemo()) {
    await demo.demoIncrementViews(id);
    return;
  }
  // Don't invalidate cache for view count (minor, reduces reads)
  await updateDoc(doc(db, "articles", id), { views: increment(1) });
  // Update cached article view count
  const cached = cache.cacheGet(`article:id:${id}`);
  if (cached) {
    cached.views = (cached.views || 0) + 1;
    cache.cacheSet(`article:id:${id}`, cached, cache.TTL.MEDIUM);
  }
}

export async function toggleLike(id, userId) {
  if (isDemo()) {
    const result = await demo.demoToggleLike(id, userId);
    cache.cacheInvalidate(`article:id:${id}`);
    cache.cacheInvalidatePrefix("articles:");
    return result;
  }
  const ref = doc(db, "articles", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return false;
  const data = snap.data();
  const likedBy = data.likedBy || [];
  if (likedBy.includes(userId)) {
    await updateDoc(ref, {
      claps: increment(-1),
      likedBy: arrayRemove(userId),
    });
    cache.cacheInvalidate(`article:id:${id}`);
    cache.cacheInvalidatePrefix("articles:");
    return false;
  } else {
    await updateDoc(ref, {
      claps: increment(1),
      likedBy: arrayUnion(userId),
    });
    cache.cacheInvalidate(`article:id:${id}`);
    cache.cacheInvalidatePrefix("articles:");
    return true;
  }
}

// ---------- Users / Profiles ----------

export async function getUserProfile(uid) {
  if (isDemo()) return demo.demoGetUserProfile(uid);
  const cacheKey = `user:${uid}`;
  const cached = cache.cacheGet(cacheKey);
  if (cached) return cached;

  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const result = { id: snap.id, ...snap.data() };
  cache.cacheSet(cacheKey, result, cache.TTL.LONG);
  return result;
}

export async function upsertUserProfile(uid, data) {
  if (isDemo()) {
    await demo.demoUpsertUserProfile(uid, data);
    cache.cacheInvalidate(`user:${uid}`);
    return;
  }
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
  } else {
    await setDoc(ref, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  }
  cache.cacheInvalidate(`user:${uid}`);
}

export async function getAllWriters() {
  if (isDemo()) return demo.demoGetAllWriters();
  const cacheKey = "users:writers";
  const cached = cache.cacheGet(cacheKey);
  if (cached) return cached;

  const q = query(collection(db, "users"), where("role", "in", ["writer", "admin"]));
  const snap = await getDocs(q);
  const result = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  cache.cacheSet(cacheKey, result, cache.TTL.LONG);
  return result;
}

export async function getAllUsers() {
  if (isDemo()) return demo.demoGetAllUsers();
  const cacheKey = "users:all";
  const cached = cache.cacheGet(cacheKey);
  if (cached) return cached;

  const snap = await getDocs(collection(db, "users"));
  const result = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  cache.cacheSet(cacheKey, result, cache.TTL.LONG);
  return result;
}

export async function updateUserRole(uid, role) {
  if (isDemo()) {
    await demo.demoUpdateUserRole(uid, role);
    cache.cacheInvalidate(`user:${uid}`);
    cache.cacheInvalidate("users:all");
    cache.cacheInvalidate("users:writers");
    return;
  }
  await updateDoc(doc(db, "users", uid), { role, updatedAt: serverTimestamp() });
  cache.cacheInvalidate(`user:${uid}`);
  cache.cacheInvalidate("users:all");
  cache.cacheInvalidate("users:writers");
}

export async function getAllArticlesAdmin(max = 100) {
  if (isDemo()) return demo.demoGetAllArticlesAdmin(max);
  const cacheKey = `articles:admin:${max}`;
  const cached = cache.cacheGet(cacheKey);
  if (cached) return cached;

  const snap = await getDocs(query(collection(db, "articles"), limit(max)));
  const result = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  cache.cacheSet(cacheKey, result, cache.TTL.SHORT);
  return result;
}

export async function setArticleStatus(id, status) {
  if (isDemo()) {
    await demo.demoSetArticleStatus(id, status);
    cache.cacheInvalidate(`article:id:${id}`);
    cache.cacheInvalidatePrefix("articles:");
    return;
  }
  await updateDoc(doc(db, "articles", id), { status, updatedAt: serverTimestamp() });
  cache.cacheInvalidate(`article:id:${id}`);
  cache.cacheInvalidatePrefix("articles:");
}

// ---------- Comments ----------

export async function getComments(articleId) {
  if (isDemo()) return demo.demoGetComments(articleId);
  const cacheKey = `comments:${articleId}`;
  const cached = cache.cacheGet(cacheKey);
  if (cached) return cached;

  const q = query(collection(db, "articles", articleId, "comments"), orderBy("createdAt", "asc"));
  const snap = await getDocs(q);
  const result = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  cache.cacheSet(cacheKey, result, cache.TTL.SHORT);
  return result;
}

export async function addComment(articleId, data) {
  if (isDemo()) {
    const id = await demo.demoAddComment(articleId, data);
    cache.cacheInvalidate(`comments:${articleId}`);
    return id;
  }
  const ref = await addDoc(collection(db, "articles", articleId, "comments"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, "articles", articleId), { commentCount: increment(1) });
  cache.cacheInvalidate(`comments:${articleId}`);
  cache.cacheInvalidate(`article:id:${articleId}`);
  return ref.id;
}

export async function deleteComment(articleId, commentId) {
  if (isDemo()) {
    await demo.demoDeleteComment(articleId, commentId);
    cache.cacheInvalidate(`comments:${articleId}`);
    return;
  }
  await deleteDoc(doc(db, "articles", articleId, "comments", commentId));
  await updateDoc(doc(db, "articles", articleId), { commentCount: increment(-1) });
  cache.cacheInvalidate(`comments:${articleId}`);
  cache.cacheInvalidate(`article:id:${articleId}`);
}

// ---------- Invitations ----------

export async function createInvitation(email, invitedBy) {
  if (isDemo()) return demo.demoCreateInvitation(email, invitedBy);
  const ref = await addDoc(collection(db, "invitations"), {
    email: email.toLowerCase(),
    invitedBy,
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getInvitationByEmail(email) {
  if (isDemo()) return demo.demoGetInvitationByEmail(email);
  const q = query(collection(db, "invitations"), where("email", "==", email.toLowerCase()), where("status", "==", "pending"), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

export async function acceptInvitation(id) {
  if (isDemo()) return demo.demoAcceptInvitation(id);
  await updateDoc(doc(db, "invitations", id), { status: "accepted", acceptedAt: serverTimestamp() });
}

// ---------- Newsletter ----------

export async function subscribeNewsletter(email) {
  if (isDemo()) return demo.demoSubscribeNewsletter(email);
  const ref = collection(db, "newsletter");
  const q = query(ref, where("email", "==", email.toLowerCase()), limit(1));
  const snap = await getDocs(q);
  if (!snap.empty) return "already";
  await addDoc(ref, { email: email.toLowerCase(), createdAt: serverTimestamp() });
  return "ok";
}

export async function getNewsletterSubscribers() {
  if (isDemo()) return demo.demoGetNewsletterSubscribers();
  const cacheKey = "newsletter:subscribers";
  const cached = cache.cacheGet(cacheKey);
  if (cached) return cached;

  const snap = await getDocs(collection(db, "newsletter"));
  const result = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  cache.cacheSet(cacheKey, result, cache.TTL.MEDIUM);
  return result;
}

// ---------- Tags ----------

export async function getAllTags() {
  if (isDemo()) return demo.demoGetAllTags();
  const cacheKey = "tags:all";
  const cached = cache.cacheGet(cacheKey);
  if (cached) return cached;

  const q = query(collection(db, "articles"), where("status", "==", "published"));
  const snap = await getDocs(q);
  const set = new Set();
  snap.docs.forEach((d) => (d.data().tags || []).forEach((t) => set.add(t)));
  const result = Array.from(set).sort();
  cache.cacheSet(cacheKey, result, cache.TTL.STATIC);
  return result;
}