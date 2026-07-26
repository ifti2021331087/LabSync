"use server";

import { equipmentSchema } from "@/components/schama/equipment";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { BookingTable, DamageReportTable, EquipmentTable, user, session, RoleRequestTable } from "@/lib/db/schema";
import { and, asc, count, desc, eq, gt, gte, inArray, lt, lte, min, ne, sql } from "drizzle-orm";
import { PgTableWithColumns, PgColumn } from "drizzle-orm/pg-core";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import z from "zod";
import { sendNotification } from "./notificationActions";
import { EquipmentCategories } from "@/utils/extraUtils";
import { addDays, endOfDay, endOfWeek, startOfDay, startOfWeek } from "date-fns";
import { autoExpirePendingBookingsAction } from "./sharedAction";

// dashboard-related-action

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
            pendingYesterdayReq,
            // NEW: Damage Report Queries
            totalDamageReq,
            openDamageReq,
            resolvedDamageReq,
            criticalDamageReq
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
            ),
            // NEW: Damage Report Executions
            db.select({ count: count() }).from(DamageReportTable),
            db.select({ count: count() }).from(DamageReportTable).where(eq(DamageReportTable.status, 'open')),
            db.select({ count: count() }).from(DamageReportTable).where(eq(DamageReportTable.status, 'resolved')),
            db.select({ count: count() }).from(DamageReportTable).where(
                and(
                    eq(DamageReportTable.status, 'open'),
                    eq(DamageReportTable.severity, 'critical')
                )
            ),
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
            pendingSinceYesterday: pendingYesterdayReq[0].count,
            
            // NEW: Damage Report Data
            totalDamage: totalDamageReq[0].count,
            openDamage: openDamageReq[0].count,
            resolvedDamage: resolvedDamageReq[0].count,
            criticalDamage: criticalDamageReq[0].count
        };
    } catch (e) {
        console.error("Error fetching stats:", e);
        return null;
    }
}
export const getLiveTickerEventsAction = async () => {
    try {
        // 1. Fetch recent bookings
        const recentBookings = await db.select({
            id: BookingTable.id,
            userName: user.name,
            equipmentName: EquipmentTable.name,
            status: BookingTable.status,
            time: BookingTable.updatedAt
        })
        .from(BookingTable)
        .leftJoin(user, eq(user.id, BookingTable.userId))
        .leftJoin(EquipmentTable, eq(EquipmentTable.id, BookingTable.equipmentId))
        .orderBy(desc(BookingTable.updatedAt))
        .limit(5);

        // 2. Fetch recent damage reports
        const recentDamage = await db.select({
            id: DamageReportTable.id,
            equipmentName: EquipmentTable.name,
            title: DamageReportTable.title,
            time: DamageReportTable.createdAt
        })
        .from(DamageReportTable)
        .leftJoin(EquipmentTable, eq(EquipmentTable.id, DamageReportTable.equipmentId))
        .orderBy(desc(DamageReportTable.createdAt))
        .limit(5);

        const events: { id: string, text: string, type: string, time: Date }[] = [];

        // 3. Format Bookings into ticker phrases
        recentBookings.forEach(b => {
            let text = "";
            let type = "info";
            
            if (b.status === 'active') { 
                text = `${b.userName} checked out ${b.equipmentName}`; 
                type = "success"; 
            } else if (b.status === 'returned') { 
                text = `${b.userName} returned ${b.equipmentName}`; 
                type = "return"; 
            } else if (b.status === 'pending') { 
                text = `${b.userName} requested ${b.equipmentName}`; 
                type = "pending"; 
            } else if (b.status === 'late') {
                text = `${b.userName} is late returning ${b.equipmentName}`;
                type = "danger";
            }

            if(text) events.push({ id: `b-${b.id}`, text, type, time: b.time });
        });

        // 4. Format Damage Reports into ticker phrases
        recentDamage.forEach(d => {
            events.push({ 
                id: `d-${d.id}`, 
                text: `Damage report: ${d.equipmentName} — ${d.title}`, 
                type: "danger", 
                time: d.time 
            });
        });

        // 5. Sort all events together by time (newest first) and limit to 8
        return events.sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 8);
    } catch (e) {
        console.error("Ticker fetch error:", e);
        return [];
    }
}
export const getCategoryUtilizationAction = async () => {
    try {
        // Fetch all equipment and all active bookings
        const [allEq, activeBookings] = await Promise.all([
            db.select({ id: EquipmentTable.id, category: EquipmentTable.category }).from(EquipmentTable),
            db.select({ equipmentId: BookingTable.equipmentId }).from(BookingTable).where(eq(BookingTable.status, 'active'))
        ]);

        const activeEqIds = new Set(activeBookings.map(b => b.equipmentId));

        // Calculate stats for each predefined category
        const stats = EquipmentCategories.map(c => {
            const catEq = allEq.filter(e => e.category === c.value);
            const total = catEq.length;
            const inUse = catEq.filter(e => activeEqIds.has(e.id)).length;
            const pct = total === 0 ? 0 : Math.round((inUse / total) * 100);
            return { label: c.label, pct, value: c.value };
        });

        // Sort by highest utilization
        return stats.sort((a, b) => b.pct - a.pct);
    } catch (e) {
        console.error("Utilization error:", e);
        return [];
    }
}
export const getOpenDamageWidgetAction = async () => {
    try {
        return await db.select({
            id: DamageReportTable.id,
            title: DamageReportTable.title,
            severity: DamageReportTable.severity,
            createdAt: DamageReportTable.createdAt,
            equipmentName: EquipmentTable.name,
            reporterName: user.name,
        })
        .from(DamageReportTable)
        .leftJoin(EquipmentTable, eq(EquipmentTable.id, DamageReportTable.equipmentId))
        .leftJoin(user, eq(user.id, DamageReportTable.reportedById))
        .where(eq(DamageReportTable.status, 'open'))
        .orderBy(desc(DamageReportTable.createdAt))
        .limit(3);
    } catch (e) {
        console.error("Damage widget error:", e);
        return [];
    }
}
export const getRecentActivityWidgetAction = async () => {
    try {
        const recentActivity = await db.select({
            id: BookingTable.id,
            status: BookingTable.status,
            updatedAt: BookingTable.updatedAt,
            equipmentName: EquipmentTable.name,
            userName: user.name,
        })
        .from(BookingTable)
        .leftJoin(EquipmentTable, eq(EquipmentTable.id, BookingTable.equipmentId))
        .leftJoin(user, eq(user.id, BookingTable.userId))
        .orderBy(desc(BookingTable.updatedAt))
        .limit(4);

        return recentActivity.map(a => {
            let title = "";
            let color = "bg-zinc-400";
            
            if (a.status === 'approved') { title = `Checkout approved · ${a.equipmentName}`; color = "bg-green-500"; }
            else if (a.status === 'denied') { title = `Checkout denied · ${a.equipmentName}`; color = "bg-red-500"; }
            else if (a.status === 'active') { title = `Equipment picked up · ${a.equipmentName}`; color = "bg-blue-500"; }
            else if (a.status === 'returned') { title = `Equipment returned · ${a.equipmentName}`; color = "bg-zinc-500"; }
            else if (a.status === 'pending') { title = `New request · ${a.equipmentName}`; color = "bg-amber-500"; }
            else { title = `Status updated · ${a.equipmentName}`; }

            return { id: a.id, title, color, time: a.updatedAt, user: a.userName || "System" };
        });
    } catch (e) {
        console.error("Activity widget error:", e);
        return [];
    }
}

