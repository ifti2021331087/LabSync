"use server";

import { bookingSchema } from "@/components/schama/booking"
import { reportDamageSchema } from "@/components/schama/reportDamage";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { BookingTable, DamageReportTable, EquipmentTable, user } from "@/lib/db/schema";
import { TIME_SLOTS } from "@/utils/extraUtils";
import { and, eq, gt, gte, inArray, lt, lte, or, count, min, asc, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import z from "zod"


export async function getEquipmentDetailsById(id: string) {
    try {
        const query = await db.select().from(EquipmentTable)
            .where(eq(EquipmentTable.id, id))

        return query;
    }
    catch (e) {
        console.log(e);
        return [];
    }
}

// booking-related-action

export const createBookingAction = async (data: z.infer<typeof bookingSchema>) => {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session?.user.id) {
        return {
            success: false,
            error: "You must be logged in to book equipment."
        }
    }
    try {
        const validatedData = bookingSchema.parse(data);

        const equipment = await db.query.EquipmentTable.findFirst({
            where: eq(EquipmentTable.id, validatedData.equipmentId)
        })

        if (!equipment) {
            return {
                success: false,
                error: "The equipment is not found."
            }
        }
        if (equipment.equipmentStatus !== 'active') {
            return {
                success: false,
                error: "The equipment is not available now."
            }
        }

        const conflictBooking = await db.select().from(BookingTable)
            .where(
                and(
                    eq(BookingTable.equipmentId, validatedData.equipmentId),
                    lt(BookingTable.startTime, validatedData.endTime),
                    gt(BookingTable.endTime, validatedData.startTime),
                    or(
                        eq(BookingTable.status, 'active'),
                        eq(BookingTable.status, 'approved'),
                        eq(BookingTable.status, 'pending'),
                    )
                )
            )

        if (conflictBooking.length > 0) {
            return {
                success: false,
                error: "This time slot has already been reserved by someone else."
            }
        }

        const initialStatus = equipment.requireApproval ? "pending" : "approved";

        await db.insert(BookingTable).values({
            equipmentId: validatedData.equipmentId,
            userId: session.user.id,
            startTime: validatedData.startTime,
            endTime: validatedData.endTime,
            status: initialStatus
        })

        revalidatePath(`/equipment/${equipment.id}`)

        return {
            success: true,
            status: initialStatus
        }
    }
    catch (e) {
        console.log("Booking error: ", e);
        return {
            success: false,
            error: "An unexpected error occurred while booking..."
        }
    }
}

export const getDailyBookedSlotsAction = async (equipmentId: string, dateString: string) => {
    const startOfDay = new Date(dateString);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dateString);
    endOfDay.setHours(23, 59, 59, 999);

    try {
        // 1. Fetch BOTH startTime and endTime!
        // We also use a more robust overlap check (lt endOfDay & gt startOfDay) 
        // to catch bookings that might cross over midnight.
        const dailyBookings = await db.select({
            startTime: BookingTable.startTime,
            endTime: BookingTable.endTime
        })
        .from(BookingTable).where(
            and(
                eq(BookingTable.equipmentId, equipmentId),
                lt(BookingTable.startTime, endOfDay),
                gt(BookingTable.endTime, startOfDay),
                inArray(BookingTable.status, ['pending', 'approved', 'late', 'active'])
            )
        );

        // 2. Use a Set to automatically prevent duplicate slot IDs
        const bookedSlotIds = new Set<string>();

        // 3. Loop through every booking for this day
        dailyBookings.forEach((booking) => {
            const bookingStart = new Date(booking.startTime).getTime();
            const bookingEnd = new Date(booking.endTime).getTime();

            // 4. Compare the booking against your predefined TIME_SLOTS
            TIME_SLOTS.forEach(slot => {
                // Create Date objects representing the exact bounds of this specific slot
                const slotStart = new Date(dateString);
                slotStart.setHours(slot.startHour, 0, 0, 0);
                
                const slotEnd = new Date(dateString);
                slotEnd.setHours(slot.endHour, 0, 0, 0);

                // 5. The Overlap Formula: 
                // A booking overlaps a slot if it starts BEFORE the slot ends 
                // AND ends AFTER the slot starts.
                if (bookingStart < slotEnd.getTime() && bookingEnd > slotStart.getTime()) {
                    bookedSlotIds.add(slot.id); // e.g. adds "10:00", then "12:00", etc.
                }
            });
        });

        // Convert the Set back to an Array to send to the frontend
        return { success: true, bookedSlots: Array.from(bookedSlotIds) };
    }
    catch (error) {
        console.error("Error fetching daily slots:", error);
        return { success: false, bookedSlots: [] };
    }
}

// checkout-related-action

export const getCheckoutDataAction = async () => {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session?.user.id) {
        return {
            success: false,
            error: "You must be logged in to get the checkout data."
        }
    }
    try {
        const [checkoutReq, pendingReq, totalCheckoutReq] = await Promise.all([
            await db.select({ count: count() })
                .from(BookingTable).where(and(eq(BookingTable.userId, session.user.id), eq(BookingTable.status, 'active'))),

            await db.select({ count: count() })
                .from(BookingTable).where(and(eq(BookingTable.userId, session.user.id), eq(BookingTable.status, 'pending'))),

            await db.select({ count: count() })
                .from(BookingTable).where(and(eq(BookingTable.userId, session.user.id), inArray(BookingTable.status, ['late', 'returned']))),
        ])

        const checkedOutCount=checkoutReq[0].count;
        const pendingCount=pendingReq[0].count;
        const totalCheckoutCount=totalCheckoutReq[0].count;

        return{
            checkedOutCount,
            pendingCount,
            totalCheckoutCount
        }
        
    }
    catch(e){
        console.log("Checkout Data finding error: ",e)
        return {};
    }
}

