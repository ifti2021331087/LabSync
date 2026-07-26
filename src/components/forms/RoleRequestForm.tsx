"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Send } from "lucide-react";
import { toast } from "sonner";
import { submitRoleRequestAction } from "@/actions/userActions";

export default function RoleRequestForm({ currentRole }: { currentRole: string }) {
    const [isPending, setIsPending] = useState(false);
    
    // Determine available upgrade options based on current role
    const availableRoles = [];
    if (currentRole === "student") {
        availableRoles.push({ value: "faculty", label: "Faculty" });
        availableRoles.push({ value: "admin", label: "Administrator" });
    } else if (currentRole === "faculty") {
        availableRoles.push({ value: "admin", label: "Administrator" });
    }

    // If they are already an admin, don't show the form
    if (availableRoles.length === 0) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsPending(true);
        
        const formData = new FormData(e.currentTarget);
        const requestedRole = formData.get("requestedRole") as string;
        const reason = formData.get("reason") as string;

        if (!requestedRole || !reason) {
            toast.error("Please fill out all fields.");
            setIsPending(false);
            return;
        }

        const res = await submitRoleRequestAction(requestedRole, reason);
        
        if (res.success) {
            toast.success("Role request submitted successfully!");
            (e.target as HTMLFormElement).reset();
        } else {
            toast.error(res.error || "Failed to submit request.");
        }
        
        setIsPending(false);
    };

    return (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-zinc-950">
            <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/50 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-zinc-400" />
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Request Role Upgrade</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Select Role</label>
                    <select 
                        name="requestedRole" 
                        required
                        className="w-full text-sm px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    >
                        <option value="" disabled selected>— Choose a role —</option>
                        {availableRoles.map((role) => (
                            <option key={role.value} value={role.value}>{role.label}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Reason for Request</label>
                    <textarea 
                        name="reason" 
                        required
                        placeholder="Briefly explain why you need elevated access..."
                        className="w-full text-sm px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    ></textarea>
                    <span className="text-[11px] text-zinc-500">Admins will review this request within 24-48 hours.</span>
                </div>

                <Button type="submit" disabled={isPending} className="mt-2 w-full sm:w-auto self-end bg-emerald-600 hover:bg-emerald-700 text-white">
                    {isPending ? "Submitting..." : (
                        <>
                            <Send className="w-3.5 h-3.5 mr-2" /> Submit Request
                        </>
                    )}
                </Button>
            </form>
        </div>
    );
}