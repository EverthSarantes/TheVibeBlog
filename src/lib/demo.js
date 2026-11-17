// Demo mode: in-memory mock backend used when Firebase is not configured.
// Activates automatically when VITE_FIREBASE_API_KEY is missing.

const STORAGE_KEY = "thevibeblog_demo";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
}

const defaultArticles = [
  {
    id: "a1",
    title: "Bienvenido a TheVibeBlog",
    subtitle: "Una plataforma de blogging inspirada en Medium",
    content: "<p>Este es un <strong>artículo de ejemplo</strong>. Puedes editarlo o crear uno nuevo desde el panel.</p><p>TheVibeBlog soporta <em>texto enriquecido</em>, imágenes, citas y más.</p><blockquote>Las ideas que vibran, se comparten.</blockquote>",
    slug: "bienvenido-a-TheVibeBlog",
    coverImage: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200",
    tags: ["bienvenida", "demo"],
    status: "published",
    authorId: "demo-admin",
    authorName: "Demo Admin",
    authorPhoto: "",
    views: 42,
    claps: 12,
    likedBy: ["demo-writer", "demo-reader"],
    commentCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
  },
  {
    id: "a2",
    title: "Cómo escribir un gran artículo",
    subtitle: "Consejos para escritores",
    content: "<p>Escribir es un arte. Aquí algunos consejos para mejorar.</p><ul><li>Escribe todos los días</li><li>Lee mucho</li><li>Edita sin piedad</li></ul>",
    slug: "como-escribir-un-gran-articulo",
    coverImage: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200",
    tags: ["escritura", "consejos"],
    status: "published",
    authorId: "demo-admin",
    authorName: "Demo Admin",
    authorPhoto: "",
    views: 18,
    claps: 5,
    likedBy: ["demo-admin"],
    commentCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
  },
];

