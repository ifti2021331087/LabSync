import { 
    getCategoryUtilizationAction, 
    getOpenDamageWidgetAction, 
    getRecentActivityWidgetAction 
} from "@/actions/adminActions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, AlertTriangle, Activity, AlertCircle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function DashboardRightSidebar() {
    // Fetch all three datasets concurrently
    const [utilization, damageReports, activities] = await Promise.all([
        getCategoryUtilizationAction(),
        getOpenDamageWidgetAction(),
        getRecentActivityWidgetAction()
    ]);

    return (
        <div className="flex flex-col gap-6">
            
            {/* 1. CATEGORY UTILIZATION CARD */}
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/50 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-zinc-400" />
                    <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Category utilization</h3>
                </div>
                <div className="p-5 flex flex-col gap-5">
                    {utilization.map((cat) => {
                        // Determine colors based on utilization percentage
                        const isCritical = cat.pct >= 80;
                        const isHigh = cat.pct >= 40 && cat.pct < 80;
                        
                        const textColor = isCritical ? 'text-red-600 dark:text-red-500' : isHigh ? 'text-amber-600 dark:text-amber-500' : 'text-emerald-600 dark:text-emerald-500';
                        const barColor = isCritical ? 'bg-red-500' : isHigh ? 'bg-amber-500' : 'bg-emerald-500';

                        return (
                            <div key={cat.value}>
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{cat.label}</span>
                                    <span className={`text-sm font-mono font-medium ${textColor}`}>{cat.pct}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${barColor}`} style={{ width: `${cat.pct}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* 2. OPEN DAMAGE REPORTS CARD */}
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Open damage reports</h3>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                        {damageReports.length} open
                    </span>
                </div>
                <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800/50">
                    {damageReports.length === 0 ? (
                        <div className="p-5 text-center text-sm text-zinc-500">No open reports.</div>
                    ) : (
                        damageReports.map((report) => (
                            <div key={report.id} className="p-4 flex gap-3 items-start hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                <AlertCircle className={`w-4 h-4 mt-0.5 shrink-0 ${report.severity === 'critical' ? 'text-red-500' : 'text-amber-500'}`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                        {report.title} — {report.equipmentName}
                                    </p>
                                    <p className="text-xs text-zinc-500 mt-1 truncate">
                                        {report.reporterName} · {format(report.createdAt, "MMM d")}
                                        {report.severity === 'critical' && <span className="text-red-600 dark:text-red-400 font-bold ml-1">· critical</span>}
                                    </p>
                                </div>
                                <Link href={`/admin/damageReport/${report.id}`}>
                                    <Button variant="outline" size="sm" className="h-7 text-xs bg-amber-50/50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50 hover:bg-amber-100 dark:hover:bg-amber-900/30">
                                        Review
                                    </Button>
                                </Link>
                            </div>
                        ))
                    )}
                </div>
            </Card>

            {/* 3. RECENT ACTIVITY CARD */}
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/50 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-zinc-400" />
                    <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Recent activity</h3>
                </div>
                <div className="p-5 flex flex-col gap-4">
                    {activities.length === 0 ? (
                        <div className="text-center text-sm text-zinc-500">No recent activity.</div>
                    ) : (
                        activities.map((activity) => (
                            <div key={activity.id} className="flex gap-3">
                                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${activity.color}`} />
                                <div>
                                    <p className="text-sm text-zinc-900 dark:text-zinc-100">{activity.title}</p>
                                    <p className="text-xs text-zinc-500 mt-0.5">
                                        {format(activity.time, "HH:mm")} · by {activity.user}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>

        </div>
    );
}