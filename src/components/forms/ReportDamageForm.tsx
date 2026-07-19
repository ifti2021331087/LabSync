"use client"

import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Info, TriangleAlert, Ban, UploadCloud, Loader2, XIcon } from 'lucide-react'
import z, { unknown } from 'zod'
import Image from 'next/image'

import { Button } from '../ui/button'
import { Field, FieldError, FieldLabel } from '../ui/field'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Checkbox } from '../ui/checkbox'
import { cn } from '@/lib/utils'

import { createReportAction, getAllEquipmentListAction } from '@/actions/userActions'
import { reportDamageSchema } from '../schama/reportDamage'
import { Input } from '../ui/input'
import { toast } from 'sonner'

type reportDamageValues = z.infer<typeof reportDamageSchema>;
type EquipmentItem = {
    id: string;
    title: string;
};

export default function ReportDamageForm() {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgressStatus, setUploadProgressStatus] = useState(0);
    const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([]);

    const form = useForm<reportDamageValues>({
        resolver: zodResolver(reportDamageSchema),
        defaultValues: {
            equipmentId: "",
            title: "",
            description: "",
            severity: undefined,
            imageUrl: "",
            certified: false
        },
    });

    // 1. Extract the submission success state
    const { isSubmitSuccessful } = form.formState;

    // 2. Automatically reset the form when submission is strictly successful
    useEffect(() => {
        if (isSubmitSuccessful) {
            form.reset({
                equipmentId: "",
                title: "",
                description: "",
                severity: undefined,
                imageUrl: "",
                certified: false
            });
        }
    }, [isSubmitSuccessful, form]);

    useEffect(() => {
        const fetchEquipment = async () => {
            try {
                const data = await getAllEquipmentListAction();
                setEquipmentList(data);
            } catch (error) {
                console.error("Failed to fetch equipment", error);
            }
        };
        fetchEquipment();
    }, []);

    async function onSubmit(data: reportDamageValues) {
        console.log("Submitted payload:", data);
        try {
            const result = await createReportAction(data);
            if (result.success) {
                toast.success("Report created successfully");
                // Note: form.reset() is now handled cleanly by the useEffect above
            } else {
                toast.error(result.error || "Failed to create report");
            }
        } catch (error: unknown) {
            console.log(error);
            toast.error(error instanceof Error ? error.message : "An unexpected error occurred");
        }
    }

    async function getCloudinarySignature(folder: string) {
        const response = await fetch("/api/sign-cloudinary-params", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paramsToSign: { folder } })
        });
        if (!response.ok) throw new Error("Failed to create cloudinary signature");
        return response.json();
    }

    const handleAssetUpload = async (file: File, onFieldChange: (url: string) => void) => {
        setIsUploading(true);
        setUploadProgressStatus(0);

        try {
            const { signature, timestamp } = await getCloudinarySignature('equipSync')
            const uploadData = new FormData();
            uploadData.append("file", file);
            uploadData.append("folder", "equipSync");
            uploadData.append("signature", signature);
            uploadData.append("timestamp", timestamp.toString());
            uploadData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ?? "");

            const xhr = new XMLHttpRequest();
            xhr.open("POST", `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    setUploadProgressStatus(Math.round((event.loaded / event.total) * 100));
                }
            }
            const cloudinaryPromise = new Promise<{ secure_url: string }>((resolve, reject) => {
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText));
                    else reject(new Error("Network Error"));
                }
                xhr.onerror = () => reject(new Error("Network Error"));
            })

            xhr.send(uploadData);
            const cloudinaryResponse = await cloudinaryPromise;

            if (cloudinaryResponse.secure_url) {
                onFieldChange(cloudinaryResponse.secure_url);
            }
        }
        catch (e) {
            console.log("Image upload error", e);
        }
        finally {
            setIsUploading(false);
            setUploadProgressStatus(0);
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 w-full">

            {/* SECTION: WHICH ITEM */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-400 tracking-widest uppercase">Which item?</h3>
                <Controller
                    name="equipmentId"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid} className="flex flex-col gap-2">
                            <FieldLabel className="text-sm font-medium">Equipment</FieldLabel>
                            <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className="w-full h-11 bg-white dark:bg-zinc-950">
                                    <SelectValue placeholder="Select an item..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {equipmentList.map((eq) => (
                                        <SelectItem key={eq.id} value={eq.id}>
                                            {eq.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-xs text-red-500" />}
                        </Field>
                    )}
                />
            </div>
            <div className="space-y-4">
                <Controller
                    name="title"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid} className="flex flex-col gap-1.5">
                            <FieldLabel htmlFor="form-rhf-demo-title" className="font-semibold text-zinc-900 dark:text-zinc-200 text-sm">
                                Title
                            </FieldLabel>
                            {/* Reverted to standard {..field} without manual value overrides */}
                            <Input
                                {...field}
                                id="form-rhf-demo-title"
                                aria-invalid={fieldState.invalid}
                                placeholder="e.g., What happened to the equipment"
                                autoComplete="off"
                                className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus-visible:ring-2 focus-visible:ring-blue-500 transition-shadow"
                            />
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} className="text-xs text-red-500 mt-1" />
                            )}
                        </Field>
                    )}
                />
            </div>

            {/* SECTION: SEVERITY */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-400 tracking-widest uppercase">Severity</h3>
                <Controller
                    name="severity"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid} className="flex flex-col gap-2">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                <button
                                    type="button"
                                    onClick={() => field.onChange("cosmetic")}
                                    className={cn(
                                        "flex flex-col items-center justify-center p-6 gap-2 rounded-xl border transition-all",
                                        field.value === "cosmetic"
                                            ? "bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:border-white dark:text-black"
                                            : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400"
                                    )}
                                >
                                    <Info className="w-6 h-6 mb-1" />
                                    <span className="font-semibold text-sm">Cosmetic</span>
                                    <span className={cn("text-xs", field.value === "cosmetic" ? "opacity-80" : "text-zinc-400")}>Scratches, dents</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => field.onChange("functional")}
                                    className={cn(
                                        "flex flex-col items-center justify-center p-6 gap-2 rounded-xl border transition-all",
                                        field.value === "functional"
                                            ? "bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:border-white dark:text-black"
                                            : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400"
                                    )}
                                >
                                    <TriangleAlert className="w-6 h-6 mb-1" />
                                    <span className="font-semibold text-sm">Functional</span>
                                    <span className={cn("text-xs", field.value === "functional" ? "opacity-80" : "text-zinc-400")}>Affects use</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => field.onChange("critical")}
                                    className={cn(
                                        "flex flex-col items-center justify-center p-6 gap-2 rounded-xl border transition-all",
                                        field.value === "critical"
                                            ? "bg-red-600 border-red-600 text-white"
                                            : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400"
                                    )}
                                >
                                    <Ban className="w-6 h-6 mb-1" />
                                    <span className="font-semibold text-sm">Critical</span>
                                    <span className={cn("text-xs", field.value === "critical" ? "opacity-80" : "text-zinc-400")}>Can&apos;t be used</span>
                                </button>

                            </div>
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-xs text-red-500" />}
                        </Field>
                    )}
                />
            </div>

            {/* SECTION: DESCRIPTION */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-400 tracking-widest uppercase">Description</h3>
                <Controller
                    name="description"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid} className="flex flex-col gap-2">
                            <FieldLabel className="text-sm font-medium">What happened?</FieldLabel>
                            <Textarea
                                {...field}
                                placeholder="Describe the damage in detail — what you noticed, when, and how (if known)..."
                                className="w-full min-h-[120px] resize-none bg-white dark:bg-zinc-950"
                            />
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-xs text-red-500" />}
                        </Field>
                    )}
                />

                {/* Photo Dropzone */}
                <Controller
                    name="imageUrl"
                    control={form.control}
                    render={({ field }) => (
                        <Field className="flex flex-col gap-2 pt-2">
                            <FieldLabel className="text-sm font-medium">Photo evidence (optional)</FieldLabel>

                            <div className={field.value ? "hidden" : "block"}>
                                <input
                                    type="file"
                                    id="photo-upload"
                                    className="hidden"
                                    accept="image/*"
                                    disabled={isUploading}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleAssetUpload(file, field.onChange);
                                        e.target.value = '';
                                    }}
                                />
                                <label
                                    htmlFor="photo-upload"
                                    className={cn(
                                        "w-full h-32 rounded-xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer",
                                        "bg-[#fafafa] dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                                        isUploading && "cursor-not-allowed opacity-70"
                                    )}
                                >
                                    {isUploading ? (
                                        <div className="flex flex-col items-center gap-2 w-1/2">
                                            <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                                            <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                                                <div className="bg-zinc-900 dark:bg-zinc-100 h-1.5 rounded-full" style={{ width: `${uploadProgressStatus}%` }} />
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <UploadCloud className="w-5 h-5 text-zinc-400" />
                                            <span className="text-sm text-zinc-500">Drag photos here or <span className="underline underline-offset-2">click to upload</span></span>
                                        </>
                                    )}
                                </label>
                            </div>

                            {/* Image Preview */}
                            {field.value && (
                                <div className="relative w-full sm:w-1/2 aspect-video rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 group">
                                    <Image src={field.value} alt="Damage evidence" fill className="object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Button type="button" variant="destructive" size="sm" className="rounded-full gap-2" onClick={() => field.onChange("")}>
                                            <XIcon className="h-4 w-4" /> Remove
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Field>
                    )}
                />
            </div>

            {/* SECTION: ACCOUNTABILITY & SUBMIT */}
            <div className="space-y-6 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                <h3 className="text-xs font-bold text-zinc-400 tracking-widest uppercase">Accountability</h3>

                <Controller
                    name="certified"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <div className="flex flex-col gap-1">
                            <div className="flex items-start gap-3">
                                <Checkbox
                                    id="certify"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="mt-1"
                                />
                                <label htmlFor="certify" className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed cursor-pointer">
                                    I certify this report is accurate to the best of my knowledge. I understand submitting a false damage report may result in account suspension.
                                </label>
                            </div>
                            {fieldState.invalid && <span className="text-xs text-red-500 ml-7">{fieldState.error?.message}</span>}
                        </div>
                    )}
                />

                <Button type="submit" className="h-11 px-8 rounded-full shadow-sm">
                    Submit Report
                </Button>
            </div>

        </form>
    )
}