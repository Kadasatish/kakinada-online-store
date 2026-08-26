import { useEffect, useMemo, useState } from "react";

const KEY = "kakinada-store-cart";

export function useCart() {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(cart));
  }, [cart]);

  function add(product) {
    setCart((current) => {
      const found = current.find((item) => item.id === product.id);
      if (found) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
  }

  function update(id, quantity) {
    if (quantity <= 0) return remove(id);
    setCart((current) => current.map((item) => item.id === id ? { ...item, quantity } : item));
  }

  function remove(id) {
    setCart((current) => current.filter((item) => item.id !== id));
  }

  function clear() {
    setCart([]);
  }

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  return { cart, add, update, remove, clear, subtotal };
}