// equipment-realated-action

export async function uploadEquipmentAction(data: z.infer<typeof equipmentSchema>) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session || session.user.role !== 'admin') {
        throw new Error("You must be admin to create equipment");
    }

    try {
        // 2. Parse the incoming object directly
        const validateFields = equipmentSchema.parse(data);

        await db.insert(EquipmentTable).values({
            name: validateFields.title,
            category: validateFields.category,
            internalTag: validateFields.internalTag,
            description: validateFields.description,
            imageUrl: validateFields.imageUrl,
            equipmentCondition: validateFields.equipmentCondition,
            equipmentStatus: validateFields.equipmentStatus,
            requireApproval: validateFields.requireApproval,
            maxCheckOutDays: validateFields.maxCheckOutDays
        });

        revalidatePath("/admin/equipment");

        return { success: true }
    }
    catch (e) {
        console.log("Error while creating equipment: ", e);
        return {
            success: false,
            error: "Failed to upload equipment"
        }
    }
}

export async function getAllEquipmentAction(category?: string) {

    try {
        const query = await db.select().from(EquipmentTable)
            .where(category ? eq(EquipmentTable.category, category) : undefined);

        return query;
    }
    catch (e) {
        console.log("Error fetching equipment:", e);
        return []
    }
}

export async function getTotalEquipmentCountAction() {

    try {
        const [result] = await db.select({ totalEquipment: count() })
            .from(EquipmentTable)

        return result?.totalEquipment;
    }
    catch (e) {
        console.log(e);
        return 0;
    }
}

