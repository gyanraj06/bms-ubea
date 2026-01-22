"use client";

import { useState, useEffect } from "react";

export interface CartItem {
  roomId: string;
  quantity: number;
  roomType: string;
  price: number;
  maxGuests: number;
  maxAvailable: number;
}

export function useCart() {
  const [cart, setCart] = useState<{ [roomId: string]: CartItem }>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage (or sessionStorage backup) on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const loadCart = (storage: Storage) => {
        const saved = storage.getItem("booking_cart");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Object.keys(parsed).length > 0) return parsed;
          } catch (e) {
            console.error("Failed to parse cart", e);
          }
        }
        return null;
      };

      const localCart = loadCart(localStorage);
      const sessionCart = loadCart(sessionStorage);

      if (localCart) {
        setCart(localCart);
      } else if (sessionCart) {
        console.log("Restoring cart from sessionStorage backup");
        setCart(sessionCart);
        // Restore to localStorage
        localStorage.setItem("booking_cart", JSON.stringify(sessionCart));
      }

      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage AND sessionStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      const itemCount = Object.keys(cart).length;
      console.log("Saving cart to storage:", itemCount, "items");

      const str = JSON.stringify(cart);
      localStorage.setItem("booking_cart", str);
      sessionStorage.setItem("booking_cart", str);
    }
  }, [cart, isLoaded]);

  const updateCart = (
    roomId: string,
    delta: number,
    roomDetails?: {
      roomType: string;
      price: number;
      maxGuests: number;
      maxAvailable: number;
    },
  ) => {
    setCart((prev) => {
      const currentItem = prev[roomId];
      const currentQty = currentItem?.quantity || 0;
      const maxAvailable =
        roomDetails?.maxAvailable || currentItem?.maxAvailable || 10; // Default fallback

      const newQty = Math.max(0, Math.min(currentQty + delta, maxAvailable));

      if (newQty === 0) {
        const { [roomId]: _, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [roomId]: {
          roomId,
          quantity: newQty,
          roomType: roomDetails?.roomType || currentItem?.roomType || "Room",
          price: roomDetails?.price || currentItem?.price || 0,
          maxGuests: roomDetails?.maxGuests || currentItem?.maxGuests || 2,
          maxAvailable,
        },
      };
    });
  };

  const clearCart = () => {
    setCart({});
    localStorage.removeItem("booking_cart");
  };

  const totalItems = Object.values(cart).reduce(
    (acc, item) => acc + item.quantity,
    0,
  );

  // Calculate total price (excluding tax - tax should be calculated where needed based on rules)
  const subtotal = Object.values(cart).reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  return {
    cart,
    updateCart,
    clearCart,
    totalItems,
    subtotal,
    isLoaded,
  };
}
