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

const isDemo = () => demo.isDemoMode();

// ---------- Articles ----------

export const articlesCol = () => (isDemo() ? null : collection(db, "articles"));

export async function getArticles(opts = {}) {
  if (isDemo()) return demo.demoGetArticles(opts);
  const { tag, authorId, status = "published", max = 50 } = opts;
  let q = query(collection(db, "articles"), where("status", "==", status), orderBy("publishedAt", "desc"), limit(max));
  if (tag) q = query(collection(db, "articles"), where("status", "==", status), where("tags", "array-contains", tag), orderBy("publishedAt", "desc"), limit(max));
  if (authorId) q = query(collection(db, "articles"), where("status", "==", status), where("authorId", "==", authorId), orderBy("publishedAt", "desc"), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getArticleBySlug(slug) {
  if (isDemo()) return demo.demoGetArticleBySlug(slug);
  const q = query(collection(db, "articles"), where("slug", "==", slug), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

export async function getArticle(id) {
  if (isDemo()) return demo.demoGetArticle(id);
  const ref = doc(db, "articles", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function createArticle(data) {
  if (isDemo()) return demo.demoCreateArticle(data);
  const ref = await addDoc(collection(db, "articles"), {
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
  if (isDemo()) return demo.demoUpdateArticle(id, data);
  const ref = doc(db, "articles", id);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
    ...(data.status === "published" ? { publishedAt: serverTimestamp() } : {}),
  });
}

export async function deleteArticle(id) {
  if (isDemo()) return demo.demoDeleteArticle(id);
  await deleteDoc(doc(db, "articles", id));
}

export async function incrementViews(id) {
  if (isDemo()) return demo.demoIncrementViews(id);
  await updateDoc(doc(db, "articles", id), { views: increment(1) });
}

export async function clapArticle(id, count = 1) {
  if (isDemo()) return demo.demoClapArticle(id, count);
  await updateDoc(doc(db, "articles", id), { claps: increment(count) });
}

export async function toggleLike(id, userId) {
  if (isDemo()) return demo.demoToggleLike(id, userId);
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
    return false;
  } else {
    await updateDoc(ref, {
      claps: increment(1),
      likedBy: arrayUnion(userId),
    });
    return true;
  }
}

// ---------- Users / Profiles ----------

export async function getUserProfile(uid) {
  if (isDemo()) return demo.demoGetUserProfile(uid);
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function upsertUserProfile(uid, data) {
  if (isDemo()) return demo.demoUpsertUserProfile(uid, data);
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
  } else {
    await setDoc(ref, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  }
}

export async function getAllWriters() {
  if (isDemo()) return demo.demoGetAllWriters();
  const q = query(collection(db, "users"), where("role", "in", ["writer", "admin"]));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getAllUsers() {
  if (isDemo()) return demo.demoGetAllUsers();
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateUserRole(uid, role) {
  if (isDemo()) return demo.demoUpdateUserRole(uid, role);
  await updateDoc(doc(db, "users", uid), { role, updatedAt: serverTimestamp() });
}

export async function getAllArticlesAdmin(max = 100) {
  if (isDemo()) return demo.demoGetAllArticlesAdmin(max);
  const snap = await getDocs(query(collection(db, "articles"), limit(max)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function setArticleStatus(id, status) {
  if (isDemo()) return demo.demoSetArticleStatus(id, status);
  await updateDoc(doc(db, "articles", id), { status, updatedAt: serverTimestamp() });
}

// ---------- Comments ----------

export async function getComments(articleId) {
  if (isDemo()) return demo.demoGetComments(articleId);
  const q = query(collection(db, "articles", articleId, "comments"), orderBy("createdAt", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addComment(articleId, data) {
  if (isDemo()) return demo.demoAddComment(articleId, data);
  const ref = await addDoc(collection(db, "articles", articleId, "comments"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, "articles", articleId), { commentCount: increment(1) });
  return ref.id;
}

export async function deleteComment(articleId, commentId) {
  if (isDemo()) return demo.demoDeleteComment(articleId, commentId);
  await deleteDoc(doc(db, "articles", articleId, "comments", commentId));
  await updateDoc(doc(db, "articles", articleId), { commentCount: increment(-1) });
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
  const snap = await getDocs(collection(db, "newsletter"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ---------- Tags ----------

export async function getAllTags() {
  if (isDemo()) return demo.demoGetAllTags();
  const snap = await getDocs(collection(db, "articles"));
  const set = new Set();
  snap.docs.forEach((d) => (d.data().tags || []).forEach((t) => set.add(t)));
  return Array.from(set).sort();
}