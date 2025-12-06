"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";

export default function DebugPage() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [envInfo, setEnvInfo] = useState<any>({});
    const supabase = createClientComponentClient();

    useEffect(() => {
        const checkSession = async () => {
            const { data } = await supabase.auth.getSession();
            setSession(data.session);

            setEnvInfo({
                url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Defined" : "Missing",
                anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Defined" : "Missing",
                origin: window.location.origin,
                hostname: window.location.hostname,
                protocol: window.location.protocol,
            });

            setLoading(false);
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
                <pre className="break-all">{typeof document !== 'undefined' ? document.cookie : 'N/A'}</pre>
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
