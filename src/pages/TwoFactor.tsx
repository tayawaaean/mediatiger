import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { toast } from "react-hot-toast";
import { ROUTES } from "../routes/routeConstants";

function TwoFactor() {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!code) {
            toast.error("Please enter the verification code.");
            return;
        }

        setLoading(true);

        try {
            const { data, error } = await supabase.functions.invoke("verify-2fa", {
                body: { code },
            });

            if (error || !data?.success) {
                throw new Error(data?.message || "Invalid 2FA code");
            }

            toast.success("2FA verification successful!");

            const { user } = data;

            // Role-based redirect
            const isAdmin = user?.user_metadata?.role === "admin";
            navigate(isAdmin ? ROUTES.ADMIN_PANEL : ROUTES.DASHBOARD, {
                replace: true,
            });
        } catch (err: any) {
            toast.error(err.message || "Verification failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
            <h1 className="text-2xl font-semibold mb-6">Two-Factor Authentication</h1>
            <form onSubmit={handleVerify} className="w-full max-w-sm space-y-4">
                <input
                    type="text"
                    placeholder="Enter 2FA Code"
                    className="w-full px-4 py-2 border rounded-md"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    maxLength={6}
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? "Verifying..." : "Verify"}
                </button>
            </form>
        </div>
    );
}

export default TwoFactor;
