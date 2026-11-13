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
} from "firebase/firestore";
import { db } from "./firebase";

// ---------- Articles ----------

export const articlesCol = () => collection(db, "articles");

export async function getArticles({ tag, authorId, status = "published", max = 50 } = {}) {
  let q = query(articlesCol(), where("status", "==", status), orderBy("publishedAt", "desc"), limit(max));
  if (tag) q = query(articlesCol(), where("status", "==", status), where("tags", "array-contains", tag), orderBy("publishedAt", "desc"), limit(max));
  if (authorId) q = query(articlesCol(), where("status", "==", status), where("authorId", "==", authorId), orderBy("publishedAt", "desc"), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getArticleBySlug(slug) {
  const q = query(articlesCol(), where("slug", "==", slug), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

export async function getArticle(id) {
  const ref = doc(db, "articles", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function createArticle(data) {
  const ref = await addDoc(articlesCol(), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    publishedAt: data.status === "published" ? serverTimestamp() : null,
    views: 0,
    claps: 0,
    commentCount: 0,
  });
  return ref.id;
}

export async function updateArticle(id, data) {
  const ref = doc(db, "articles", id);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
    ...(data.status === "published" ? { publishedAt: serverTimestamp() } : {}),
  });
}

export async function deleteArticle(id) {
  await deleteDoc(doc(db, "articles", id));
}

export async function incrementViews(id) {
  await updateDoc(doc(db, "articles", id), { views: increment(1) });
}

export async function clapArticle(id, count = 1) {
  await updateDoc(doc(db, "articles", id), { claps: increment(count) });
}

// ---------- Users / Profiles ----------

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function upsertUserProfile(uid, data) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
  } else {
    await updateDoc(ref, {}).catch(() => {});
    // create if not exists
    const { setDoc } = await import("firebase/firestore");
    await setDoc(ref, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  }
}

export async function getAllWriters() {
  const q = query(collection(db, "users"), where("role", "in", ["writer", "admin"]));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ---------- Comments ----------

export async function getComments(articleId) {
  const q = query(collection(db, "articles", articleId, "comments"), orderBy("createdAt", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addComment(articleId, data) {
  const ref = await addDoc(collection(db, "articles", articleId, "comments"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, "articles", articleId), { commentCount: increment(1) });
  return ref.id;
}

export async function deleteComment(articleId, commentId) {
  await deleteDoc(doc(db, "articles", articleId, "comments", commentId));
  await updateDoc(doc(db, "articles", articleId), { commentCount: increment(-1) });
}

// ---------- Invitations ----------

export async function createInvitation(email, invitedBy) {
  const ref = await addDoc(collection(db, "invitations"), {
    email: email.toLowerCase(),
    invitedBy,
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getInvitationByEmail(email) {
  const q = query(collection(db, "invitations"), where("email", "==", email.toLowerCase()), where("status", "==", "pending"), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

export async function acceptInvitation(id) {
  await updateDoc(doc(db, "invitations", id), { status: "accepted", acceptedAt: serverTimestamp() });
}

// ---------- Newsletter ----------

export async function subscribeNewsletter(email) {
  const ref = collection(db, "newsletter");
  const q = query(ref, where("email", "==", email.toLowerCase()), limit(1));
  const snap = await getDocs(q);
  if (!snap.empty) return "already";
  await addDoc(ref, { email: email.toLowerCase(), createdAt: serverTimestamp() });
  return "ok";
}

export async function getNewsletterSubscribers() {
  const snap = await getDocs(collection(db, "newsletter"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ---------- Tags ----------

export async function getAllTags() {
  const snap = await getDocs(articlesCol());
  const set = new Set();
  snap.docs.forEach((d) => (d.data().tags || []).forEach((t) => set.add(t)));
  return Array.from(set).sort();
}