import { getAllEquipmentAction, getWeeklyEquipmentStatsAction } from '@/actions/adminActions';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { getWeeklyDayHeaders, getWeekRangeString } from '@/utils/simpleFunctions';
import React from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export default async function AdminSchedule() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diffToMonday = today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const reservationHeader = getWeekRangeString(startOfWeek.toString());
    const allDates = getWeeklyDayHeaders(startOfWeek.toString());
    const allEquipments = await getAllEquipmentAction();

    return (
        <div>
            <h1 className='text-lg font-bold'>Reservation schedule</h1>
            <Label className="text-xs text-zinc-500">{reservationHeader}</Label>

            <div className='mt-10'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="min-w-[150px]">Equipment</TableHead>
                            {allDates.map((date, index) => (
                                <TableHead key={index}>{date}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            await Promise.all(allEquipments.map(async (equipment) => {
                                const weeklyStats = await getWeeklyEquipmentStatsAction(equipment.id, startOfWeek.toISOString());
                                
                                return (
                                    <TableRow key={equipment.id}>
                                        <TableCell className="font-medium">{equipment.name}</TableCell>
                                        
                                        {weeklyStats.map((dayStat, index) => (
                                            <TableCell key={index} className="align-top">
                                                <div className="flex flex-col gap-2 min-w-[100px]">
                                                    
                                                    {/* --- PENDING BADGE & HOVER --- */}
                                                    {dayStat.pending.length > 0 ? (
                                                        <HoverCard>
                                                            <HoverCardTrigger>
                                                                <Badge variant="outline" className="cursor-pointer bg-orange-50 text-orange-700 border-orange-200 justify-center">
                                                                    {dayStat.pending.length} Pending
                                                                </Badge>
                                                            </HoverCardTrigger>
                                                            <HoverCardContent className="w-64 shadow-xl">
                                                                <h4 className="text-sm font-semibold mb-2">Pending Requests</h4>
                                                                <div className="space-y-1">
                                                                    {dayStat.pending.map((booking, i) => (
                                                                        <div key={i} className="flex justify-between text-xs border-b last:border-0 pb-1">
                                                                            <span className="font-medium">{booking.userName}</span>
                                                                            <span className="text-zinc-500">{booking.slot}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </HoverCardContent>
                                                        </HoverCard>
                                                    ) : (
                                                        <Badge variant="outline" className="opacity-50 justify-center text-zinc-400 border-dashed">
                                                            0 Pending
                                                        </Badge>
                                                    )}

                                                    {/* --- APPROVED BADGE & HOVER --- */}
                                                    {dayStat.approved.length > 0 ? (
                                                        <HoverCard>
                                                            <HoverCardTrigger>
                                                                <Badge variant="outline" className="cursor-pointer bg-green-50 text-green-700 border-green-200 justify-center">
                                                                    {dayStat.approved.length} Approved
                                                                </Badge>
                                                            </HoverCardTrigger>
                                                            <HoverCardContent className="w-64 shadow-xl">
                                                                <h4 className="text-sm font-semibold mb-2">Approved Bookings</h4>
                                                                <div className="space-y-1">
                                                                    {dayStat.approved.map((booking, i) => (
                                                                        <div key={i} className="flex justify-between text-xs border-b last:border-0 pb-1">
                                                                            <span className="font-medium">{booking.userName}</span>
                                                                            <span className="text-zinc-500">{booking.slot}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </HoverCardContent>
                                                        </HoverCard>
                                                    ) : (
                                                        <Badge variant="outline" className="opacity-50 justify-center text-zinc-400 border-dashed">
                                                            0 Approved
                                                        </Badge>
                                                    )}

                                                </div>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                )
                            }))
                        }
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}