
import { bookingStatusEnum, damageSeverityEnum, damageStatusEnum, equipmentConditionEnum, equipmentStatusEnum, notificationTypeEnum} from "@/utils/extraForSchema";
import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, uuid, integer } from "drizzle-orm/pg-core";




export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  role: text("role").default("student"),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    impersonatedBy: text("impersonated_by"),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const EquipmentTable = pgTable("equipment", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  internalTag: text("internal_tag").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  equipmentCondition: equipmentConditionEnum("equipment_condition").default("excellent").notNull(),
  equipmentStatus: equipmentStatusEnum("equipment_status").default("active").notNull(),
  requireApproval: boolean("require_approval").default(true).notNull(),
  maxCheckOutDays: integer("max_checkout_days").default(3).notNull(),
  stock:integer("stock").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export const BookingTable=pgTable("bookings",{
  id:uuid("id").primaryKey().defaultRandom(),
  equipmentId:uuid("equipment_id").references(()=>EquipmentTable.id,{onDelete:"restrict"}).notNull(),
  userId:text("user_id").references(()=>user.id,{onDelete:"cascade"}).notNull(),

  accessoryIds: uuid("accessory_ids").array().default([]),
  
  startTime:timestamp("start_time").notNull(),
  endTime:timestamp("end_time").notNull(),

  status:bookingStatusEnum("status").default("pending").notNull(),
  purpose:text("purpose"),

  reviewedById:text("reviewed_by_id"),
  reviewedAt:timestamp("reviewed_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export const DamageReportTable = pgTable("damage_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  equipmentId: uuid("equipment_id").references(() => EquipmentTable.id, { onDelete: "cascade" }).notNull(),
  reportedById: text("reported_by_id").references(() => user.id).notNull(), 
  
  title: text("title").notNull(),
  description: text("description").notNull(),
  
  severity: damageSeverityEnum("severity").notNull(),
  status: damageStatusEnum("status").default("open").notNull(),
  imageUrl: text("image_url"),

  resolvedById: text("resolved_by_id").references(() => user.id),
  resolvedAt: timestamp("resolved_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const NotificationTable = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  // The user receiving the notification
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }).notNull(),
  
  // Links to the enum created above
  type: notificationTypeEnum("type").notNull(),
  
  title: text("title").notNull(),
  message: text("message").notNull(),
  
  // Tracks if the user has seen it (used for the green dot and bold styling)
  isRead: boolean("is_read").default(false).notNull(),
  
  // Optional: Link directly to the booking related to this notification
  relatedBookingId: uuid("related_booking_id").references(() => BookingTable.id, { onDelete: "set null" }),

  createdAt: timestamp("created_at").notNull().defaultNow(),
},
(table) => [
  // Indexes for faster querying since notifications grow quickly
  index("notification_userId_idx").on(table.userId),
  index("notification_isRead_idx").on(table.isRead)
]);

// relations

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  bookings:many(BookingTable,{relationName:"user_bookings"}),
  reviewedBookings:many(BookingTable,{relationName:"reviewed_bookings"}),
  reportedDamages: many(DamageReportTable, { relationName: "reported_damages" }),
  notifications: many(NotificationTable),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const equipmentRelations=relations(EquipmentTable,({many})=>({
  bookings:many(BookingTable),
  damageReports: many(DamageReportTable),
}))

export const bookingRelations=relations(BookingTable,({one,many})=>({

  equipment:one(EquipmentTable,{
    fields:[BookingTable.equipmentId],
    references:[EquipmentTable.id],
  }),
  users:one(user,{
    fields:[BookingTable.userId],
    references:[user.id],
    relationName:"user_bookings"
  }),
  reviewer:one(user,{
    fields:[BookingTable.reviewedById],
    references:[user.id],
    relationName:"reviewed_bookings"
  }),
  notifications: many(NotificationTable),

}))

export const reportRelation=relations(DamageReportTable,({one})=>({
  equipment: one(EquipmentTable, {
    fields: [DamageReportTable.equipmentId],
    references: [EquipmentTable.id],
  }),
  reporter: one(user, {
    fields: [DamageReportTable.reportedById],
    references: [user.id],
    relationName: "reported_damages",
  }),
  resolver: one(user, {
    fields: [DamageReportTable.resolvedById],
    references: [user.id],
  }),
}))

export const NotificationRelations = relations(NotificationTable, ({ one }) => ({
  user: one(user, {
    fields: [NotificationTable.userId],
    references: [user.id],
  }),
  booking: one(BookingTable, {
    fields: [NotificationTable.relatedBookingId],
    references: [BookingTable.id],
  }),
}));