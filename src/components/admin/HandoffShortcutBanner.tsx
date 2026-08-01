import { getReadyForPickupAction, getAwaitingReturnAction } from '@/actions/adminActions';
import { Card } from '@/components/ui/card';
import { ArrowRight, ArrowRightLeft, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default async function HandoffShortcutBanner() {
    // Fetch both datasets concurrently
    const [readyPickups, awaitingReturns] = await Promise.all([
        getReadyForPickupAction(),
        getAwaitingReturnAction()
    ]);

    const pickupCount = readyPickups.length;
    const returnCount = awaitingReturns.length;
    const totalActions = pickupCount + returnCount;

    return (
        <Link href="/admin/handoff" className="block group">
            <Card className="relative p-5 flex flex-col sm:flex-row sm:items-center justify-between border-blue-200 dark:border-blue-900/50 bg-gradient-to-r from-blue-50/80 to-blue-50/30 dark:from-blue-950/30 dark:to-transparent hover:border-blue-300 dark:hover:border-blue-800 transition-all shadow-sm overflow-hidden gap-4">
                
                {/* Decorative Background Glow */}
                <div className="absolute right-0 top-0 w-40 h-40 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-500/10 transition-colors pointer-events-none"></div>

                <div className="flex items-start sm:items-center gap-4 z-10">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl text-blue-700 dark:text-blue-400 shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                        <ArrowRightLeft className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                            Manage Equipment Handoffs
                            {/* Mobile-only total badge */}
                            {totalActions > 0 && (
                                <span className="flex sm:hidden px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 text-[10px] font-bold">
                                    {totalActions} Pending
                                </span>
                            )}
                        </h3>
                        
                        {/* Dynamic Stat Pills */}
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <span className="flex items-center gap-1.5 text-xs font-medium text-blue-800 dark:text-blue-300 bg-blue-100/60 dark:bg-blue-900/40 px-2.5 py-1 rounded-md">
                                <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                {pickupCount} Pickups Ready
                            </span>
                            <span className="flex items-center gap-1.5 text-xs font-medium text-blue-800 dark:text-blue-300 bg-blue-100/60 dark:bg-blue-900/40 px-2.5 py-1 rounded-md">
                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                {returnCount} Returns Expected
                            </span>
                        </div>
                    </div>
                </div>

                <div className="hidden sm:flex items-center gap-5 z-10">
                    {/* Desktop-only total callout */}
                    {totalActions > 0 && (
                        <div className="flex flex-col items-end">
                            <span className="text-2xl font-bold text-blue-700 dark:text-blue-400 leading-none">
                                {totalActions}
                            </span>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-500/70 dark:text-blue-400/70 mt-1">
                                Action Needed
                            </span>
                        </div>
                    )}
                    
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform border border-zinc-100 dark:border-zinc-800 shrink-0">
                        <ArrowRight className="w-5 h-5 text-blue-600 dark:text-blue-400 transform group-hover:translate-x-0.5 transition-transform" />
                    </div>
                </div>
            </Card>
        </Link>
    );
}