import { equipmentConditionEnum, equipmentStatusEnum } from "@/utils/extraForSchema";
import z from "zod";


export const equipmentSchema = z.object({
    title: z.string()
        .min(2, "Title should have at least 2 characters")
        .max(20, "Title should have at max 15 characters"),
    category: z.string().min(1, "Please chose a category"),
    internalTag: z.string()
        .min(1, "Enter a tag")
        .max(20, "Tag should be less than 20 characters"),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
    equipmentCondition: z.enum(equipmentConditionEnum.enumValues).default("excellent"),
    equipmentStatus: z.enum(equipmentStatusEnum.enumValues).default("active"),
    requireApproval: z.boolean().default(true),
    maxCheckOutDays: z.coerce.number()
        .int().min(1, "Must be at least 1 day")
        .max(365, "Cannot exceed 365 days"),
})