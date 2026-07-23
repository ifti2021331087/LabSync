"use client";

import React, { useTransition } from 'react'
import { Badge } from '../ui/badge';
import { handleInvestigateAction, handleResolveAction } from '@/actions/adminActions';
import { toast } from 'sonner';
interface reportDetailsProps {
    id: string;
    title: string;
    description: string;
    severity: "cosmetic" | "functional" | "critical";
    status: "open" | "investigating" | "resolved";
    imageUrl: string | null;
    createdAt: Date;
    resolvedAt: Date | null;
    equipmentName: string | null;
    equipmentTag: string | null;
    reporterName: string | null;
    resolverName: string | null;
}
export default function ManageReportButton({ reportDetails }: { reportDetails: reportDetailsProps }) {
    const [isPendingInvestigation, startTransitionInvestigation] = useTransition();
    const [, startTransitionResolve] = useTransition();
    console.log(reportDetails);

    const handleToogleInvestigation = (reportId: string) => {
        startTransitionInvestigation(() => {
            handleInvestigateAction(reportId)
                .then((data) => {
                    if (data.success) {
                        toast.success("Report investigation successful.");
                    } else {
                        toast.error("Unexpected error while investigating.");
                    }
                })
                .catch((e) => {
                    console.log(e);
                    toast.error(e instanceof Error ? e.message : "Unexpected error while investigating.");
                });
        });
    }

    const handleToogleResolve = (reportId: string) => {
        startTransitionResolve(() => {
            handleResolveAction(reportId)
                .then((data) => {
                    if (data.success) {
                        toast.success("Report resolved successfully.");
                    } else {
                        toast.error("Unexpected error while resolving.");
                    }
                })
                .catch((e) => {
                    console.log(e);
                    toast.error(e instanceof Error ? e.message : "Unexpected error while resolving.");
                });
        });
    }
    return (
        <div>
            {
                reportDetails.status === 'investigating' && (
                    <span className="px-3 py-3 mx-2 text-xs font-semibold rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30">
                        Investigating...
                    </span>
                )
            }
            {
                reportDetails.status === 'resolved' && (
                    <span className="px-3 py-3 mx-2 text-xs font-semibold rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30">
                        Resolved
                    </span>
                )
            }
            {reportDetails.status === 'open' && (
                <button className="w-full mx-2 sm:w-auto bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 text-white text-sm font-semibold px-5 py-2.5 md:py-2 rounded-lg shadow-sm transition-colors duration-150"
                    onClick={() => handleToogleInvestigation(reportDetails.id)}
                >
                    Investigate
                </button>
            )}
            {reportDetails.status !== 'resolved' && (
                <button className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2.5 md:py-2 rounded-lg shadow-sm transition-colors duration-150"
                    onClick={() => handleToogleResolve(reportDetails.id)}
                >
                    Mark Resolved
                </button>
            )}
        </div>
    )
}
