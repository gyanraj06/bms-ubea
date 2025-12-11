
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";


export default function PermissionCodeSettings() {
    const [code, setCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchCode();
    }, []); // Empty dependency array means this runs once on mount

    // Use standard local storage for admin token as seen in other admin pages
    const getAuthHeaders = () => {
        const token = localStorage.getItem("adminToken");
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        };
    };

    const fetchCode = async () => {
        try {
            setIsLoading(true);
            const headers = getAuthHeaders();
            const res = await fetch('/api/admin/settings/permission-code', {
                headers: headers
            });

            const data = await res.json();
            if (data.success) {
                setCode(data.code);
            } else {
                console.error("Fetch code failed:", data.error);
                // toast.error("Failed to load permission code"); 
            }
        } catch (error) {
            console.error(error);
            toast.error("Error loading permission code");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!code || code.length < 4) {
            toast.error("Code must be at least 4 characters");
            return;
        }

        // No longer checking for session here as auth is handled via localStorage token
        // if (!session) {
        //     toast.error("You are not logged in");
        //     return;
        // }

        try {
            setIsSaving(true);
            const headers = getAuthHeaders();
            console.log("[PermissionSettings] Sending update with headers:", headers);

            const res = await fetch('/api/admin/settings/permission-code', {
                method: 'POST',
                headers: headers as any,
                body: JSON.stringify({ code })
            });

            const data = await res.json();

            if (data.success) {
                toast.success("Permission code updated!");
            } else {
                toast.error(data.error || "Failed to update code");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error updating permission code");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-3 md:p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Permission Code Settings</h2>
            <div className="max-w-md bg-white p-4 md:p-6 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-4">
                    This code can be used by customers during checkout if they don't have employee details available.
                    They will contact the admin (9827058059) to get this code.
                </p>

                {isLoading ? (
                    <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brown-dark"></div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="permCode">Current Permission Code (6 Digits)</Label>
                            <Input
                                id="permCode"
                                value={code}
                                onChange={(e) => {
                                    // Only allow numbers and max 6 digits
                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                    if (val.length <= 6) {
                                        setCode(val);
                                    }
                                }}
                                maxLength={6}
                                placeholder="e.g. 123456"
                                className="mt-1 font-mono text-lg tracking-widest"
                            />
                        </div>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving || code.length !== 6}
                            className="w-full bg-brown-dark text-white hover:bg-brown-medium"
                        >
                            {isSaving ? "Saving..." : "Update Code"}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
