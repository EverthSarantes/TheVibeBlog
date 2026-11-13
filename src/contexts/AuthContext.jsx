import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { getUserProfile, upsertUserProfile, getInvitationByEmail, acceptInvitation } from "../lib/firestore";
import * as demo from "../lib/demo";

const AuthContext = createContext(null);

const isDemo = () => demo.isDemoMode();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemo()) {
      const unsub = demo.onAuthChange(async (du) => {
        if (du) {
          let prof = await getUserProfile(du.uid);
          if (!prof) {
            await upsertUserProfile(du.uid, {
              uid: du.uid,
              displayName: du.displayName,
              email: du.email,
              photoURL: du.photoURL || "",
              role: "admin",
              bio: "",
            });
            prof = await getUserProfile(du.uid);
          }
          setUser(du);
          setProfile(prof);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      });
      return () => unsub();
    }

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let prof = await getUserProfile(firebaseUser.uid);
        if (!prof) {
          const inv = await getInvitationByEmail(firebaseUser.email);
          const role = inv ? "writer" : "reader";
          if (inv) await acceptInvitation(inv.id);
          await upsertUserProfile(firebaseUser.uid, {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || firebaseUser.email.split("@")[0],
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL || "",
            role,
            bio: "",
          });
          prof = await getUserProfile(firebaseUser.uid);
        }
        setUser(firebaseUser);
        setProfile(prof);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const login = async () => {
    if (isDemo()) {
      const cur = demo.getCurrentUser()?.uid;
      const next = cur === "demo-admin" ? "demo-writer" : cur === "demo-writer" ? "demo-reader" : "demo-admin";
      demo.setCurrentUser(next);
      return;
    }
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    if (isDemo()) {
      demo.setCurrentUser(null);
      return;
    }
    await signOut(auth);
  };

  const refreshProfile = async () => {
    if (user) {
      const prof = await getUserProfile(user.uid);
      setProfile(prof);
    }
  };

  const isWriter = profile?.role === "writer" || profile?.role === "admin";
  const isAdmin = profile?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout, refreshProfile, isWriter, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}