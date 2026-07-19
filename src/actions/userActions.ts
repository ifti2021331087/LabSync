"use server";

import { bookingSchema } from "@/components/schama/booking"
import { reportDamageSchema } from "@/components/schama/reportDamage";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { BookingTable, DamageReportTable, EquipmentTable, user } from "@/lib/db/schema";
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
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(dateString);
    endOfDay.setHours(23, 59, 59, 999);

    try {
        const dailyBookings = await db.select({ startTime: BookingTable.startTime })
            .from(BookingTable).where(
                and(
                    eq(BookingTable.equipmentId, equipmentId),
                    gte(BookingTable.startTime, startOfDay),
                    lte(BookingTable.endTime, endOfDay),
                    inArray(BookingTable.status, ['pending', 'approved', 'late', 'active'])
                )
            )

        const bookedSlotIds = dailyBookings.map((booking) => {
            const hour = new Date(booking.startTime).toString();
            return `${hour.toString().padStart(2, '0')}:00`
        })
        return { success: true, bookedSlots: bookedSlotIds };
    }
    catch (error) {
        console.error("Error fetching daily slots:", error);
        return { success: false, bookedSlots: [] };
    }
}

export const getPendingRequestsAction = async (userId: string) => {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session?.user.id) {
        return {
            success: false,
            error: "You must be logged in get your pending requests."
        }
    }

    try {
        const data = await db.select(
            {
                id:BookingTable.id,
                equipmentName: EquipmentTable.name,
                image: EquipmentTable.imageUrl,
                startTime: BookingTable.startTime,
                endTime: BookingTable.endTime,
            }
        )
            .from(BookingTable)
            .leftJoin(user, () => eq(user.id, BookingTable.userId))
            .leftJoin(EquipmentTable, () => eq(EquipmentTable.id, BookingTable.equipmentId))
            .where(and(eq(user.id, userId), eq(BookingTable.status, 'pending')));

        return data;
    }
    catch (e) {
        console.log("Pending request error: ", e);
        return [];
    }


}

export const togglePendingRequestAction=async(bookingId:string)=>{
     const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session?.user.id) {
        return {
            success: false,
            error: "You must be logged in toggle your pending requests."
        }
    }
    try{
        await db.update(BookingTable).set({
            status:'cancelled'
        })
        .where(eq(BookingTable.id,bookingId))

        revalidatePath("/checkouts");
        revalidatePath("/requests")
        return{
            success:true
        }
    }
    catch(e){
        console.log(e);
        return{
            success:false,
            error:"Unexpected error while toggling the pending request."
        }
    }
}

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
                status:BookingTable.status
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

export const getUserTotalBookingCount=async()=>{
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session?.user.id) {
        return 0;
    }
    try {
        const whereConditions =eq(BookingTable.userId, session.user.id);

        
        const data = await db.select(
            {totalRequests:count()}
        )
            .from(BookingTable)
            .leftJoin(EquipmentTable, () => eq(EquipmentTable.id, BookingTable.equipmentId))
            .where(whereConditions);

        return data;
    }
    catch (e) {
        console.log("Pending request error: ", e);
        return ;
    }


}


export const getDashboardStatsAction = async () => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== 'admin') {
        throw new Error("Unauthorized");
    }

    const now = new Date();
    
    // Time boundaries
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);

    try {
        // Run all queries concurrently for performance
        const [
            totalItemsReq,
            itemsThisMonthReq,
            activeCheckoutsReq,
            dueTodayReq,
            pendingReq,
            oldestPendingReq,
            pendingYesterdayReq
        ] = await Promise.all([
            db.select({ count: count() }).from(EquipmentTable),
            db.select({ count: count() }).from(EquipmentTable).where(gte(EquipmentTable.createdAt, startOfMonth)),
            db.select({ count: count() }).from(BookingTable).where(eq(BookingTable.status, 'active')),
            db.select({ count: count() }).from(BookingTable).where(
                and(
                    eq(BookingTable.status, 'active'), 
                    gte(BookingTable.endTime, startOfToday), 
                    lte(BookingTable.endTime, endOfToday)
                )
            ),
            db.select({ count: count() }).from(BookingTable).where(eq(BookingTable.status, 'pending')),
            db.select({ oldest: min(BookingTable.createdAt) }).from(BookingTable).where(eq(BookingTable.status, 'pending')),
            db.select({ count: count() }).from(BookingTable).where(
                and(
                    eq(BookingTable.status, 'pending'), 
                    gte(BookingTable.createdAt, startOfYesterday)
                )
            )
        ]);

        const totalItems = totalItemsReq[0].count;
        const activeCheckouts = activeCheckoutsReq[0].count;

        return {
            totalItems,
            itemsAddedThisMonth: itemsThisMonthReq[0].count,
            activeCheckouts,
            utilization: totalItems > 0 ? Math.round((activeCheckouts / totalItems) * 100) : 0,
            dueBackToday: dueTodayReq[0].count,
            pendingApproval: pendingReq[0].count,
            oldestPendingDate: oldestPendingReq[0].oldest,
            pendingSinceYesterday: pendingYesterdayReq[0].count
        };
    } catch (e) {
        console.error("Error fetching stats:", e);
        return null;
    }
}

export const getAllEquipmentListAction=async()=>{
    try{
        const data=await db.select({
            id:EquipmentTable.id,
            title:EquipmentTable.name
        })
        .from(EquipmentTable)

        return data;
    }
    catch(e){
        console.log(e);
        return [];
    }
}

export const createReportAction=async(data:z.infer<typeof reportDamageSchema>)=>{
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session?.user.id) {
        return {
            success: false,
            error: "You must be logged in to report."
        }
    }

    const validatedData=reportDamageSchema.parse(data);
    try{
        await db.insert(DamageReportTable).values({
            equipmentId:validatedData.equipmentId as string,
            reportedById:session.user.id as string,
            title:validatedData.title as string,
            description:validatedData.description as string,
            severity:validatedData.severity,
            imageUrl:validatedData.imageUrl as string
        })

        return{
            success:true,
        }
    }
    catch(e){
        console.log("Report creation error: ",e);
        return{
            success:false,
            error:"Unexpected error while creating the report."
        }
    }
}

