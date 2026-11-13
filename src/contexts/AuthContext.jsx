import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { getUserProfile, upsertUserProfile, getInvitationByEmail, acceptInvitation } from "../lib/firestore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Check invitation / existing profile
        let prof = await getUserProfile(firebaseUser.uid);
        if (!prof) {
          // Check if invited
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
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
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