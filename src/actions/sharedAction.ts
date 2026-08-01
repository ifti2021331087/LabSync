"use server";

import { db } from "@/lib/db";
import { BookingTable } from "@/lib/db/schema";
import { and, eq, lt } from "drizzle-orm";

export const autoExpirePendingBookingsAction = async () => {
    try {
        const now = new Date();

        // Update all pending bookings where the ENTIRE SLOT has already passed
        const result = await db.update(BookingTable)
            .set({ 
                status: 'expired',
                updatedAt: new Date() 
            })
            .where(
                and(
                    eq(BookingTable.status, 'pending'),
                    // Change this to endTime! 
                    // This expires the booking only if the end time is less than (before) right now.
                    lt(BookingTable.endTime, now) 
                )
            )
            .returning({ id: BookingTable.id });

        if (result.length > 0) {
            console.log(`Auto-expired ${result.length} old pending bookings.`);
        }
        
        return { success: true, expiredCount: result.length };
    } catch (error) {
        console.error("Failed to auto-expire bookings:", error);
        return { success: false, error: "Auto-expire failed" };
    }
};