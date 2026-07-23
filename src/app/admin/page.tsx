// app/admin/page.tsx (or your dashboard component)
import { getDashboardStatsAction } from '@/actions/adminActions';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowRight, ArrowRightLeft } from 'lucide-react';
import Link from 'next/link';

// Helper function to format the "oldest pending" date
function getDaysAgoText(date: Date | null) {
    if (!date) return 'N/A';
    const diffTime = Math.abs(new Date().getTime() - new Date(date).getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    return `${diffDays} days ago`;
}

export default async function Dashboard() {
    const stats = await getDashboardStatsAction();

    if (!stats) return <div>Failed to load statistics.</div>;

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                {/* TOTAL ITEMS CARD */}
                <Card className="p-6 flex flex-col justify-between border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div>
                        <h3 className="text-xs font-semibold tracking-wider text-zinc-500 uppercase mb-2">Total Items</h3>
                        <p className="text-4xl font-medium text-zinc-900 dark:text-zinc-100">{stats.totalItems}</p>
                        <p className="text-sm text-zinc-500 mt-1">across your inventory</p>
                    </div>
                    <div className="mt-4 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                        ↑ +{stats.itemsAddedThisMonth} this month
                    </div>
                </Card>

                {/* CHECKED OUT CARD */}
                <Card className="p-6 flex flex-col justify-between border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div>
                        <h3 className="text-xs font-semibold tracking-wider text-zinc-500 uppercase mb-2">Checked Out</h3>
                        <p className="text-4xl font-medium text-amber-700 dark:text-amber-500">{stats.activeCheckouts}</p>
                        <p className="text-sm text-zinc-500 mt-1">{stats.utilization}% utilization</p>
                    </div>
                    <div className="mt-4 text-sm font-medium text-zinc-500">
                        {stats.dueBackToday} due back today
                    </div>
                </Card>

                {/* PENDING APPROVAL CARD */}
                <Card className="p-6 flex flex-col justify-between border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div>
                        <h3 className="text-xs font-semibold tracking-wider text-zinc-500 uppercase mb-2">Pending Approval</h3>
                        <p className="text-4xl font-medium text-red-700 dark:text-red-500">{stats.pendingApproval}</p>
                        <p className="text-sm text-zinc-500 mt-1">oldest: {getDaysAgoText(stats.oldestPendingDate)}</p>
                    </div>
                    <div className="mt-4 text-sm font-medium text-red-800 dark:text-red-400">
                        ↑ +{stats.pendingSinceYesterday} since yesterday
                    </div>
                </Card>

            </div>
            <div>
                <Link href="/admin/handoff" className="block group mt-6">
                    <Card className="p-4 flex items-center justify-between border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100/50 dark:hover:bg-blue-900/40 transition-colors shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/50 rounded-xl text-blue-700 dark:text-blue-400">
                                <ArrowRightLeft className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                                    Manage Equipment Handoffs
                                </h3>
                                <p className="text-sm text-blue-700/70 dark:text-blue-400/70 mt-0.5">
                                    Grant approved items to users and process returns
                                </p>
                            </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-blue-600 dark:text-blue-400 transform group-hover:translate-x-1.5 transition-transform" />
                    </Card>
                </Link>
            </div>
        </div>
    );
}