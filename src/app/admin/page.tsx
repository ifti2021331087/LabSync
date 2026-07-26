import { getDashboardStatsAction } from '@/actions/adminActions';
import DashboardRightSidebar from '@/components/admin/DashboardRightSidebar';
import HandoffShortcutBanner from '@/components/admin/HandoffShortcutBanner';
import LiveTicker from '@/components/admin/LiveTicker';
import PendingApprovalsWidget from '@/components/admin/PendingApprovalsWidget'; // <-- NEW
import { Card } from '@/components/ui/card';
import { getDaysAgoText } from '@/utils/simpleFunctions';
import { ArrowRight, ArrowRightLeft } from 'lucide-react';
import Link from 'next/link';

export default async function Dashboard() {
    const stats = await getDashboardStatsAction();

    if (!stats) return <div>Failed to load statistics.</div>;

    return (
        <div className="space-y-6">
            <LiveTicker />

            {/* TOP STAT CARDS (Responsive Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

                {/* TOTAL ITEMS */}
                <Card className="p-6 flex flex-col justify-between border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div>
                        <h3 className="text-xs font-bold tracking-wider text-zinc-500 uppercase mb-2">Total Items</h3>
                        <p className="text-4xl font-medium text-zinc-900 dark:text-zinc-100">{stats.totalItems}</p>
                        <p className="text-sm text-zinc-500 mt-1">across your inventory</p>
                    </div>
                    <div className="mt-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-md w-fit">
                        ↑ +{stats.itemsAddedThisMonth} this month
                    </div>
                </Card>

                {/* CHECKED OUT */}
                <Card className="p-6 flex flex-col justify-between border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div>
                        <h3 className="text-xs font-bold tracking-wider text-zinc-500 uppercase mb-2">Checked Out</h3>
                        <p className="text-4xl font-medium text-amber-600 dark:text-amber-500">{stats.activeCheckouts}</p>
                        <p className="text-sm text-zinc-500 mt-1">{stats.utilization}% utilization</p>
                    </div>
                    <div className="mt-4 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        {stats.dueBackToday} due back today
                    </div>
                </Card>

                {/* PENDING APPROVAL */}
                <Card className="p-6 flex flex-col justify-between border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div>
                        <h3 className="text-xs font-bold tracking-wider text-zinc-500 uppercase mb-2">Pending Approval</h3>
                        <p className="text-4xl font-medium text-red-600 dark:text-red-500">{stats.pendingApproval}</p>
                        <p className="text-sm text-zinc-500 mt-1">oldest: {getDaysAgoText(stats.oldestPendingDate)}</p>
                    </div>
                    <div className="mt-4 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-2.5 py-1 rounded-md w-fit">
                        ↑ +{stats.pendingSinceYesterday} since yesterday
                    </div>
                </Card>

                {/* DAMAGE REPORTS */}
                <Card className="p-6 flex flex-col justify-between border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div>
                        <h3 className="text-xs font-bold tracking-wider text-zinc-500 uppercase mb-2">Damage Reports</h3>
                        <p className="text-4xl font-medium text-red-600 dark:text-red-500">{stats.totalDamage}</p>
                        <p className="text-sm text-zinc-500 mt-1">{stats.openDamage} open · {stats.resolvedDamage} resolved</p>
                    </div>
                    <div className="mt-4 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        {stats.criticalDamage} critical issues
                    </div>
                </Card>

            </div>

            {/* MAIN TWO-COLUMN LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT COLUMN (2/3 width on large screens) */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    
                    {/* 1. Pending Approvals Widget */}
                    <PendingApprovalsWidget />

                    {/* 2. Dynamic Handoff Shortcut Banner */}
                    <HandoffShortcutBanner /> 

                </div>

                {/* RIGHT COLUMN (1/3 width on large screens) */}
                <aside className="lg:col-span-1">
                    <DashboardRightSidebar />
                </aside>

            </div>
        </div>
    );
}