"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NotificationTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

interface SendNotificationParams {
    userId: string;
    type: "booking_approved" | "booking_denied" | "booking_submitted" | "return_reminder" | "damage_reported" | "system";
    title: string;
    message: string;
    relatedBookingId?: string;
}

interface MarkAllNotificationsAsReadResult {
    success: boolean;
}

type UserNotificationsResult = Awaited<ReturnType<typeof db.query.NotificationTable.findMany>>;

// 1. Utility to create a new notification
export const sendNotification = async ({ userId, type, title, message, relatedBookingId }: SendNotificationParams): Promise<void> => {
    try {
        await db.insert(NotificationTable).values({
            userId,
            type,
            title,
            message,
            relatedBookingId,
        });
    } catch (error) {
        console.error("Failed to send notification:", error);
    }
};

// 2. Fetch notifications for the logged-in user
export const getUserNotifications = async () => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user.id) return [];

    try {
        return await db.query.NotificationTable.findMany({
            where: eq(NotificationTable.userId, session.user.id),
            orderBy: (notifications, { desc }) => [desc(notifications.createdAt)],
            limit: 50, // Keep the UI fast by limiting to recent notifications
        });
    } catch (error) {
        console.error("Failed to fetch notifications:", error);
        return [];
    }
};

// 3. Mark all notifications as read (For the "Mark all as read" button)
export const markAllNotificationsAsRead = async () => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user.id) return { success: false };

    try {
        await db.update(NotificationTable)
            .set({ isRead: true })
            .where(eq(NotificationTable.userId, session.user.id));
        return { success: true };
    } catch (error) {
        return { success: false };
    }
};