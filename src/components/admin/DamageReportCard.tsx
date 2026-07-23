import React from 'react';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

// Helper function to format the metadata line
function formatReportMeta(username: string, createdAt: Date | string, tag: string) {
    const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
    return `Reported by ${username} · ${formattedDate} · #${tag}`;
}

// Props based on your provided data structure
interface DamageReportCardProps {
    report: {
        id: string;
        equipmentTitle: string | null;
        equipmentTag: string | null;
        reportedBy: string | null;
        title: string;
        description: string;
        severity: "cosmetic" | "functional" | "critical";
        imageUrl: string | null;
        status: "open" | "investigating" | "resolved";
        createdAt: Date;
    };
}

export default function DamageReportCard({ report }: DamageReportCardProps) {
    // Determine severity badge colors
    const isCritical = report.severity.toLowerCase() === 'critical';
    const severityClasses = isCritical
        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
        : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';

    return (
        <Link href={`/admin/damageReport/${report.id}`}>
            <div className="relative group flex flex-col md:flex-row gap-4 p-5 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-all duration-200 ease-out hover:scale-[1.01] hover:z-10 hover:shadow-md hover:rounded-lg hover:border-transparent">

                {/* Icon */}
                <div className="shrink-0 mt-0.5">
                    <AlertCircle className="w-5 h-5 text-red-700 dark:text-red-500" strokeWidth={2} />
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">

                    {/* Title & Severity */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {report.title} — {report.equipmentTitle}
                        </h3>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium tracking-wide ${severityClasses}`}>
                            {report.severity}
                        </span>
                    </div>

                    {/* Formatted Metadata Line */}
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 font-medium">
                        {formatReportMeta(report.reportedBy || "unknown user", report.createdAt, report.equipmentTag || "unknown tag")}
                    </p>

                    {/* Description */}
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-2.5 leading-relaxed line-clamp-2" title={report.description}>
                        {report.description}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-start gap-2 shrink-0 mt-4 md:mt-0">
                    {
                        report.status === 'open' ?
                            <span className="bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 px-3 py-1.5 rounded-md text-xs font-semibold border border-transparent">
                                Open
                            </span> :
                            report.status === 'investigating' ?
                                <button className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm transition-colors">
                                    Investigate
                                </button> :
                                <button className="bg-[#f0fdf4] dark:bg-green-950/30 border border-[#bbf7d0] dark:border-green-900/50 text-green-700 dark:text-green-400 hover:bg-[#dcfce7] dark:hover:bg-green-900/50 px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm transition-colors">
                                    Mark resolved
                                </button>
                    }
                </div>

            </div>
        </Link>
    );
}