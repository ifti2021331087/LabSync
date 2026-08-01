"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, differenceInHours } from "date-fns"
import { Camera, Clock2Icon, ShieldCheck } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { createBookingAction } from "@/actions/userActions"
import Image from "next/image"
import { requestBookingSchema } from "../schama/booking"

interface EquipmentProps {
    id: string;
    name: string;
    category: string;
    internalTag: string;
    description: string | null;
    imageUrl: string | null;
    equipmentCondition: "excellent" | "good" | "fair" | "poor";
    equipmentStatus: "active" | "maintenance" | "retired";
    requireApproval: boolean;
    maxCheckOutDays: number;
    stock: number;
    createdAt: Date;
    updatedAt: Date;
}

export default function RequestCheckoutForm({ equipment }: { equipment: EquipmentProps }) {
    const router = useRouter();
    const [isPending, startTransition] = React.useTransition();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + equipment.maxCheckOutDays);

    const form = useForm<z.infer<typeof requestBookingSchema>>({
        resolver: zodResolver(requestBookingSchema),
        defaultValues: {
            equipmentId: equipment.id,
            pickupTime: "10:00",
            returnTime: "17:00",
            purpose: "",
            certified: false,
        },
    });

    // Watch fields to dynamically update the Request Summary
    const watchedPickupDate = form.watch("pickupDate");
    const watchedPickupTime = form.watch("pickupTime");
    const watchedReturnDate = form.watch("returnDate");
    const watchedReturnTime = form.watch("returnTime");

    // Helper to combine date and time for calculations
    const combineDateTime = (date?: Date, timeStr?: string) => {
        if (!date || !timeStr) return null;
        const [hours, minutes] = timeStr.split(':').map(Number);
        const combined = new Date(date);
        combined.setHours(hours, minutes, 0, 0);
        return combined;
    };

    const startDateTime = combineDateTime(watchedPickupDate, watchedPickupTime);
    const endDateTime = combineDateTime(watchedReturnDate, watchedReturnTime);
    
    // Calculate Duration
    let durationHours = 0;
    if (startDateTime && endDateTime && endDateTime > startDateTime) {
        durationHours = differenceInHours(endDateTime, startDateTime);
    }

    function onSubmit(data: z.infer<typeof requestBookingSchema>) {
        const start = combineDateTime(data.pickupDate, data.pickupTime);
        const end = combineDateTime(data.returnDate, data.returnTime);

        if (!start || !end) {
            toast.error("Invalid dates or times provided.");
            return;
        }

        if (end <= start) {
            form.setError("returnTime", { message: "Return time must be after pickup time." });
            return;
        }

        startTransition(async () => {
            const result = await createBookingAction({
                equipmentId: data.equipmentId,
                startTime: start,
                endTime: end,
                purpose: data.purpose
            });

            if (result.success) {
                toast.success(result.status === "approved" ? "Booking confirmed!" : "Request submitted for admin review.");
                router.push("/requests");
            } else {
                toast.error(result.error);
            }
        });
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Side: The Form */}
            <div className="lg:col-span-2">
                <form id="checkout-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    
                    {/* Checkout Window */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold tracking-wider text-zinc-500 uppercase">Checkout Window</h3>
                        <FieldGroup className="bg-zinc-50/50 dark:bg-zinc-900/20 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Pickup Date */}
                                <Controller name="pickupDate" control={form.control} render={({ field, fieldState }) => (
                                    <Field className="w-full">
                                        <FieldLabel>Pickup Date</FieldLabel>
                                        <Popover>
                                            <PopoverTrigger render={<Button variant="outline" className={`justify-start font-normal ${!field.value && "text-muted-foreground"}`}>{field.value ? format(field.value, "PPP") : "Pick a date"}</Button>} />
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < today || date > maxDate} className="rounded-md w-full" />
                                            </PopoverContent>
                                        </Popover>
                                        {fieldState.invalid && <FieldError errors={fieldState.error?.message ? [{ message: fieldState.error.message }] : undefined} />}
                                    </Field>
                                )} />

                                {/* Pickup Time */}
                                <Controller name="pickupTime" control={form.control} render={({ field, fieldState }) => (
                                    <Field className="w-full">
                                        <FieldLabel>Pickup Time</FieldLabel>
                                        <InputGroup>
                                            <InputGroupInput type="time" {...field} className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden" />
                                            <InputGroupAddon>
                                                <Clock2Icon className="w-4 h-4 text-muted-foreground" />
                                            </InputGroupAddon>
                                        </InputGroup>
                                        {fieldState.invalid && <FieldError errors={fieldState.error?.message ? [{ message: fieldState.error.message }] : undefined} />}
                                    </Field>
                                )} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                {/* Return Date */}
                                <Controller name="returnDate" control={form.control} render={({ field, fieldState }) => (
                                    <Field className="w-full">
                                        <FieldLabel>Return Date</FieldLabel>
                                        <Popover>
                                            <PopoverTrigger render={<Button variant="outline" className={`justify-start font-normal ${!field.value && "text-muted-foreground"}`}>{field.value ? format(field.value, "PPP") : "Pick a date"}</Button>} />
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < today || date > maxDate} className="rounded-md w-full" />
                                            </PopoverContent>
                                        </Popover>
                                        {fieldState.invalid && <FieldError errors={fieldState.error?.message ? [{ message: fieldState.error.message }] : undefined} />}
                                    </Field>
                                )} />

                                {/* Return Time */}
                                <Controller name="returnTime" control={form.control} render={({ field, fieldState }) => (
                                    <Field className="w-full">
                                        <FieldLabel>Return Time</FieldLabel>
                                        <InputGroup>
                                            <InputGroupInput type="time" {...field} className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden" />
                                            <InputGroupAddon>
                                                <Clock2Icon className="w-4 h-4 text-muted-foreground" />
                                            </InputGroupAddon>
                                        </InputGroup>
                                        {fieldState.invalid && <FieldError errors={fieldState.error?.message ? [{ message: fieldState.error.message }] : undefined} />}
                                    </Field>
                                )} />
                            </div>
                        </FieldGroup>
                    </div>

                    {/* Purpose */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold tracking-wider text-zinc-500 uppercase">Purpose</h3>
                        <Controller name="purpose" control={form.control} render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel>Usage Description</FieldLabel>
                                <Input {...field} aria-invalid={fieldState.invalid} placeholder="Briefly describe how you plan to use this equipment..." autoComplete="off" />
                                {fieldState.invalid && <FieldError errors={fieldState.error?.message ? [{ message: fieldState.error.message }] : undefined} />}
                            </Field>
                        )} />
                    </div>

                    {/* Acknowledgement */}
                    <div className="space-y-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                        <h3 className="text-xs font-bold tracking-wider text-zinc-500 uppercase">Acknowledgement</h3>
                        <Controller name="certified" control={form.control} render={({ field, fieldState }) => (
                            <Field orientation="horizontal" className="bg-zinc-50 dark:bg-zinc-900/30 p-4 rounded-lg">
                                <Checkbox id="terms-checkbox" aria-invalid={fieldState.invalid} checked={!!field.value} onCheckedChange={field.onChange} onBlur={field.onBlur} />
                                <FieldContent>
                                    <FieldLabel htmlFor="terms-checkbox" className="text-sm leading-relaxed cursor-pointer font-normal">
                                        I agree to return this equipment in the same condition. I understand that damage caused by negligence will be charged to my account. I have read the policy.
                                    </FieldLabel>
                                </FieldContent>
                                {fieldState.invalid && <FieldError errors={fieldState.error?.message ? [{ message: fieldState.error.message }] : undefined} />}
                            </Field>
                        )} />

                        <div className="flex justify-end pt-2">
                            <Button type="submit" form="checkout-form" disabled={isPending} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 h-10 font-semibold">
                                {isPending ? "Submitting..." : "Submit request"}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Right Side: Request Summary Card */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sticky top-6">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
                        Request summary
                    </h3>

                    {/* Equipment Preview */}
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
                        <div className="w-12 h-12 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center overflow-hidden relative">
                            {equipment.imageUrl ? (
                                <Image src={equipment.imageUrl} alt={equipment.name} fill className="object-cover" />
                            ) : (
                                <Camera className="w-5 h-5 text-zinc-400" />
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{equipment.name}</p>
                            <p className="text-xs text-zinc-500 uppercase tracking-wide">{equipment.internalTag} · {equipment.category}</p>
                        </div>
                    </div>

                    {/* Dynamic Booking Details */}
                    <div className="space-y-4 text-sm mb-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
                        <div className="flex justify-between items-center">
                            <span className="text-zinc-500">Pickup</span>
                            <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                {startDateTime ? format(startDateTime, "MMM d · HH:mm") : "—"}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-zinc-500">Return</span>
                            <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                {endDateTime ? format(endDateTime, "MMM d · HH:mm") : "—"}
                            </span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-zinc-500">Duration</span>
                            <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                {durationHours > 0 ? `${durationHours} hours` : "—"}
                            </span>
                        </div>
                    </div>

                    {/* Approval Status Section */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-zinc-500 text-sm">Approval</span>
                            {equipment.requireApproval ? (
                                <span className="px-2 py-1 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-[11px] font-bold uppercase tracking-wider">
                                    Admin review needed
                                </span>
                            ) : (
                                <span className="px-2 py-1 rounded bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3" /> Auto-approve
                                </span>
                            )}
                        </div>
                        
                        {equipment.requireApproval && (
                            <p className="text-xs text-zinc-500 leading-relaxed text-center mt-4">
                                You&apos;ll be notified by email and in-app within 24 hours.
                            </p>
                        )}
                    </div>
                </div>
            </div>
            
        </div>
    )
}