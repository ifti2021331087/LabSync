"use client"

import React, { useState } from 'react'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from '../ui/field'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Loader2, Plus, UploadCloud, XIcon } from 'lucide-react'
import { CldUploadWidget } from 'next-cloudinary'
import { Controller, useForm } from 'react-hook-form'
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from '../ui/input-group'
import { equipmentSchema } from '../schama/equipment'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from '../ui/select';
import { EquipmentCategories } from '@/utils/extraUtils';
import { equipmentConditionEnum, equipmentStatusEnum } from '@/utils/extraForSchema';
import { Switch } from '../ui/switch';
import Image from 'next/image';
import { uploadEquipmentAction } from '@/actions/adminActions'
import { toast } from 'sonner'

type equipmentSchemaValues = z.infer<typeof equipmentSchema>;

export default function UploadEquipmentForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgressStatus, setUploadProgressStatus] = useState(0);

    const form = useForm<equipmentSchemaValues>({
        resolver: zodResolver(equipmentSchema) as unknown as undefined,
        defaultValues: {
            title: "",
            category: "",
            internalTag: "",
            description: "",
            imageUrl: "",
            requireApproval: true,
            equipmentCondition: "excellent",
            equipmentStatus: "active"
        },
    })

    const formData = new FormData();
    async function onSubmit(data: equipmentSchemaValues) {
        try {
            // Pass the 'data' object directly to the server action
            const result = await uploadEquipmentAction(data);
            
            if (result.success) {
                toast.success("Equipment uploaded successfully.");
                form.reset(); 
                setIsOpen(false);
            } else {
                toast.error(result.error || "Failed to upload equipment.");
            }
        }
        catch (e) {
            console.log(e);
            toast.error("Unexpected error while uploading equipment.");
        }
    }

    async function getCloudinarySignature(folder: string) {
        const response = await fetch("/api/sign-cloudinary-params", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                paramsToSign: { folder }
            })
        })
        if (!response.ok) {
            throw new Error("Failed to create cloudinary signature");
        }
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
            xhr.open(
                "POST",
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`
            );

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const progress = Math.round((event.loaded / event.total) * 100);
                    setUploadProgressStatus(progress);
                }
            }
            const cloudinaryPromise = new Promise<{ secure_url: string }>((resolve, reject) => {
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(JSON.parse(xhr.responseText))
                    }
                    else {
                        reject(new Error("Network Error"))
                    }
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
        <Dialog dismissible={false} open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger render={<Button variant="outline" className="shadow-xs font-medium gap-2"><Plus className="w-4 h-4" /> Upload equipment</Button>} />
            <DialogContent className="sm:max-w-2xl lg:max-w-3xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto duration-200">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight">Add new equipment</DialogTitle>
                    <DialogDescription className="text-zinc-500 dark:text-zinc-400">
                        Fill out the details below to add an asset to the inventory registry.
                    </DialogDescription>
                </DialogHeader>
                <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">

                        {/* Title - Full Width */}
                        <div className="md:col-span-2">
                            <Controller
                                name="title"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid} className="flex flex-col gap-1.5">
                                        <FieldLabel htmlFor="form-rhf-demo-title" className="font-semibold text-zinc-900 dark:text-zinc-200 text-sm">
                                            Title
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="form-rhf-demo-title"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="e.g., Sony Alpha a7 IV Mirrorless Camera"
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

                        {/* Category - Left Column (Stacked Layout) */}
                        <div className="md:col-span-1">
                            <Controller
                                name="category"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid} className="flex flex-col gap-1.5">
                                        <FieldLabel htmlFor="form-rhf-select-category" className="font-semibold text-zinc-900 dark:text-zinc-200 text-sm">
                                            Equipment Category
                                        </FieldLabel>

                                        <Select
                                            name={field.name}
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger
                                                id="form-rhf-select-category"
                                                aria-invalid={fieldState.invalid}
                                                className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 text-sm focus:ring-2 focus:ring-blue-500 text-left"
                                            >
                                                <SelectValue placeholder="Select classification" />
                                            </SelectTrigger>
                                            <SelectContent alignItemWithTrigger className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-popover shadow-md">
                                                {EquipmentCategories.map((category) => (
                                                    <SelectItem key={category.value} value={category.value} className="text-sm rounded-md cursor-pointer">
                                                        {category.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} className="text-xs text-red-500 mt-1" />
                                        )}
                                    </Field>
                                )}
                            />
                        </div>

                        {/* Internal Tag - Right Column */}
                        <div className="md:col-span-1">
                            <Controller
                                name="internalTag"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid} className="flex flex-col gap-1.5">
                                        <FieldLabel htmlFor="form-rhf-demo-internalTag" className="font-semibold text-zinc-900 dark:text-zinc-200 text-sm">
                                            Internal Tag
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="form-rhf-demo-internalTag"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="e.g., CAM-0042-A"
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

                        {/* Description - Full Width */}
                        <div className="md:col-span-2">
                            <Controller
                                name="description"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid} className="flex flex-col gap-1.5">
                                        <FieldLabel htmlFor="form-rhf-textarea-description" className="font-semibold text-zinc-900 dark:text-zinc-200 text-sm">Description</FieldLabel>
                                        <Textarea
                                            {...field}
                                            id="form-rhf-textarea-description"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Provide descriptive inventory details, serial numbers, or notable accessories included..."
                                            className="w-full min-h-[60px] p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus-visible:ring-2 focus-visible:ring-blue-500 transition-shadow resize-none"
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-xs text-red-500 mt-1" />}
                                    </Field>
                                )}
                            />
                        </div>

                        {/* Image Attachment Dropzone - Full Width */}
                        <div className="md:col-span-2">
                            <Controller
                                name="imageUrl"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid} className="w-full flex flex-col gap-1.5">
                                        <FieldLabel className="font-semibold text-zinc-900 dark:text-zinc-200 text-sm">
                                            Equipment Asset Media
                                        </FieldLabel>

                                        <div className={field.value ? "hidden" : "block"}>
                                            <input
                                                type="file"
                                                id="native-file-upload"
                                                className="hidden"
                                                accept="image/*"
                                                disabled={isUploading}
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;

                                                    handleAssetUpload(file, field.onChange);
                                                    e.target.value = ''; // Reset input
                                                }}
                                            />

                                            <label
                                                htmlFor="native-file-upload"
                                                className={`w-full border-2 border-dashed rounded-xl p-3 sm:p-5 flex flex-col items-center justify-center gap-3 transition-all group ${isUploading
                                                        ? 'border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/50 cursor-not-allowed'
                                                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 hover:bg-blue-50/20 dark:bg-zinc-900/10 dark:hover:bg-blue-900/5 hover:border-blue-500 dark:hover:border-blue-500 cursor-pointer'
                                                    }`}
                                            >
                                                <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-950/50 group-hover:text-blue-600 transition-all">
                                                    {isUploading ? (
                                                        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                                                    ) : (
                                                        <UploadCloud className="w-5 h-5" />
                                                    )}
                                                </div>

                                                <div className="text-center w-full max-w-[250px]">
                                                    {isUploading ? (
                                                        <div className="space-y-3 mt-1">
                                                            <div className="flex justify-between items-center text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                                                <span>Uploading...</span>
                                                                <span>{uploadProgressStatus}%</span>
                                                            </div>
                                                            <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                                                                <div
                                                                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-300 ease-out"
                                                                    style={{ width: `${uploadProgressStatus}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Click to upload an asset image</p>
                                                            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Supports JPG, PNG and GIF (Max 10MB)</p>
                                                        </>
                                                    )}
                                                </div>
                                            </label>
                                        </div>

                                        {/* Image Preview Area */}
                                        {field.value && (
                                            <div className="relative w-full aspect-video sm:max-h-[300px] rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 group">
                                                <Image
                                                    src={field.value}
                                                    alt="Uploaded screenshot"
                                                    fill
                                                    className="object-contain p-2"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-xs">
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        className="rounded-full shadow-lg gap-2 h-9 text-xs"
                                                        onClick={() => field.onChange("")}
                                                    >
                                                        <XIcon className="h-3.5 w-3.5" /> Remove Image
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} className="text-xs text-red-500 mt-1" />
                                        )}
                                    </Field>
                                )}
                            />
                        </div>

                        {/* Condition - Left Column */}
                        <div className="md:col-span-1">
                            <Controller
                                name="equipmentCondition"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field
                                        orientation="responsive"
                                        data-invalid={fieldState.invalid}
                                        className="flex flex-col gap-1.5"
                                    >
                                        <FieldContent className="flex flex-col gap-0.5">
                                            <FieldLabel htmlFor="form-rhf-select-condition" className="font-semibold text-zinc-900 dark:text-zinc-200 text-sm">
                                                Equipment Condition
                                            </FieldLabel>
                                            {fieldState.invalid && (
                                                <FieldError errors={[fieldState.error]} className="text-xs text-red-500 mt-1" />
                                            )}
                                        </FieldContent>
                                        <Select
                                            name={field.name}
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger
                                                id="form-rhf-select-condition"
                                                aria-invalid={fieldState.invalid}
                                                className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 text-sm focus:ring-2 focus:ring-blue-500 text-left"
                                            >
                                                <SelectValue placeholder="Select condition" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-popover shadow-md">
                                                {equipmentConditionEnum.enumValues.map((condition) => (
                                                    <SelectItem key={condition} value={condition} className="text-sm rounded-md cursor-pointer">
                                                        {condition.charAt(0).toUpperCase() + condition.slice(1)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                )}
                            />
                        </div>

                        {/* Status - Right Column */}
                        <div className="md:col-span-1">
                            <Controller
                                name="equipmentStatus"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field
                                        orientation="responsive"
                                        data-invalid={fieldState.invalid}
                                        className="flex flex-col gap-1.5"
                                    >
                                        <FieldContent className="flex flex-col gap-0.5">
                                            <FieldLabel htmlFor="form-rhf-select-status" className="font-semibold text-zinc-900 dark:text-zinc-200 text-sm">
                                                Equipment Status
                                            </FieldLabel>
                                            {fieldState.invalid && (
                                                <FieldError errors={[fieldState.error]} className="text-xs text-red-500 mt-1" />
                                            )}
                                        </FieldContent>
                                        <Select
                                            name={field.name}
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger
                                                id="form-rhf-select-status"
                                                aria-invalid={fieldState.invalid}
                                                className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 text-sm focus:ring-2 focus:ring-blue-500 text-left"
                                            >
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-popover shadow-md">
                                                {equipmentStatusEnum.enumValues.map((status) => (
                                                    <SelectItem key={status} value={status} className="text-sm rounded-md cursor-pointer">
                                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                )}
                            />
                        </div>

                        {/* Max Check Out Days - Left Column */}
                        <div className="md:col-span-1">
                            <Controller
                                name="maxCheckOutDays"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid} className="flex flex-col gap-1.5">
                                        <FieldLabel htmlFor="form-rhf-demo-maxCheckOutDays" className="font-semibold text-zinc-900 dark:text-zinc-200 text-sm">
                                            Max Checkout Duration (Days)
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="form-rhf-demo-maxCheckOutDays"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="e.g., 3"
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

                        {/* Require Approval Switch - Right Column / Row-aligned */}
                        <div className="md:col-span-1 flex items-center h-full pt-2 sm:pt-6">
                            <Controller
                                name="requireApproval"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field orientation="horizontal" data-invalid={fieldState.invalid} className="flex items-center justify-between w-full p-3 rounded-xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50/40 dark:bg-zinc-900/10">
                                        <FieldContent className="flex flex-col gap-0.5">
                                            <FieldLabel htmlFor="form-rhf-switch-requireApproval" className="font-semibold text-zinc-900 dark:text-zinc-200 text-sm cursor-pointer">
                                                Require Administrative Approval
                                            </FieldLabel>
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-xs text-red-500 mt-1" />}
                                        </FieldContent>
                                        <Switch
                                            id="form-rhf-switch-requireApproval"
                                            name={field.name}
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            aria-invalid={fieldState.invalid}
                                        />
                                    </Field>
                                )}
                            />
                        </div>

                    </FieldGroup>

                    <DialogFooter className="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-900 gap-2">
                        <DialogClose render={<Button type="button" variant="outline" className="h-10 rounded-lg px-4 text-sm font-medium">Cancel</Button>} />
                        <Button type="submit" className="h-10 rounded-lg px-5 text-sm font-medium shadow-xs">Save changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}