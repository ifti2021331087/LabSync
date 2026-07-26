import { Card } from "@/components/ui/card";
import { addDays, format, isSameDay, isBefore, isAfter, startOfDay, endOfDay } from "date-fns";
import { Calendar } from "lucide-react";

// Define the prop types expected from the server action
interface ScheduleProps {
    weekStart: Date;
    equipment: { id: string; name: string; internalTag: string }[];
    bookings: {
        id: string;
        equipmentId: string;
        userName: string | null;
        startTime: Date;
        endTime: Date;
        status: string;
    }[];
}

export default function WeeklyScheduleTable({ weekStart, equipment, bookings }: ScheduleProps) {

    // Generate an array of the 7 Date objects for this week (Mon-Sun)
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(new Date(weekStart), i));

    // Helper: Determine exact color classes based on the UI screenshot legend
    const getStatusColors = (status: string) => {
        switch (status) {
            case 'active':
            case 'late':
                return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-900/50";
            case 'approved':
                return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-900/50";
            case 'pending':
                return "bg-[#C0DD97]/40 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50";
            default:
                return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700";
        }
    };

    // Helper: Format the text inside the block (e.g., "13-18h" or "all day")
    const formatBookingTime = (booking: ScheduleProps['bookings'][0], currentDay: Date) => {
        const dayStart = startOfDay(currentDay);
        const dayEnd = endOfDay(currentDay);

        // If the booking fully engulfs this day
        if (isBefore(booking.startTime, dayStart) && isAfter(booking.endTime, dayEnd)) {
            return "all day";
        }

        // If it starts before today but ends today
        if (isBefore(booking.startTime, dayStart)) {
            return `due ${format(booking.endTime, "H:mm")}`;
        }

        // If it starts today but ends after today
        if (isAfter(booking.endTime, dayEnd)) {
            return `${format(booking.startTime, "H:mm")} →`;
        }

        // Standard: Starts and ends entirely within this single day
        return `${format(booking.startTime, "H")}-${format(booking.endTime, "H")}h`;
    };

    return (
        <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">

            {/* Table Top Header & Legend */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 gap-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    <Calendar className="w-4 h-4 text-zinc-500" />
                    All equipment · {format(weekDays[0], "MMM d")}–{format(weekDays[6], "d")}
                </div>

                {/* Legend matching the screenshot perfectly */}
                <div className="flex items-center gap-4 text-xs text-zinc-500 font-medium">
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-red-200 dark:bg-red-500/50"></div> Active</span>
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-blue-200 dark:bg-blue-500/50"></div> Approved</span>
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-[#C0DD97] dark:bg-emerald-500/50"></div> Pending</span>
                </div>
            </div>

            {/* Scrollable Table Area */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px] table-fixed">

                    {/* Days Header Row */}
                    <thead>
                        <tr className="bg-zinc-50/50 dark:bg-zinc-900/20">
                            <th className="w-48 px-4 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800 border-r border-zinc-100 dark:border-zinc-800/50">
                                Equipment
                            </th>
                            {weekDays.map((day, idx) => {
                                // Add a subtle blue background to 'Today'
                                const isToday = isSameDay(day, new Date());
                                return (
                                    <th key={idx} className={`px-2 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-center border-b border-zinc-200 dark:border-zinc-800 ${isToday ? 'bg-blue-50/50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400' : ''}`}>
                                        {format(day, "EEE d")}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>

                    {/* Equipment Rows */}
                    <tbody className="bg-white dark:bg-zinc-950 divide-y divide-zinc-100 dark:divide-zinc-800/50">
                        {equipment.map((eq) => {
                            // Filter bookings belonging to this specific row/equipment
                            const equipmentBookings = bookings.filter(b => b.equipmentId === eq.id);

                            return (
                                <tr key={eq.id} className="hover:bg-zinc-50/30 dark:hover:bg-zinc-900/10 transition-colors">

                                    {/* Column 1: Equipment Name */}
                                    <td className="px-4 py-3 border-r border-zinc-100 dark:border-zinc-800/50 align-top">
                                        <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                            {eq.name}
                                        </div>
                                    </td>

                                    {/* Columns 2-8: The 7 Days */}
                                    {weekDays.map((day, dayIdx) => {
                                        const dayStart = startOfDay(day);
                                        const dayEnd = endOfDay(day);
                                        const isToday = isSameDay(day, new Date());

                                        // Find bookings that overlap with this specific day
                                        const dayBookings = equipmentBookings.filter(b =>
                                            isBefore(b.startTime, dayEnd) && isAfter(b.endTime, dayStart)
                                        );

                                        return (
                                            <td key={dayIdx} className={`px-1 py-1.5 align-top ${isToday ? 'bg-blue-50/20 dark:bg-blue-900/5' : ''}`}>
                                                <div className="flex flex-col gap-1 w-full min-h-[32px]">
                                                    {dayBookings.map(b => (
                                                        <div
                                                            key={`${b.id}-${dayIdx}`}
                                                            className={`px-1.5 py-1 text-[10px] font-medium rounded border truncate ${getStatusColors(b.status)}`}
                                                            title={`${b.userName} (${b.status})`}
                                                        >
                                                            {/* Helper returns initials for short names (e.g. J.Lee) */}
                                                            {b.userName?.split(' ').map(n => n[0]).join('')}.{b.userName?.split(' ').pop()} {formatBookingTime(b, day)}
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}