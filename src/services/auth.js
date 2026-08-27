import { getIdTokenResult, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "./firebase.js";

export async function signInAdmin(email, password) {
  if (!auth) throw new Error("Firebase Authentication is not configured.");

  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  const token = await getIdTokenResult(credential.user, true);

  if (token.claims.admin !== true) {
    await signOut(auth);
    throw new Error("This account is not authorized as an admin.");
  }

  return credential.user;
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
  if (!user) return false;
  const token = await getIdTokenResult(user, true);
  return token.claims.admin === true;
}
