import { onAuthStateChanged, signInWithEmailAndPassword, signOut, getIdTokenResult } from "firebase/auth";
import { auth } from "./firebase.js";

export async function getAdminProfile(user) {
  if (!user || !auth) return null;

  const token = await getIdTokenResult(user, true);
  if (token.claims?.admin !== true) return null;

  return {
    uid: user.uid,
    email: user.email || "",
    role: "admin",
    storeId: token.claims?.storeId || null
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
