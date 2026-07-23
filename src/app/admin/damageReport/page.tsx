import { getReportsDataAction } from '@/actions/adminActions';
import DamageReportCard from '@/components/admin/DamageReportCard';
import { Button } from '@/components/ui/button';
import { damageStatusEnum } from '@/utils/extraForSchema';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export default async function DamageReport({ 
    searchParams 
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const params = await searchParams;
    const status = params.status; 
    
    // Fetch data based on the status query parameter
    const reportData = await getReportsDataAction(status);

    return (
        <div className="w-full max-w-8xl mx-auto sm:p-3 lg:p-5">
            
            {/* Header Section (Responsive: stacks on mobile, row on desktop) */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 mb-6 md:mb-8">
                <div className="w-full sm:w-auto min-w-0">
                    <h1 className="text-2xl md:text-lg font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight">Damage reports</h1>
                    <p className="text-sm text-zinc-500 font-mono tracking-tight mt-1.5 truncate sm:whitespace-normal">
                        Manage equipment issues and repair lifecycles
                    </p>
                </div>
                
                {/* Made button full width on mobile (w-full) and auto on tablet+ (sm:w-auto) */}
                <Button className="w-full sm:w-auto bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-lg shadow-sm transition-colors py-5 sm:py-2">
                    <Plus className="w-[18px] h-[18px] sm:w-4 sm:h-4 mr-2" /> 
                    Log new report
                </Button>
            </div>

            {/* Filters Section (Wraps automatically on small screens) */}
            <div className="flex gap-2.5 flex-wrap mb-6 md:mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-5">
                <Link href="/admin/damageReport">
                    <Button 
                        variant={!status ? "default" : "outline"} 
                        className="rounded-full h-8 px-4 text-xs font-semibold shadow-none transition-colors"
                    >
                        All
                    </Button>
                </Link>
                
                {damageStatusEnum.enumValues.map((damage, index) => (
                    <Link key={index} href={`/admin/damageReport?status=${damage}`}>
                        <Button
                            variant={damage === status ? "default" : "outline"}
                            className="rounded-full h-8 px-4 text-xs font-semibold shadow-none capitalize transition-colors"
                        >
                            {damage === 'open' ? 'Open' : damage === 'investigating' ? 'In repair' : 'Resolved'}
                        </Button>
                    </Link>
                ))}
            </div>

            {/* Reports List */}
            <div className="flex flex-col gap-0 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950 shadow-sm">
                {reportData && reportData.length > 0 ? (
                    reportData.map((report, index) => (
                        <DamageReportCard key={index} report={report} />
                    ))
                ) : (
                    <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center">
                        <p className="text-zinc-900 dark:text-zinc-100 font-semibold text-sm md:text-base">No reports found</p>
                        <p className="text-zinc-500 text-sm mt-1.5 max-w-sm mx-auto leading-relaxed">
                            {status 
                                ? `There are currently no reports marked as "${status}".` 
                                : "Your equipment is in great shape! No damage reported."}
                        </p>
                    </div>
                )}
            </div>
            
        </div>
    );
}