export const updateEquipmentStockAction = async (equipmentId: string, newStock: number) => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== 'admin') {
        return { success: false, error: "Unauthorized" };
    }

    try {
        await db.update(EquipmentTable)
            .set({ stock: newStock })
            .where(eq(EquipmentTable.id, equipmentId));

        // Revalidate the specific equipment page so the new data renders on refresh
        revalidatePath(`/admin/equipment/${equipmentId}`);
        return { success: true };
    } catch (error) {
        console.error("Error updating stock: ", error);
        return { success: false, error: "Failed to update stock" };
    }
}

export const checkEquipmentInUseAction = async (equipmentId: string) => {
    try {
        const now = new Date();

        const currentBookings = await db.select({ id: BookingTable.id })
            .from(BookingTable)
            .where(
                and(
                    eq(BookingTable.equipmentId, equipmentId),
                    // Booking started before or exactly right now
                    lte(BookingTable.startTime, now), 
                    // Booking ends strictly after right now
                    gt(BookingTable.endTime, now),    
                    // Only count bookings that are actually approved or active
                    inArray(BookingTable.status, ['approved', 'active', 'late']) 
                )
            );

        return {
            success: true,
            inUse: currentBookings.length > 0
        };
    } catch (error) {
        console.error("Error checking equipment in-use status:", error);
        return {
            success: false,
            inUse: false
        };
    }
}

// approval-related-action

export async function reviewBookingAction(bookingId: string, newStatus: "approved" | "denied") {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== 'admin') {
        throw new Error("You must be admin to review the booking.");
    }

    try {
        // Fetch booking info BEFORE update for the notification
        const [booking] = await db.select({ 
            userId: BookingTable.userId, 
            equipmentName: EquipmentTable.name 
        })
        .from(BookingTable)
        .leftJoin(EquipmentTable, eq(EquipmentTable.id, BookingTable.equipmentId))
        .where(eq(BookingTable.id, bookingId));

        await db.update(BookingTable).set({
            status: newStatus,
            reviewedById: session.user.id,
            reviewedAt: new Date(),
            updatedAt: new Date()
        }).where(eq(BookingTable.id, bookingId));

        // Send Notification
        if (booking && booking.userId) {
            await sendNotification({
                userId: booking.userId,
                type: newStatus === "approved" ? "booking_approved" : "booking_denied",
                title: newStatus === "approved" ? "Request Approved" : "Request Denied",
                message: `Your request for ${booking.equipmentName} was ${newStatus}.`,
                relatedBookingId: bookingId
            });
        }

        revalidatePath("/admin/approval");
        revalidatePath("/admin/schedule");
        return { success: true }
    } catch (e) {
        console.error("Booking review error: ", e);
        return { success: false, error: "An unexpected error occurred while reviewing the booking." }
    }
}

