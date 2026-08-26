import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase.js";

const LOCAL_KEY = "kakinada-store-orders";

function readLocalOrders() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeLocalOrders(orders) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(orders));
}

export async function createOrder(order) {
  if (db) {
    const docRef = await addDoc(collection(db, "orders"), {
      ...order,
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, source: "firestore" };
  }

  const localOrder = {
    ...order,
    id: order.id || `ORD-${Date.now()}`,
    createdAt: order.createdAt || new Date().toISOString()
  };
  writeLocalOrders([localOrder, ...readLocalOrders()]);
  return { id: localOrder.id, source: "local" };
}

export function getLocalOrders() {
  return readLocalOrders();
}
