import z from "zod";

export const bookingSchema = z.object({
    equipmentId: z.string().uuid("Invalid equipment id"),
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
    purpose: z.string().optional(),
}).refine((data) => data.endTime > data.startTime, {
    message: "End time must be greater than start time",
    path: ["endTime"]
}
)

export const requestBookingSchema = z.object({
    equipmentId: z.string().uuid("Invalid equipment id"),
    pickupDate: z.date("Pickup date is required"),
    pickupTime: z.string().min(1, "Pickup time is required"),
    returnDate: z.date("Return date is required"),
    returnTime: z.string().min(1, "Return time is required"),
    purpose: z.string().min(5, "Please provide a description of the purpose"),
    certified: z.boolean().refine(val => val === true, {
        message: "You must accept the terms and conditions"
    })
});