export const pendingBookingAction = async () => {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session || session.user.role !== 'admin') {
        throw new Error("You must be admin to get the pending bookings");
    }

    try {
        await autoExpirePendingBookingsAction();
        const result = await db.select(
            {
                id: BookingTable.id,
                userName: user.name,
                equipmentName: EquipmentTable.name,
                equipmentCategory: EquipmentTable.category,
                equipmentTag: EquipmentTable.internalTag,
                startTime: BookingTable.startTime,
                endTime: BookingTable.endTime,
                status: BookingTable.status,
                createdAt: BookingTable.createdAt
            }
        ).from(BookingTable)
            .leftJoin(EquipmentTable, () => eq(BookingTable.equipmentId, EquipmentTable.id))
            .leftJoin(user, () => eq(BookingTable.userId, user.id))
            .where(eq(BookingTable.status, 'pending'))
            .orderBy(asc(BookingTable.createdAt));
        return result;
    }
    catch (e) {
        console.log("Get pending bookings error: ", e)
        return [];
    }
}

export const togglePendingStatus = async (bookingId: string, newStatus: "active" | "pending" | "approved" | "returned" | "denied" | "cancelled" | "late") => {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session || session.user.role !== 'admin') {
        throw new Error("You must be admin to toggle the pending request.");
    }

    try {
        await db.update(BookingTable).set(
            {
                status: newStatus
            }
        ).where(eq(BookingTable.id, bookingId))

        revalidatePath("/admin/approval")
        revalidatePath("/admin/schedule")
        return {
            success: true
        }
    }
    catch (e) {
        console.log(e);
        return {
            success: false
        }
    }
}

// schedule-related-action

export const getWeeklyEquipmentStatsAction = async (equipmentId: string, weekStartDateStr: string) => {

    const startDate = new Date(weekStartDateStr);
    startDate.setHours(0, 0, 0, 0)
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    try {
        const weeklyBookings = await db.select(
            {
                userName: user.name,
                startTime: BookingTable.startTime,
                endTime: BookingTable.endTime,
                status: BookingTable.status
            })
            .from(BookingTable)
            .leftJoin(user, () => eq(BookingTable.userId, user.id))
            .where(
                and(
                    eq(BookingTable.equipmentId, equipmentId),
                    gte(BookingTable.startTime, startDate),
                    lte(BookingTable.endTime, endDate),
                    inArray(BookingTable.status, ['pending', 'approved'])
                )
            )

        const stats = Array.from({ length: 7 }, () => ({
            pending: [] as { userName: string, slot: string }[],
            approved: [] as { userName: string, slot: string }[],
        }))
        weeklyBookings.map((booking) => {
            const bookingDate = new Date(booking.startTime);
            bookingDate.setHours(0, 0, 0, 0);
            const diffTime = bookingDate.getTime() - startDate.getTime();
            const index = Math.floor(diffTime / (24 * 60 * 60 * 1000));

            if (index >= 0 && index < 7) {
                const userName = booking.userName || "unknown user";
                const startHour = booking.startTime.getHours().toString().padStart(2, '0');
                const endHour = booking.endTime.getHours().toString().padStart(2, '0');

                const bookingDetails = {
                    userName: booking.userName || "unknown user",
                    slot: `${startHour}:00-${endHour}:00`
                }
                if (booking.status === 'approved') {
                    stats[index].approved.push(bookingDetails)
                }
                if (booking.status === 'pending') {
                    stats[index].pending.push(bookingDetails)
                }
            }
        })
        return stats;
    }
    catch (error) {
        console.error("Error fetching daily slots:", error);
        return Array.from({ length: 7 }, () => ({
            pending: [],
            approved: [],
        }))
    }
}
export const getWeeklyScheduleAction = async (dateString: string) => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== 'admin') {
        throw new Error("Unauthorized");
    }

    // 1. Start exactly on the provided date (defaults to today)
    const baseDate = new Date(dateString);
    const weekStart = startOfDay(baseDate);
    
    // 2. End exactly 6 days later (total of 7 days) at 23:59:59
    const weekEnd = endOfDay(addDays(baseDate, 6));

    try {
        const equipment = await db.select({
            id: EquipmentTable.id,
            name: EquipmentTable.name,
            internalTag: EquipmentTable.internalTag
        }).from(EquipmentTable).orderBy(EquipmentTable.name);

        const bookings = await db.select({
            id: BookingTable.id,
            equipmentId: BookingTable.equipmentId,
            userName: user.name,
            startTime: BookingTable.startTime,
            endTime: BookingTable.endTime,
            status: BookingTable.status
        })
        .from(BookingTable)
        .leftJoin(user, eq(user.id, BookingTable.userId))
        .where(
            and(
                // Overlap formula remains the same
                lt(BookingTable.startTime, weekEnd),
                gt(BookingTable.endTime, weekStart),
                inArray(BookingTable.status, ['active', 'approved', 'pending', 'late'])
            )
        );

        return { equipment, bookings, weekStart, weekEnd };
    } catch (e) {
        console.error("Weekly schedule error:", e);
        return { equipment: [], bookings: [], weekStart, weekEnd };
    }
}


