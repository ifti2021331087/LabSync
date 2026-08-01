import Image from "next/image";
import { Card } from "../ui/card";
import { Camera } from "lucide-react";
import { checkEquipmentInUseAction } from "@/actions/adminActions"; // <-- Make sure this path is correct for your app

interface equipmentProps {
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
}

export default async function AdminEquipmentCard({ equipment }: { equipment: equipmentProps }) {
    
    // Call the dedicated server action to check if it's currently booked
    const statusData = await checkEquipmentInUseAction(equipment.id);
    const isCurrentlyBooked = statusData?.inUse || false; // Fallback to false if undefined

    return (
        <Card className="flex flex-col p-3 shadow-sm hover:shadow-md transition-shadow border-zinc-200 dark:border-zinc-800 rounded-xl">

            {/* 1. Image / Icon Area (Light Gray Box) */}
            <div className="relative w-full h-32 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg flex items-center justify-center overflow-hidden mb-3">
                {equipment.imageUrl ? (
                    <Image
                        src={equipment.imageUrl}
                        alt={equipment.name}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <Camera className="w-8 h-8 text-zinc-300 dark:text-zinc-600" strokeWidth={1.5} />
                )}
            </div>

            {/* 2. Main Info Area */}
            <div className="flex flex-col gap-1 mb-3">
                <div className="flex justify-between items-start gap-2">
                    <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                        {equipment.name}
                    </h3>

                    {/* Dynamic Status Badge */}
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded flex-shrink-0 capitalize ${
                        equipment.equipmentStatus === 'active'
                        ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400'
                        : equipment.equipmentStatus === 'maintenance'
                            ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                            : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400'
                        }`}>
                        {isCurrentlyBooked ? "In Use" : equipment.equipmentStatus === 'active' ? 'Available' : equipment.equipmentStatus}
                    </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    {equipment.category} • {equipment.internalTag || '#TAG-000'}
                </p>
            </div>
        </Card>
    );
}