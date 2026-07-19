import z from "zod";

export const reportDamageSchema = z.object({
    equipmentId: z.string().min(1, "Please select an item"),
    title: z.string().min(1, "Title should be at least 1 character")
        .max(50, "Title should be at max 50 character"),
    description: z.string().min(1, "Description should be at least 1 character")
        .max(500, "Description should be at max 500 character"),
    severity: z.enum(["cosmetic", "functional", "critical"]),
    imageUrl: z.string().optional(),
    certified: z.boolean().refine((val) => val === true, {
        message: "You must certify this report.",
    }),
});