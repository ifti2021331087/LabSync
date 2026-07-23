import { pgEnum } from "drizzle-orm/pg-core";

export const userRolesEnum=pgEnum("user_role",["student","faculty","admin"]);
export const equipmentConditionEnum = pgEnum("equipment_condition", ["excellent", "good", "fair", "poor"]);
export const equipmentStatusEnum = pgEnum("equipment_status", ["active", "maintenance", "retired"]);
export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",   
  "approved", 
  "active",    
  "returned",  
  "denied",    
  "cancelled",
  "late"       
]);
export const damageSeverityEnum = pgEnum("damage_severity", ["cosmetic", "functional", "critical"]);
export const damageStatusEnum = pgEnum("damage_status", ["open", "investigating", "resolved"]);
export const notificationTypeEnum = pgEnum("notification_type", [
  "booking_submitted",    // Blue send icon
  "booking_approved",     // Green check icon
  "booking_denied",       // Red 'X' icon
  "booking_cancelled",    // Gray/Red cancel icon
  "checkout_active",      // Equipment handed over to user
  "checkout_returned",    // Equipment returned successfully
  "checkout_late",        // Equipment returned late / marked as overdue
  "return_reminder",      // Amber clock icon
  "damage_reported",      // Alert icon (User submitted)
  "damage_investigating", // Admin is looking into the damage
  "damage_resolved",      // Admin resolved the damage
  "equipment_added",      // New equipment added to catalog
  "system"                // Purple building icon (e.g., joining an org)
]);