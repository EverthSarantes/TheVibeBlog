import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock Firebase in tests
vi.mock("../lib/firebase", () => ({
  auth: {},
  db: {},
  storage: {},
  googleProvider: {},
  isDemo: true,
}));

vi.mock("../lib/demo", () => ({
  isDemoMode: () => true,
  onAuthChange: (cb) => { cb({ uid: "test-user", email: "test@test.com", displayName: "Test User", photoURL: "" }); return () => {}; },
  getCurrentUser: () => ({ uid: "test-user", email: "test@test.com", displayName: "Test User", photoURL: "" }),
  setCurrentUser: () => {},
  resetDemo: () => {},
  demoGetArticles: async () => [],
  demoGetArticleBySlug: async () => null,
  demoGetArticle: async () => null,
  demoCreateArticle: async () => "test-id",
  demoUpdateArticle: async () => {},
  demoDeleteArticle: async () => {},
  demoIncrementViews: async () => {},
  demoClapArticle: async () => {},
  demoGetUserProfile: async () => ({ uid: "test-user", displayName: "Test User", role: "admin", bio: "" }),
  demoUpsertUserProfile: async () => {},
  demoGetAllWriters: async () => [],
  demoGetComments: async () => [],
  demoAddComment: async () => "c1",
  demoDeleteComment: async () => {},
  demoCreateInvitation: async () => "i1",
  demoGetInvitationByEmail: async () => null,
  demoAcceptInvitation: async () => {},
  demoSubscribeNewsletter: async () => "ok",
  demoGetNewsletterSubscribers: async () => [],
  demoGetAllTags: async () => ["test"],
}));