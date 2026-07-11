import { getEquipmentDetailsById } from "@/actions/userActions";
import BookingWidget from "@/components/equipment/BookingWidget";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Camera, Info } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EquipmentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  
  // Fetch the equipment
  const data = await getEquipmentDetailsById(id);
  
  // If the array is empty, the equipment doesn't exist
  if (!data || data.length === 0) {
    notFound(); 
  }
  
  const equipment = data[0];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link 
            href="/" 
            className="p-2 mt-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {equipment.name}
            </h1>
            <p className="text-sm text-zinc-500 font-medium mt-1">
              {equipment.internalTag || "No Tag"}
            </p>
          </div>
        </div>
        
        {/* Top Right Status Badge */}
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
            equipment.equipmentStatus === 'active' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {equipment.equipmentStatus === 'active' ? "Available now" : equipment.equipmentStatus}
          </span>
        </div>
      </div>

      {/* 2. Hero Image Showcase */}
      <div className="w-full h-64 md:h-40 lg:h-46 bg-zinc-100 dark:bg-zinc-800/40 rounded-2xl flex items-center justify-center relative overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-inner">
        {equipment.imageUrl ? (
          <Image 
            src={equipment.imageUrl} 
            alt={equipment.name} 
            fill 
            className="object-contain p-8 drop-shadow-xl"
            priority 
          />
        ) : (
          <div className="flex flex-col items-center text-zinc-400">
            <Camera className="w-16 h-16 mb-2 opacity-50" strokeWidth={1} />
            <p className="text-sm font-medium">No image available</p>
          </div>
        )}
      </div>

      {/* 3. Equipment Details Card */}
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 bg-white dark:bg-zinc-900 shadow-sm">
        <h3 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100 mb-6">
          <Info className="w-5 h-5 text-zinc-400" /> Equipment details
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4 mb-8">
          {/* Category */}
          <div>
            <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold mb-1">Category</p>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{equipment.category}</p>
          </div>
          
          {/* Condition */}
          <div>
            <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold mb-1">Condition</p>
            <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-50 dark:bg-green-900/20 dark:text-green-400 border-none shadow-none">
              {equipment.equipmentCondition || "Excellent"}
            </Badge>
          </div>
          
          {/* Max Checkout */}
          <div>
            <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold mb-1">Max Checkout</p>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{equipment.maxCheckOutDays || 3} days</p>
          </div>
          
          {/* Requires Approval */}
          <div>
            <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold mb-1">Requires Approval</p>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {equipment.requireApproval ? "Yes — Admin" : "No — Auto-approve"}
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
          <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold mb-2">Description</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-4xl">
            {equipment.description || "No description provided for this equipment."}
          </p>
        </div>
      </div>

      {/* 4. The Booking Widget */}
      <div className="pt-4">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Availability</h2>
        <BookingWidget 
          equipmentId={equipment.id} 
          equipmentName={equipment.name}
          requiresApproval={equipment.requireApproval ?? true} 
          // bookedSlots={[]}
        />
      </div>
      
    </div>
  );
}