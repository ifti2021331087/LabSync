import { getWeeklyScheduleAction } from "@/actions/adminActions";
import WeeklyScheduleTable from "@/components/admin/WeeklyScheduleTable";
import { Button } from "@/components/ui/button";
import { format, addDays, subDays } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function SchedulePage({
    searchParams
}: {
    searchParams: Promise<{ date?: string }>
}) {
    const { date } = await searchParams;
    
    // Default to today if no date is provided in the URL
    const baseDate = date ? new Date(date) : new Date();
    
    // Calculate display strings
    const weekStart = baseDate;
    const weekEnd = addDays(baseDate, 6);
    
    // Shift forward or backward by 7 full days
    const prevWeekStr = format(subDays(baseDate, 7), "yyyy-MM-dd");
    const nextWeekStr = format(addDays(baseDate, 7), "yyyy-MM-dd");

    // Fetch the data starting from baseDate
    const data = await getWeeklyScheduleAction(format(baseDate, "yyyy-MM-dd"));

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                        Reservation schedule
                    </h1>
                    <p className="text-sm text-zinc-500 font-mono mt-1">
                        {format(weekStart, "MMM d")} – {format(weekEnd, "MMM d, yyyy")}
                    </p>
                </div>
                
                {/* Navigation Controls */}
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/schedule?date=${prevWeekStr}`}>
                            <ChevronLeft className="w-4 h-4 mr-1" /> Prev 7 Days
                        </Link>
                    </Button>

                    <Button variant="outline" size="sm" asChild className="hidden sm:flex mx-1">
                        <Link href={`/admin/schedule`}>
                            Today
                        </Link>
                    </Button>

                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/schedule?date=${nextWeekStr}`}>
                            Next 7 Days <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                    </Button>
                </div>
            </div>

            {/* The Grid Component handles mapping automatically */}
            <WeeklyScheduleTable 
                equipment={data.equipment} 
                bookings={data.bookings} 
                weekStart={data.weekStart} 
            />
        </div>
    );
}