import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "./firebase.js";

export async function getAdminProfile(user) {
  if (!user || !db) return null;

  const snapshot = await getDoc(doc(db, "admins", user.uid));
  if (!snapshot.exists()) return null;

  const data = snapshot.data();
  if (data?.role !== "admin") return null;

  return {
    uid: user.uid,
    email: user.email || "",
    role: data.role,
    storeId: data.storeId || null
  };
}

export async function signInAdmin(email, password) {
  if (!auth) throw new Error("Firebase Authentication is not configured.");

  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  const profile = await getAdminProfile(credential.user);

  if (!profile) {
    await signOut(auth);
    throw new Error("This account is not authorized as an admin.");
  }

  return { user: credential.user, profile };
}

export function watchAuth(callback) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export function logout() {
  if (auth) return signOut(auth);
  return Promise.resolve();
}

export async function isAdmin(user) {
  return Boolean(await getAdminProfile(user));
}
