import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase.js";

export async function createOrder(order) {
  if (!db) {
    throw new Error("Firebase is not configured.");
  }

  const docRef = await addDoc(collection(db, "orders"), {
    ...order,
    createdAt: serverTimestamp()
  });

  return docRef.id;
}