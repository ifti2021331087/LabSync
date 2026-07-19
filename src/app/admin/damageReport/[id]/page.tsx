import { getDamageReportDetailsByIdAction } from '@/actions/adminActions';
import ManageReportButton from '@/components/admin/manageReportButton';
import { ArrowLeft, Calendar, User, FileText, Eye, CheckCircle2, ShieldAlert, Tag } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export default async function ReportDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const param = await params;
    const reportId = param.id;
    const reportDetails = await getDamageReportDetailsByIdAction(reportId);

    // Guard case if report is not found
    if (!reportDetails) {
        return (
            <div className="max-w-3xl mx-auto p-6 md:p-8 text-center">
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Report Not Found</h2>
                <p className="text-sm text-zinc-500 mt-2 leading-relaxed">The damage report you are looking for does not exist or has been deleted.</p>
                <Link href="/admin/damageReport" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to reports
                </Link>
            </div>
        );
    }

    // Dynamic color helper for Severity Badges
    const severityStyles = {
        critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-900/50',
        functional: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-900/50',
        cosmetic: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700',
    }[reportDetails.severity];

    // Dynamic color helper for Status Badges
    const statusStyles = {
        open: 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-200 dark:border-red-900/30',
        investigating: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-900/30',
        resolved: 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 border-green-200 dark:border-green-900/30',
    }[reportDetails.status];

    return (
        <div className="max-w-6xl w-full mx-auto p-4 md:p-6 lg:p-8">
            
            {/* Navigation / Back Button */}
            <div className="mb-5 md:mb-6">
                <Link 
                    href="/admin/damageReport" 
                    className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Damage Reports
                </Link>
            </div>

            {/* Header Title Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 pb-5 md:pb-6 border-b border-zinc-200 dark:border-zinc-800 mb-6 md:mb-8">
                <div className="w-full md:w-auto">
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border capitalize tracking-wide ${statusStyles}`}>
                            {reportDetails.status === 'investigating' ? 'In Repair' : reportDetails.status}
                        </span>
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border capitalize tracking-wide ${severityStyles}`}>
                            {reportDetails.severity} Severity
                        </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-50 mt-3.5 leading-tight">
                        {reportDetails.title}
                    </h1>
                </div>

                {/* Inline Actions - Stacks vertically on mobile, row on tablet/desktop */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                    <ManageReportButton reportDetails={reportDetails}></ManageReportButton>
                </div>
            </div>

            {/* Main Responsive Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                
                {/* Left Side: Report Content */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Description Section */}
                    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 sm:p-6 shadow-sm">
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5 mb-4 border-b border-zinc-100 dark:border-zinc-900 pb-3.5">
                            <FileText className="w-[18px] h-[18px] text-zinc-500 dark:text-zinc-400" />
                            Issue Description
                        </h3>
                        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap break-words">
                            {reportDetails.description}
                        </p>
                    </div>

                    {/* Image Evidence Section */}
                    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 sm:p-6 shadow-sm">
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5 mb-4 border-b border-zinc-100 dark:border-zinc-900 pb-3.5">
                            <Eye className="w-[18px] h-[18px] text-zinc-500 dark:text-zinc-400" />
                            Photo Evidence
                        </h3>
                        {reportDetails.imageUrl ? (
                            <div className="relative rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 max-h-[450px] flex items-center justify-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img 
                                    src={reportDetails.imageUrl} 
                                    alt="Damage report evidence" 
                                    className="object-contain max-h-[450px] w-full"
                                />
                            </div>
                        ) : (
                            <div className="text-center py-10 px-4 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/20">
                                <p className="text-sm text-zinc-500">No photos were submitted with this report.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Metadata Sidebar */}
                <div className="space-y-6">
                    
                    {/* Ticket Parameters Card */}
                    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 sm:p-6 shadow-sm">
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5 mb-4 border-b border-zinc-100 dark:border-zinc-900 pb-3.5">
                            <ShieldAlert className="w-[18px] h-[18px] text-zinc-500 dark:text-zinc-400" />
                            Report Properties
                        </h3>
                        
                        <div className="space-y-5">
                            <div>
                                <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium uppercase tracking-wider mb-1.5">Report ID</span>
                                {/* Added break-all to prevent long UUIDs from overflowing mobile screens */}
                                <span className="text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded-md inline-block break-all border border-zinc-200 dark:border-zinc-800">
                                    {reportDetails.id}
                                </span>
                            </div>

                            <div className="flex items-start gap-3.5 pt-1">
                                <Tag className="w-[18px] h-[18px] text-zinc-400 shrink-0 mt-0.5" />
                                <div className="min-w-0">
                                    <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium uppercase tracking-wider">Equipment</span>
                                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 block mt-1 break-words">
                                        {reportDetails.equipmentName || 'Unknown Item'}
                                    </span>
                                    <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 block mt-0.5">
                                        #{reportDetails.equipmentTag || 'NO-TAG'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-start gap-3.5 pt-1">
                                <User className="w-[18px] h-[18px] text-zinc-400 shrink-0 mt-0.5" />
                                <div className="min-w-0">
                                    <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium uppercase tracking-wider">Reported By User</span>
                                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 block mt-1 break-words">
                                        {reportDetails.reporterName || 'Unknown User'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-start gap-3.5 pt-1">
                                <Calendar className="w-[18px] h-[18px] text-zinc-400 shrink-0 mt-0.5" />
                                <div>
                                    <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium uppercase tracking-wider">Date Created</span>
                                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 block mt-1">
                                        {new Date(reportDetails.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Resolution Metadata Card */}
                    {reportDetails.status === 'resolved' && (
                        <div className="bg-green-50/50 dark:bg-green-950/10 border border-green-200 dark:border-green-900/50 rounded-xl p-5 sm:p-6 shadow-sm">
                            <h3 className="text-sm font-semibold text-green-900 dark:text-green-400 flex items-center gap-2.5 mb-4 border-b border-green-100 dark:border-green-950/40 pb-3.5">
                                <CheckCircle2 className="w-[18px] h-[18px] text-green-600 dark:text-green-500" />
                                Resolution Info
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <span className="text-xs text-green-600/80 dark:text-green-400/70 block font-medium uppercase tracking-wider">Resolved By</span>
                                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 block mt-1 break-words">
                                        {reportDetails.resolverName || 'System Admin'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs text-green-600/80 dark:text-green-400/70 block font-medium uppercase tracking-wider">Date Resolved</span>
                                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 block mt-1">
                                        {reportDetails.resolvedAt 
                                            ? new Date(reportDetails.resolvedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
                                            : 'N/A'
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}