// checkout-related-actions

export const getReadyForPickupAction = async () => {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session || session.user.role !== 'admin') {
        return [];
    }

    // CREATE NEW TIME WINDOWS
    const now = new Date();
    const twentyMinsFromNow = new Date(now.getTime() + 20 * 60 * 1000);

    try {
        const data = await db.select({
            id: BookingTable.id,
            equipmentName: EquipmentTable.name,
            currentStock: EquipmentTable.stock,
            userName: user.name,
            startTime: BookingTable.startTime,
            endTime: BookingTable.endTime,
        })
            .from(BookingTable)
            .leftJoin(user, eq(user.id, BookingTable.userId))
            .leftJoin(EquipmentTable, eq(EquipmentTable.id, BookingTable.equipmentId))
            .where(
                and(
                    eq(BookingTable.status, 'approved'),
                    // Show if it starts in the next 20 mins OR has already started
                    lte(BookingTable.startTime, twentyMinsFromNow),
                    // Hide it if the booking's end time has already completely passed
                    gte(BookingTable.endTime, now)
                )
            ).orderBy(asc(BookingTable.startTime))

        return data;

    }
    catch (e) {
        console.log("Error fetching ready pickups: ", e);
        return [];
    }
}

export const getAwaitingReturnAction = async () => {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session || session.user.role !== 'admin') {
        return [];
    }

    try {
        const data = await db.select(
            {
                id: BookingTable.id,
                equipmentName: EquipmentTable.name,
                userName: user.name,
                startTime: BookingTable.startTime,
                endTime: BookingTable.endTime,
            }
        )
            .from(BookingTable)
            .leftJoin(user, eq(user.id, BookingTable.userId))
            .leftJoin(EquipmentTable, eq(EquipmentTable.id, BookingTable.equipmentId))
            .where(eq(BookingTable.status, 'active'))
            .orderBy(asc(BookingTable.endTime))

        return data;
    }
    catch (e) {
        console.error("FULL DATABASE ERROR:", JSON.stringify(e, Object.getOwnPropertyNames(e)));
        return [];
    }
}

export const grantEquipmentAction = async (bookingId: string) => {
    try {
        const [booking] = await db.select({
            equipmentId: BookingTable.equipmentId,
            userId: BookingTable.userId,
            equipmentName: EquipmentTable.name
        })
        .from(BookingTable)
        .leftJoin(EquipmentTable, eq(EquipmentTable.id, BookingTable.equipmentId))
        .where(eq(BookingTable.id, bookingId));

        if (!booking || !booking.equipmentId) return { success: false, error: "Booking or equipment not found!" };

        await db.update(BookingTable).set({ status: 'active' }).where(eq(BookingTable.id, bookingId));
        await db.update(EquipmentTable).set({ stock: sql`${EquipmentTable.stock} - 1` }).where(eq(EquipmentTable.id, booking.equipmentId));

        // NOTIFY USER
        await sendNotification({
            userId: booking.userId,
            type: "checkout_active",
            title: "Equipment Picked Up",
            message: `You have successfully picked up ${booking.equipmentName}.`,
            relatedBookingId: bookingId
        });

        revalidatePath('/admin');
        revalidatePath('/admin/handoff');
        return { success: true };
    } catch (e) {
        console.error("🔥 FATAL CHECKOUT ERROR: ", e);
        return { success: false, error: "Failed to checkout" };
    }
}
export const returnEquipmentAction = async (bookingId: string) => {
    try {
        const [booking] = await db.select({
            equipmentId: BookingTable.equipmentId,
            userId: BookingTable.userId,
            startTime: BookingTable.startTime,
            endTime: BookingTable.endTime,
            equipmentName: EquipmentTable.name
        })
        .from(BookingTable)
        .leftJoin(EquipmentTable, eq(EquipmentTable.id, BookingTable.equipmentId))
        .where(eq(BookingTable.id, bookingId));

        if (!booking || !booking.equipmentId) return { success: false, error: "Booking or equipment not found" };

        const currentTime = new Date();
        const isLate = currentTime > booking.endTime;
        
        await db.update(BookingTable)
            .set({ status: isLate ? 'late' : 'returned' })
            .where(eq(BookingTable.id, bookingId));

        await db.update(EquipmentTable)
            .set({ stock: sql`${EquipmentTable.stock} + 1` })
            .where(eq(EquipmentTable.id, booking.equipmentId));

        // NOTIFY USER
        await sendNotification({
            userId: booking.userId,
            type: isLate ? "checkout_late" : "checkout_returned",
            title: isLate ? "Late Return Recorded" : "Equipment Returned",
            message: `Your return of ${booking.equipmentName || "equipment"} was successfully recorded${isLate ? " past the due time" : ""}.`,
            relatedBookingId: bookingId
        });

        revalidatePath('/admin');
        revalidatePath('/admin/handoff');
        return { success: true };
    } catch (e) {
        console.error("Return Error: ", e);
        return { success: false, error: "Failed to return" };
    }
}

