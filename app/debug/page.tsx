"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import { getSupabaseAuthCookieName } from "@/lib/supabase-cookie";

export default function DebugPage() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [envInfo, setEnvInfo] = useState<any>({});
    const [cookieString, setCookieString] = useState("");

    // Create client outside effect
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
            let manualSession = null;

            try {
                console.log("Checking session...");

                // 1. Manual Cookie Parse Check
                // Attempt to find the auth cookie manually
                const cookieName = getSupabaseAuthCookieName();
                // Safe cookie parsing
                const cookies: Record<string, string> = {};
                if (document.cookie) {
                    document.cookie.split('; ').forEach(row => {
                        const parts = row.split('=');
                        if (parts.length >= 2) {
                            cookies[parts[0]] = parts.slice(1).join('=');
                        }
                    });
                }

                if (cookies[cookieName]) {
                    try {
                        const decoded = decodeURIComponent(cookies[cookieName]);
                        // It usually comes as: ["base64-header.payload.sig", "refresh-token", ...] or similar
                        // We attempt to parse it
                        const parsed = JSON.parse(decoded);
                        const token = Array.isArray(parsed) ? parsed[0] : parsed.access_token;

                        manualSession = {
                            status: "Manually Parsed Success",
                            token_preview: token ? (typeof token === 'string' ? token.substring(0, 20) + "..." : "Token Object") : "No Token found",
                            structure: Array.isArray(parsed) ? "Array" : (typeof parsed),
                            refresh_token_exists: Array.isArray(parsed) ? !!parsed[1] : !!parsed.refresh_token
                        };
                    } catch (e) {
                        manualSession = { error: "Failed to parse cookie value (JSON)" };
                    }
                } else {
                    manualSession = { status: "Cookie Not Found", searched_for: cookieName };
                }

                // 2. Race getSession against a 5s timeout
                const sessionPromise = supabase.auth.getSession();
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Timeout: getSession took too long")), 5000)
                );

                const { data } = await Promise.race([sessionPromise, timeoutPromise]) as any;
                console.log("Session data:", data);

                // Merge manual info if relevant
                if (!data.session && manualSession) {
                    setSession({ warning: "SDK failed but analysis done", manualParse: manualSession });
                } else {
                    setSession(data.session);
                }

            } catch (e: any) {
                console.error("Debug Error:", e);
                setSession({
                    error: e.message || String(e),
                    manualParse: manualSession
                });
            } finally {
                setLoading(false);
            }
        };

        checkSession();
    }, [supabase]);

    return (
        <div className="p-8 font-mono text-sm max-w-full overflow-x-hidden">
            <h1 className="text-2xl font-bold mb-4">Debug Info (v2)</h1>

            <div className="mb-8 p-4 bg-gray-100 rounded">
                <h2 className="font-bold mb-2">Environment</h2>
                <pre className="whitespace-pre-wrap">{JSON.stringify(envInfo, null, 2)}</pre>
            </div>

            <div className="mb-8 p-4 bg-gray-100 rounded">
                <h2 className="font-bold mb-2">Cookies (Raw)</h2>
                <div className="break-all text-xs bg-white p-2 border">
                    {cookieString || 'Loading or Empty'}
                </div>
            </div>

            <div className="p-4 bg-gray-100 rounded">
                <h2 className="font-bold mb-2">Supabase Session Status</h2>
                {loading ? (
                    <p className="animate-pulse">Loading...</p>
                ) : (
                    <pre className="whitespace-pre-wrap bg-white p-2 border overflow-auto max-h-96">
                        {session ? JSON.stringify(session, null, 2) : "Null (No Session)"}
                    </pre>
                )}
            </div>
        </div>
    );
}
