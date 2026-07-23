'use client'

import { Button } from "@/components/ui/button";
import { returnEquipmentAction } from "@/actions/adminActions";
import { toast } from "sonner";
import { useState } from "react";

export default function ReturnButton({ bookingId }: { bookingId: string }) {
    const [loading, setLoading] = useState(false);

    const handleReturn = async () => {
        setLoading(true);
        const res = await returnEquipmentAction(bookingId);
        if (res.success) {
            toast.success("Equipment marked as returned.");
        } else {
            toast.error(res.error || "Failed to return equipment.");
        }
        setLoading(false);
    };

    return (
        <Button onClick={handleReturn} disabled={loading} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
            {loading ? "Returning..." : "Return"}
        </Button>
    );
}