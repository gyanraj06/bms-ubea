"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function MagicLoginPage() {
    const router = useRouter();
    const supabase = createClientComponentClient();

    useEffect(() => {
        const handleLogin = async () => {
            // Simulate a login (if in development mode, we might mock this differently,
            // but here we genuinely try to sign in or just set local state if we could.
            // Since we need a real session for the server-side checks, we might be stuck.
            // HOWEVER, for UI inspection, we can just populate the cart and redirect?
            // Wait, 'useCart' uses localStorage.

            // 1. Populate Cart
            const dummyCart = {
                "dummy-room-1": {
                    roomId: "dummy-room-1",
                    quantity: 1,
                    roomType: "Premium Villa",
                    price: 5000,
                    maxGuests: 4,
                    maxAvailable: 5
                }
            };
            localStorage.setItem("booking_cart", JSON.stringify(dummyCart));

            // 2. We can't easily fake the Supabase session without a valid token.
            // But maybe we can inspect the UI up to the point of "Proceed to Payment"?
            // The checkout page checks `if (!user)` to redirect to login.
            // We need to bypass that check in the code temporarily OR act as a user.

            // BETTER APPROACH:
            // I will modify `app/booking/checkout/page.tsx` temporarily to COMMENT OUT the auth check
            // and hardcode a dummy user object. This is faster and safer than trying to hack auth.
        };

        handleLogin();
    }, []);

    return <div>Magic Login...</div>;
}