// damage-report-data

export const getReportsDataAction = async (status?: string) => {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session || session.user.role !== 'admin') {
        throw new Error("You must be admin to get the reports");
    }

    const conditions = status ? eq(DamageReportTable.status, status as "open" | "investigating" | "resolved") : undefined;
    try {
        const data = await db.select({
            id: DamageReportTable.id,
            equipmentTitle: EquipmentTable.name,
            equipmentTag: EquipmentTable.internalTag,
            reportedBy: user.name,
            title: DamageReportTable.title,
            description: DamageReportTable.description,
            severity: DamageReportTable.severity,
            imageUrl: DamageReportTable.imageUrl,
            status: DamageReportTable.status,
            createdAt: DamageReportTable.createdAt,

        }).from(DamageReportTable)
            .leftJoin(user, eq(user.id, DamageReportTable.reportedById))
            .leftJoin(EquipmentTable, eq(EquipmentTable.id, DamageReportTable.equipmentId))
            .where(conditions).orderBy(desc(DamageReportTable.createdAt))

        return data;
    }
    catch (e) {
        console.log("Admin report finding error: ", e);
        return [];
    }
}

export const getDamageReportDetailsByIdAction = async (reportId: string) => {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || session.user.role !== 'admin') {
        throw new Error("You must be admin to get the report details");
    }

    try {
        // Using Drizzle's Relational API - No aliases or manual joins needed!
        const report = await db.query.DamageReportTable.findFirst({
            where: eq(DamageReportTable.id, reportId),
            with: {
                equipment: true, // Uses the 'equipment' relation from your schema
                reporter: true,  // Uses the 'reporter' relation from your schema
                resolver: true,  // Uses the 'resolver' relation from your schema
            }
        });

        if (!report) return null;

        // Flatten the result so the UI component can read it easily
        return {
            id: report.id,
            title: report.title,
            description: report.description,
            severity: report.severity,
            status: report.status,
            imageUrl: report.imageUrl,
            createdAt: report.createdAt,
            resolvedAt: report.resolvedAt,

            // Map the nested relational data to the flat properties the UI expects
            equipmentName: report.equipment?.name || null,
            equipmentTag: report.equipment?.internalTag || null,
            reporterName: report.reporter?.name || null,
            resolverName: report.resolver?.name || null,
        };
    }
    catch (e) {
        console.error(e);
        return null;
    }
}

