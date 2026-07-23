'use client'

import { Button } from "@/components/ui/button";
import { grantEquipmentAction } from "@/actions/adminActions";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation"; // Import this

export default function GrantButton({ bookingId }: { bookingId: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter(); // Initialize router

    const handleGrant = async () => {
        setLoading(true);
        const res = await grantEquipmentAction(bookingId);
        
        if (res?.success) {
            toast.success("Equipment granted successfully.");
            router.refresh(); // Manually force the server component to re-fetch
        } else {
            toast.error(res?.error || "Failed to checkout");
        }
        setLoading(false);
    };

    return (
        <Button onClick={handleGrant} disabled={loading} size="sm">
            {loading ? "Granting..." : "Grant"}
        </Button>
    );
}