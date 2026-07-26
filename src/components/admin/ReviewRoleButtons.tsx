"use client";

import { useState } from "react";
import { reviewRoleRequestAction } from "@/actions/adminActions";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ReviewRoleButtons({ requestId }: { requestId: string }) {
    const [isPending, setIsPending] = useState(false);

    const handleReview = async (status: "approved" | "denied") => {
        setIsPending(true);
        const res = await reviewRoleRequestAction(requestId, status);
        
        if (res.success) {
            toast.success(`Request ${status} successfully.`);
        } else {
            toast.error(res.error || "Something went wrong.");
            setIsPending(false); // Only reset if failed, on success the row disappears anyway
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Button 
                onClick={() => handleReview("approved")} 
                disabled={isPending}
                size="sm" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm h-8"
            >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-1.5" /> Approve</>}
            </Button>
            <Button 
                onClick={() => handleReview("denied")} 
                disabled={isPending}
                size="sm" 
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:hover:bg-red-900/20 h-8"
            >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><X className="w-4 h-4 mr-1.5" /> Deny</>}
            </Button>
        </div>
    );
}