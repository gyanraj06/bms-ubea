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

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem("booking_cart");
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("booking_cart", JSON.stringify(cart));
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
        }
    ) => {
        setCart((prev) => {
            const currentItem = prev[roomId];
            const currentQty = currentItem?.quantity || 0;
            const maxAvailable = roomDetails?.maxAvailable || currentItem?.maxAvailable || 10; // Default fallback

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

    const totalItems = Object.values(cart).reduce((acc, item) => acc + item.quantity, 0);

    // Calculate total price (excluding tax - tax should be calculated where needed based on rules)
    const subtotal = Object.values(cart).reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return {
        cart,
        updateCart,
        clearCart,
        totalItems,
        subtotal,
        isLoaded
    };
}
