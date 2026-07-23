import { getReadyForPickupAction, getAwaitingReturnAction } from '@/actions/adminActions';
import GrantButton from '@/components/admin/grantButton';
import ReturnButton from '@/components/admin/returnButton';
import { Card } from '@/components/ui/card';
import { Clock, ArrowRightLeft, CheckCircle2 } from 'lucide-react';

export default async function HandOffDashboard() {
    // Fetch both datasets concurrently for speed
    const [readyPickups, awaitingReturns] = await Promise.all([
        getReadyForPickupAction(),
        getAwaitingReturnAction()
    ]);

    // console.log(readyPickups);
    return (
      <div>

        <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Equipment Handoff</h1>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                
                {/* COLUMN 1: Ready for Pickup */}
                <div className="flex flex-col gap-4">
                    <h2 className="flex items-center gap-2 text-lg font-medium text-emerald-700 dark:text-emerald-400">
                        <ArrowRightLeft className="w-5 h-5" /> Ready for Pickup
                    </h2>
                    
                    {readyPickups.length === 0 ? (
                        <Card className="p-8 text-center text-zinc-500 border-dashed bg-transparent shadow-none">
                            No equipment needs to be handed out right now.
                        </Card>
                    ) : (
                        readyPickups.map((booking) => (
                            <Card key={booking.id} className="p-4 flex justify-between items-center bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/30">
                                <div>
                                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                                        {booking.equipmentName} 
                                        {/* Shows the remaining stock to the admin */}
                                        <span className="ml-2 text-xs font-normal px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-800/50 text-emerald-800 dark:text-emerald-200">
                                            {booking.currentStock} in storage
                                        </span>
                                    </h3>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">For: {booking.userName}</p>
                                    <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                                        <Clock className="w-3 h-3" />
                                        Starts at: {new Date(booking.startTime!).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                                </div>
                                <GrantButton bookingId={booking.id} />
                            </Card>
                        ))
                    )}
                </div>

                {/* COLUMN 2: Awaiting Return */}
                <div className="flex flex-col gap-4">
                    <h2 className="flex items-center gap-2 text-lg font-medium text-blue-700 dark:text-blue-400">
                        <CheckCircle2 className="w-5 h-5" /> Active (Awaiting Return)
                    </h2>
                    
                    {awaitingReturns.length === 0 ? (
                        <Card className="p-8 text-center text-zinc-500 border-dashed bg-transparent shadow-none">
                            All active equipment has been returned.
                        </Card>
                    ) : (
                        awaitingReturns.map((booking) => (
                            <Card key={booking.id} className="p-4 flex justify-between items-center bg-blue-50/50 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900/30">
                                <div>
                                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{booking.equipmentName}</h3>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">With: {booking.userName}</p>
                                    <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                                        <Clock className="w-3 h-3" />
                                        Due back: {new Date(booking.endTime!).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                                </div>
                                <ReturnButton bookingId={booking.id} />
                            </Card>
                        ))
                    )}
                </div>

            </div>
        </div>
      </div>
    )
}