export const getPendingRequestsAction = async () => {
    // 1. Get session safely
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user.id) {
        // Return an empty array or throw an error to keep return types consistent
        throw new Error("You must be logged in to view your pending requests.");
    }

    try {
        const data = await db.select({
            id: BookingTable.id,
            equipmentName: EquipmentTable.name,
            image: EquipmentTable.imageUrl,
            startTime: BookingTable.startTime,
            endTime: BookingTable.endTime,
        })
        .from(BookingTable)
        // 2. Fixed Drizzle Join Syntax (No arrow functions)
        .leftJoin(EquipmentTable, eq(EquipmentTable.id, BookingTable.equipmentId))
        .where(
            and(
                // 3. Use the secure session ID & query the BookingTable directly
                eq(BookingTable.userId, session.user.id), 
                eq(BookingTable.status, 'pending')
            )
        );

        return data;
    }
    catch (e) {
        console.error("Pending request error: ", e);
        return [];
    }
}

export const togglePendingRequestAction = async (bookingId: string) => {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session?.user.id) {
        return {
            success: false,
            error: "You must be logged in toggle your pending requests."
        }
    }
    try {
        await db.update(BookingTable).set({
            status: 'cancelled'
        })
            .where(eq(BookingTable.id, bookingId))

        revalidatePath("/checkouts");
        revalidatePath("/requests")
        return {
            success: true
        }
    }
    catch (e) {
        console.log(e);
        return {
            success: false,
            error: "Unexpected error while toggling the pending request."
        }
    }
}

// my-request-action

export const getUserRequestsAction = async (status?: 'active' | 'pending' | 'approved' | 'returned' | 'denied' | 'cancelled' | 'late') => {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session?.user.id) {
        return []
    }

    try {
        const whereConditions = status
            ? and(eq(BookingTable.userId, session.user.id), eq(BookingTable.status, status))
            : eq(BookingTable.userId, session.user.id);


        const data = await db.select(
            {
                equipmentName: EquipmentTable.name,
                image: EquipmentTable.imageUrl,
                startTime: BookingTable.startTime,
                endTime: BookingTable.endTime,
                status: BookingTable.status
            }
        )
            .from(BookingTable)
            .leftJoin(EquipmentTable, () => eq(EquipmentTable.id, BookingTable.equipmentId))
            .where(whereConditions)
            .orderBy(desc(BookingTable.createdAt));

        return data;
    }
    catch (e) {
        console.log("Pending request error: ", e);
        return [];
    }


}

export const getUserTotalBookingCount = async () => {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session?.user.id) {
        return 0;
    }
    try {
        const whereConditions = eq(BookingTable.userId, session.user.id);


        const data = await db.select(
            { totalRequests: count() }
        )
            .from(BookingTable)
            .leftJoin(EquipmentTable, () => eq(EquipmentTable.id, BookingTable.equipmentId))
            .where(whereConditions);

        return data;
    }
    catch (e) {
        console.log("Pending request error: ", e);
        return;
    }


}

export const getAllEquipmentListAction = async () => {
    try {
        const data = await db.select({
            id: EquipmentTable.id,
            title: EquipmentTable.name
        })
            .from(EquipmentTable)

        return data;
    }
    catch (e) {
        console.log(e);
        return [];
    }
}

// report-creation-action

export const createReportAction = async (data: z.infer<typeof reportDamageSchema>) => {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session?.user.id) {
        return {
            success: false,
            error: "You must be logged in to report."
        }
    }

    const validatedData = reportDamageSchema.parse(data);
    try {
        await db.insert(DamageReportTable).values({
            equipmentId: validatedData.equipmentId as string,
            reportedById: session.user.id as string,
            title: validatedData.title as string,
            description: validatedData.description as string,
            severity: validatedData.severity,
            imageUrl: validatedData.imageUrl as string
        })

        return {
            success: true,
        }
    }
    catch (e) {
        console.log("Report creation error: ", e);
        return {
            success: false,
            error: "Unexpected error while creating the report."
        }
    }
}

// history-related-actions 

export const getUserAllCompletedCheckoutsAction = async () => {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session?.user.id) {
        return [];
    }
    const userId = session.user.id;
    try {
        const data = await db.select({
            id: BookingTable.id,
            equipmentName: EquipmentTable.name,
            startTime: BookingTable.startTime,
            endTime: BookingTable.endTime,
            status: BookingTable.status,
            imageUrl: EquipmentTable.imageUrl,
        })
            .from(BookingTable)
            .leftJoin(user, () => eq(user.id, BookingTable.userId))
            .leftJoin(EquipmentTable, () => eq(EquipmentTable.id, BookingTable.equipmentId))
            .where(inArray(BookingTable.status, ['late', 'returned']))

        return data;
    }
    catch (e) {
        console.log(e);
        return [];
    }
}

export const getUserDamageReportsAction = async () => {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session?.user.id) {
        return [];
    }
    const userId = session.user.id;
    try {
        const [data] = await db.select({
            totalReport: count()
        })
            .from(DamageReportTable)
            .where(eq(DamageReportTable.reportedById, userId))

        return data.totalReport;
    }
    catch (e) {
        console.log(e);
        return 0;
    }
}

