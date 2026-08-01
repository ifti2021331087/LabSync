import { pendingBookingAction, reviewBookingAction } from '@/actions/adminActions';
import { Card } from '@/components/ui/card';
import { Clock, Eye, Check, X } from 'lucide-react';
import { format, formatDistanceToNow, differenceInHours } from 'date-fns';
import Link from 'next/link';
import { Button } from '../ui/button';

export default async function PendingApprovalsWidget() {
    const pendingRequests = await pendingBookingAction();

    if (!pendingRequests || pendingRequests.length === 0) {
        return null; // Don't show the widget if there are no pending requests
    }

    // Only show the top 3 on the dashboard to save space
    const displayedRequests = pendingRequests.slice(0, 3);
    const hiddenCount = pendingRequests.length - 3;

    // Helper to get initials for the avatar
    const getInitials = (name?: string | null) => {
        if (!name) return "?";
        return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
    };

    return (
        <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
            
            {/* Widget Header */}
            <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/50 flex justify-between items-center bg-white dark:bg-zinc-950">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-zinc-400" />
                    <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Pending approvals</h3>
                    <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 text-[10px] font-bold uppercase tracking-wider ml-2">
                        {pendingRequests.length} waiting
                    </span>
                </div>
                <Link href="/admin/approval" className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 flex items-center gap-1 transition-colors">
                    View all <span>→</span>
                </Link>
            </div>

            {/* Table Headers (Hidden on mobile) */}
            <div className="hidden md:grid grid-cols-[auto_1fr_150px_100px_120px] gap-4 px-5 py-2.5 bg-zinc-50/50 dark:bg-zinc-900/20 border-b border-zinc-100 dark:border-zinc-800/50 text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                <div className="w-8"></div>
                <div>User</div>
                <div>Time Slot</div>
                <div>Waiting</div>
                <div className="text-right pr-2">Actions</div>
            </div>

            {/* List Rows */}
            <div className="flex flex-col bg-white dark:bg-zinc-950">
                {displayedRequests.map((req) => {
                    // Calculate wait time for dynamic styling (Urgent > 24h, Warn > 12h)
                    const waitHours = differenceInHours(new Date(), new Date(req.createdAt));
                    const isUrgent = waitHours >= 24;
                    const isWarning = waitHours >= 12 && waitHours < 24;
                    
                    const rowBorderColor = isUrgent ? 'border-l-red-500 bg-red-50/30 dark:bg-red-950/10' : 
                                           isWarning ? 'border-l-amber-500 bg-amber-50/30 dark:bg-amber-950/10' : 
                                           'border-l-transparent';
                                           
                    const pillColor = isUrgent ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' : 
                                      isWarning ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' : 
                                      'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300';

                    const avatarColor = isUrgent ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' : 
                                        isWarning ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 
                                        'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300';

                    return (
                        <div key={req.id} className={`grid grid-cols-1 md:grid-cols-[auto_1fr_150px_100px_120px] gap-4 px-5 py-3 border-b border-zinc-100 dark:border-zinc-800/50 items-center border-l-[3px] transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/30 ${rowBorderColor}`}>
                            
                            {/* Avatar */}
                            <div className={`hidden md:flex w-8 h-8 rounded-full items-center justify-center text-[10px] font-bold ${avatarColor}`}>
                                {getInitials(req.userName)}
                            </div>

                            {/* User & Equipment */}
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                    {req.userName || "Unknown User"}
                                </span>
                                <span className="text-[11px] text-zinc-500 truncate mt-0.5">
                                    {req.equipmentName} {req.equipmentTag && `· ${req.equipmentTag}`}
                                </span>
                            </div>

                            {/* Time Slot */}
                            <div className="text-xs font-mono text-zinc-600 dark:text-zinc-400 hidden md:block">
                                {format(req.startTime, "MMM d")} · {format(req.startTime, "HH:mm")}-{format(req.endTime, "HH:mm")}
                            </div>

                            {/* Waiting Pill */}
                            <div className="hidden md:block">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${pillColor}`}>
                                    {formatDistanceToNow(new Date(req.createdAt))} ago
                                </span>
                            </div>

                            {/* Actions (Forms using Server Actions) */}
                            <div className="flex items-center gap-1.5 justify-start md:justify-end mt-2 md:mt-0">
                                <form action={async () => { "use server"; await reviewBookingAction(req.id, "approved"); }}>
                                    <Button type="submit" size="icon" variant="outline" className="w-7 h-7 bg-emerald-50/50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:hover:bg-emerald-900/50">
                                        <Check className="w-3.5 h-3.5" />
                                    </Button>
                                </form>
                                <form action={async () => { "use server"; await reviewBookingAction(req.id, "denied"); }}>
                                    <Button type="submit" size="icon" variant="outline" className="w-7 h-7 bg-red-50/50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700 dark:bg-red-950/30 dark:border-red-900/50 dark:hover:bg-red-900/50">
                                        <X className="w-3.5 h-3.5" />
                                    </Button>
                                </form>
                                <Link href={`/admin/approval`}>
                                    <Button size="icon" variant="ghost" className="w-7 h-7 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
                                        <Eye className="w-3.5 h-3.5" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            {hiddenCount > 0 && (
                <div className="py-3 text-center text-xs text-zinc-500 bg-zinc-50/50 dark:bg-zinc-900/10">
                    + {hiddenCount} more waiting · <Link href="/admin/approval" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">review all</Link>
                </div>
            )}
        </Card>
    );
}