import { pgEnum } from "drizzle-orm/pg-core";

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