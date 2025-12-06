"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";

export default function DebugPage() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [envInfo, setEnvInfo] = useState<any>({});
    const [cookieString, setCookieString] = useState("");
    const supabase = createClientComponentClient();

    useEffect(() => {
        // 1. Show Env & Cookies Immediately
        setCookieString(document.cookie);
        setEnvInfo({
            url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Defined" : "Missing",
            anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Defined" : "Missing",
            origin: window.location.origin,
            hostname: window.location.hostname,
            protocol: window.location.protocol,
        });

        const checkSession = async () => {
            try {
                console.log("Checking session...");
                // 2. Race getSession against a 5s timeout
                const sessionPromise = supabase.auth.getSession();
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Timeout: getSession took too long")), 5000)
                );

                const { data } = await Promise.race([sessionPromise, timeoutPromise]) as any;
                console.log("Session data:", data);
                setSession(data.session);
            } catch (e: any) {
                console.error("Debug Error:", e);
                setSession({ error: e.message || String(e) });
            } finally {
                setLoading(false);
            }
        };

        checkSession();
    }, [supabase]);

    return (
        <div className="p-8 font-mono text-sm">
            <h1 className="text-2xl font-bold mb-4">Debug Info</h1>

            <div className="mb-8 p-4 bg-gray-100 rounded">
                <h2 className="font-bold mb-2">Environment</h2>
                <pre>{JSON.stringify(envInfo, null, 2)}</pre>
            </div>

            <div className="mb-8 p-4 bg-gray-100 rounded">
                <h2 className="font-bold mb-2">Cookies</h2>
                <pre className="break-all">{cookieString || 'Loading or Empty'}</pre>
            </div>

            <div className="p-4 bg-gray-100 rounded">
                <h2 className="font-bold mb-2">Supabase Session</h2>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <pre className="whitespace-pre-wrap">
                        {session ? JSON.stringify(session, null, 2) : "Null (No Session)"}
                    </pre>
                )}
            </div>
        </div>
    );
}