let state = loadState() || {
  users: {
    "demo-admin": { uid: "demo-admin", displayName: "Demo Admin", email: "admin@demo.com", photoURL: "", role: "admin", bio: "Administrador de demostración", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    "demo-writer": { uid: "demo-writer", displayName: "Demo Writer", email: "writer@demo.com", photoURL: "", role: "writer", bio: "Escritor de demostración", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    "demo-reader": { uid: "demo-reader", displayName: "Demo Reader", email: "reader@demo.com", photoURL: "", role: "reader", bio: "Lector de demostración", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  },
  articles: defaultArticles.reduce((acc, a) => { acc[a.id] = a; return acc; }, {}),
  comments: { a1: [{ id: "c1", authorId: "demo-writer", authorName: "Demo Writer", authorPhoto: "", content: "¡Excelente artículo!", createdAt: new Date().toISOString() }] },
  invitations: [],
  newsletter: [],
  images: [],
  currentUser: "demo-admin",
};

// ensure comments object
if (!state.comments) state.comments = {};
if (!state.newsletter) state.newsletter = [];
if (!state.invitations) state.invitations = [];
if (!state.images) state.images = [];

let _listeners = [];
export function getCurrentUser() {
  return state.users[state.currentUser] ? { uid: state.currentUser, email: state.users[state.currentUser].email, displayName: state.users[state.currentUser].displayName, photoURL: state.users[state.currentUser].photoURL } : null;
}

export function setCurrentUser(uid) {
  state.currentUser = uid;
  saveState(state);
  _listeners.forEach((fn) => fn(getCurrentUser()));
}

export function onAuthChange(cb) {
  _listeners.push(cb);
  // emit current
  setTimeout(() => cb(getCurrentUser()), 0);
  return () => { _listeners = _listeners.filter((f) => f !== cb); };
}

export function isDemoMode() {
  return !import.meta.env.VITE_FIREBASE_API_KEY;
}

// helpers
function ts() { return new Date().toISOString(); }
function toDoc(d) { return { ...d }; }

// Articles
export async function demoGetArticles({ tag, authorId, status = "published", max = 50 } = {}) {
  let list = Object.values(state.articles).filter((a) => a.status === status);
  if (tag) list = list.filter((a) => (a.tags || []).includes(tag));
  if (authorId) list = list.filter((a) => a.authorId === authorId);
  list.sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));
  return list.slice(0, max).map(toDoc);
}

export async function demoGetArticleBySlug(slug) {
  const a = Object.values(state.articles).find((x) => x.slug === slug);
  return a ? toDoc(a) : null;
}

export async function demoGetArticle(id) {
  return state.articles[id] ? toDoc(state.articles[id]) : null;
}

export async function demoCreateArticle(data) {
  const id = "a" + Date.now().toString(36);
  const slug = data.slug || (slugify(data.title) + "-" + Date.now().toString(36));
  const now = ts();
  const article = {
    ...data,
    id,
    slug,
    createdAt: now,
    updatedAt: now,
    publishedAt: data.status === "published" ? now : null,
    views: 0,
    claps: 0,
    commentCount: 0,
  };
  state.articles[id] = article;
  saveState(state);
  return id;
}

export async function demoUpdateArticle(id, data) {
  if (!state.articles[id]) return;
  state.articles[id] = { ...state.articles[id], ...data, updatedAt: ts() };
  if (data.status === "published" && !state.articles[id].publishedAt) state.articles[id].publishedAt = ts();
  saveState(state);
}

export async function demoDeleteArticle(id) {
  delete state.articles[id];
  delete state.comments[id];
  saveState(state);
}

export async function demoIncrementViews(id) {
  if (state.articles[id]) { state.articles[id].views = (state.articles[id].views || 0) + 1; saveState(state); }
}

export async function demoClapArticle(id, count = 1) {
  if (state.articles[id]) { state.articles[id].claps = (state.articles[id].claps || 0) + count; saveState(state); }
}

export async function demoToggleLike(id, userId) {
  if (!state.articles[id]) return false;
  const likedBy = state.articles[id].likedBy || [];
  if (likedBy.includes(userId)) {
    state.articles[id].claps = Math.max(0, (state.articles[id].claps || 0) - 1);
    state.articles[id].likedBy = likedBy.filter((u) => u !== userId);
    saveState(state);
    return false;
  } else {
    state.articles[id].claps = (state.articles[id].claps || 0) + 1;
    state.articles[id].likedBy = [...likedBy, userId];
    saveState(state);
    return true;
  }
}

// Users
export async function demoGetUserProfile(uid) {
  return state.users[uid] ? toDoc(state.users[uid]) : null;
}

export async function demoUpsertUserProfile(uid, data) {
  if (state.users[uid]) {
    state.users[uid] = { ...state.users[uid], ...data, updatedAt: ts() };
  } else {
    state.users[uid] = { uid, ...data, createdAt: ts(), updatedAt: ts() };
  }
  saveState(state);
}

export async function demoGetAllWriters() {
  return Object.values(state.users).filter((u) => u.role === "writer" || u.role === "admin").map(toDoc);
}

export async function demoGetAllUsers() {
  return Object.values(state.users).map(toDoc);
}

export async function demoUpdateUserRole(uid, role) {
  if (state.users[uid]) {
    state.users[uid].role = role;
    state.users[uid].updatedAt = ts();
    saveState(state);
  }
}

export async function demoGetAllArticlesAdmin(max = 100) {
  return Object.values(state.articles).slice(0, max).map(toDoc);
}

export async function demoSetArticleStatus(id, status) {
  if (state.articles[id]) {
    state.articles[id].status = status;
    state.articles[id].updatedAt = ts();
    saveState(state);
  }
}

// Comments
export async function demoGetComments(articleId) {
  return (state.comments[articleId] || []).map(toDoc);
}

export async function demoAddComment(articleId, data) {
  if (!state.comments[articleId]) state.comments[articleId] = [];
  const c = { id: "c" + Date.now().toString(36), ...data, createdAt: ts() };
  state.comments[articleId].push(c);
  if (state.articles[articleId]) state.articles[articleId].commentCount = (state.articles[articleId].commentCount || 0) + 1;
  saveState(state);
  return c.id;
}

export async function demoDeleteComment(articleId, commentId) {
  if (state.comments[articleId]) {
    state.comments[articleId] = state.comments[articleId].filter((c) => c.id !== commentId);
  }
  if (state.articles[articleId]) state.articles[articleId].commentCount = Math.max(0, (state.articles[articleId].commentCount || 1) - 1);
  saveState(state);
}

// Invitations
export async function demoCreateInvitation(email, invitedBy) {
  const inv = { id: "i" + Date.now().toString(36), email: email.toLowerCase(), invitedBy, status: "pending", createdAt: ts() };
  state.invitations.push(inv);
  saveState(state);
  return inv.id;
}

export async function demoGetInvitationByEmail(email) {
  return state.invitations.find((i) => i.email === email.toLowerCase() && i.status === "pending") || null;
}

export async function demoAcceptInvitation(id) {
  const inv = state.invitations.find((i) => i.id === id);
  if (inv) { inv.status = "accepted"; inv.acceptedAt = ts(); saveState(state); }
}

// Newsletter
export async function demoSubscribeNewsletter(email) {
  if (state.newsletter.some((n) => n.email === email.toLowerCase())) return "already";
  state.newsletter.push({ id: "n" + Date.now().toString(36), email: email.toLowerCase(), createdAt: ts() });
  saveState(state);
  return "ok";
}

export async function demoGetNewsletterSubscribers() {
  return state.newsletter.map(toDoc);
}

// Tags
export async function demoGetAllTags() {
  const set = new Set();
  Object.values(state.articles).forEach((a) => (a.tags || []).forEach((t) => set.add(t)));
  return Array.from(set).sort();
}

function slugify(text) {
  return text.toString().toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "").replace(/\-\-+/g, "-").replace(/^-+/, "").replace(/-+$/, "");
}
export { slugify };

// Image library
export async function demoGetImages() {
  if (!state.images) state.images = [];
  return state.images.map(toDoc);
}

export async function demoSaveImage(dataUrl, name) {
  if (!state.images) state.images = [];
  const img = { id: "img" + Date.now().toString(36), url: dataUrl, name: name || "image", createdAt: ts() };
  state.images.push(img);
  saveState(state);
  return img.id;
}

export async function demoDeleteImage(id) {
  if (!state.images) return;
  state.images = state.images.filter((i) => i.id !== id);
  saveState(state);
}

// Reset demo data
export function resetDemo() {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
}