export const handleInvestigateAction = async (reportId: string) => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== 'admin') throw new Error("Unauthorized");

    try {
        // Fetch report to get reporter's ID for notification
        const [report] = await db.select({ 
            reportedById: DamageReportTable.reportedById,
            equipmentName: EquipmentTable.name
        })
        .from(DamageReportTable)
        .leftJoin(EquipmentTable, eq(EquipmentTable.id, DamageReportTable.equipmentId))
        .where(eq(DamageReportTable.id, reportId));

        await db.update(DamageReportTable).set({ status: 'investigating' }).where(eq(DamageReportTable.id, reportId));

        // NOTIFY USER
        if (report && report.reportedById) {
            await sendNotification({
                userId: report.reportedById,
                type: "damage_investigating",
                title: "Report Status Updated",
                message: `Your damage report for ${report.equipmentName} is now under investigation by admins.`
            });
        }

        revalidatePath(`/admin/damageReport/${reportId}`);
        revalidatePath(`/admin/damageReport`, 'layout');
        return { success: true };
    } catch (e) {
        console.error("Investigation toggle error: ", e);
        return { success: false, error: "Unexpected error while investigating the report..." };
    }
}

export const handleResolveAction = async (reportId: string) => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== 'admin') throw new Error("Unauthorized");

    try {
        const [report] = await db.select({ 
            reportedById: DamageReportTable.reportedById,
            equipmentName: EquipmentTable.name
        })
        .from(DamageReportTable)
        .leftJoin(EquipmentTable, eq(EquipmentTable.id, DamageReportTable.equipmentId))
        .where(eq(DamageReportTable.id, reportId));

        await db.update(DamageReportTable).set({
            status: 'resolved',
            resolvedById: session.user.id,
            resolvedAt: new Date()
        }).where(eq(DamageReportTable.id, reportId));

        // NOTIFY USER
        if (report && report.reportedById) {
            await sendNotification({
                userId: report.reportedById,
                type: "damage_resolved",
                title: "Report Resolved",
                message: `Your damage report for ${report.equipmentName} has been resolved.`
            });
        }

        revalidatePath(`/admin/damageReport/${reportId}`);
        revalidatePath(`/admin/damageReport`, 'layout');
        return { success: true };
    } catch (e) {
        console.error("Resolve toggle error: ", e);
        return { success: false, error: "Unexpected error while resolving the report..." };
    }
}


// member-related-actions

export const getAdminMemberAction = async (role?: string, page: number = 1, limit: number = 10) => {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || session.user.role !== 'admin') {
        throw new Error("You must be logged in and admin to get all the users");
    }

    try {
        const offset = (page - 1) * limit;

        // 1. Fetch Paginated Data
        const query = db.select({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            activeEquipment: sql<number>`sum(case when ${BookingTable.status} = 'active' then 1 else 0 end)`.mapWith(Number),
            pendingEquipment: sql<number>`sum(case when ${BookingTable.status} = 'pending' then 1 else 0 end)`.mapWith(Number),
            status: user.banned
        })
        .from(user)
        .leftJoin(BookingTable, eq(BookingTable.userId, user.id))
        .groupBy(user.id)
        .orderBy(desc(user.createdAt))
        .limit(limit)
        .offset(offset);

        if (role) {
            query.where(eq(user.role, role));
        }

        const members = await query;

        // 2. Fetch Total Count (for pagination math)
        const countQuery = db.select({
            count: sql<number>`count(*)`.mapWith(Number)
        }).from(user);
        
        if (role) {
            countQuery.where(eq(user.role, role));
        }
        
        const totalResult = await countQuery;
        const totalRecords = totalResult[0]?.count || 0;
        const totalPages = Math.ceil(totalRecords / limit);

        return { members, totalPages };
    }
    catch (e) {
        console.error(e);
        return { members: [], totalPages: 0 };
    }
}

export const banUserByIdAction = async (targetUserId: string) => {
    const userSession = await auth.api.getSession({
        headers: await headers()
    })

    if (!userSession?.user.id && userSession?.user.role === 'admin') {
        throw new Error("You must be logged in and admin to ban a member");
    }
    if (userSession?.user.email === "admin@test.com") {
        return { success: true, message: "Demo Mode: member ban simulated successfully!" };
    }

    try {
        await db.update(user).set({ banned: true }).where(eq(user.id, targetUserId));
        await db.delete(session).where(eq(session.userId, targetUserId));
        revalidatePath("/admin/members")
        return {
            success: true,
            message:"Member banned successfully"
        }
    }
    catch (e) {
        console.log(e);
        return {
            success: false
        }
    }
}

export const unBanUserByIdAction = async (targetUserId: string) => {
    const userSession = await auth.api.getSession({
        headers: await headers()
    })

    if (!userSession?.user.id && userSession?.user.role === 'admin') {
        throw new Error("You must be logged in and admin to unban a member");
    }

    if (userSession?.user.email === "admin@test.com") {
        return { success: true, message: "Demo Mode: member ban simulated successfully!" };
    }

    try {
        await db.update(user).set({
            banned: false,
            banReason: null,
            banExpires: null,
        }).where(eq(user.id, targetUserId));

        revalidatePath("/admin/members")
        return {
            success: true,
            message:"member unbanned successfully"
        }
    }
    catch (e) {
        console.log(e);
        return {
            success: false
        }
    }
}

export const deleteUserByIdAction = async (userId: string) => {
    const userSession = await auth.api.getSession({
        headers: await headers()
    })

    if (!userSession?.user.id && userSession?.user.role === 'admin') {
        throw new Error("You must be logged in and admin to delete a member");
    }

    if (userSession?.user.email === "admin@test.com") {
        return { success: true, message: "Demo Mode: Member deletion simulated successfully!" };
    }

    try {
        await db.delete(user).where(eq(user.id, userId));

        revalidatePath("/admin/members");
        return {
            success: true,
            message:"Member deleted successfully"
        }
    }
    catch (e) {
        console.log(e);
        return {
            success: false
        }
    }
}

// roles && access
export const getPendingRoleRequestsAction = async () => {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session || session.user.role !== 'admin') {
        throw new Error("Unauthorized. Admins only.");
    }

    try {
        // Fetch all pending requests along with the user's details
        const pendingRequests = await db.select({
            id: RoleRequestTable.id,
            requestedRole: RoleRequestTable.requestedRole,
            reason: RoleRequestTable.reason,
            createdAt: RoleRequestTable.createdAt,
            userName: user.name,
            userEmail: user.email,
            currentRole: user.role,
        })
        .from(RoleRequestTable)
        .leftJoin(user, eq(RoleRequestTable.userId, user.id))
        .where(eq(RoleRequestTable.status, "pending"))
        .orderBy(desc(RoleRequestTable.createdAt));

        return pendingRequests;
    } catch (error) {
        console.error("Fetch pending requests error:", error);
        return [];
    }
};
export const reviewRoleRequestAction = async (requestId: string, status: "approved" | "denied") => {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session || session.user.role !== 'admin') {
        return { success: false, error: "Unauthorized. Admins only." };
    }

    try {
        // Find the specific request
        const [request] = await db.select()
            .from(RoleRequestTable)
            .where(eq(RoleRequestTable.id, requestId));

        if (!request) {
            return { success: false, error: "Request not found." };
        }

        // Update the request's status and record who reviewed it
        await db.update(RoleRequestTable).set({
            status: status,
            reviewedById: session.user.id,
            reviewedAt: new Date()
        }).where(eq(RoleRequestTable.id, requestId));

        // If the admin approved it, actually update the user's role
        if (status === "approved") {
            await db.update(user).set({
                role: request.requestedRole
            }).where(eq(user.id, request.userId));
        }

        // Revalidate the members or roles page so the UI updates instantly
        revalidatePath("/admin/members"); 
        revalidatePath("/admin/roles"); 

        return { success: true };
    } catch (error) {
        console.error("Review role request error:", error);
        return { success: false, error: "Failed to process role request." };
    }
};

// admin-profile
export const getAdminProfileDataAction = async () => {
    const session = await auth.api.getSession({ headers: await headers() });
    
    // Ensure only admins can fetch this data
    if (!session || session.user.role !== 'admin') {
        return null;
    }

    try {
        const [adminData] = await db.select()
            .from(user)
            .where(eq(user.id, session.user.id));
            
        return adminData;
    } catch (error) {
        console.error("Error fetching admin profile:", error);
        return null;
    }
};