"use client";

import { Camera, Trash2Icon } from 'lucide-react';
import Image from 'next/image'
import React, { useState } from 'react' // 1. Import useState
import { formatDateTimeForPendingRequest } from '../../utils/simpleFunctions'
import { togglePendingRequestAction } from '@/actions/userActions';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

interface pendingRequestsProps {
  id: string,
  equipmentName: string | null;
  image: string | null;
  startTime: Date;
  endTime: Date;
}

export default function PendingRequestCard({ request }: { request: pendingRequestsProps }) {
  const { equipmentName, image, startTime, endTime } = request;
  
  // 2. Define state for the dialog and loading status
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleCancelRequest = async (e: React.MouseEvent, id: string) => {
    // Prevent the dialog from closing immediately on click
    e.preventDefault(); 
    setIsPending(true);

    try {
      const data = await togglePendingRequestAction(id);
      
      if (data?.success) {
        toast.success("Pending request cancelled successfully.");
        setIsOpen(false); // Explicitly close the dialog on success
      } else {
        toast.error("Unexpected error while toggling the request.");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-2xl shadow-sm w-full">

      {/* Left Side: Image & Text info */}
      <div className="flex items-center gap-4">
        {/* Image Container */}
        <div className="relative w-16 h-16 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center overflow-hidden flex-shrink-0">
          {image ? (
            <Image
              src={image}
              alt={equipmentName || "equipment image"}
              fill
              className="object-contain p-2"
            />
          ) : (
            <Camera className="w-6 h-6 text-zinc-400 dark:text-zinc-600" />
          )}
        </div>

        {/* Text Container */}
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
            {equipmentName || "Unnamed Equipment"}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            {formatDateTimeForPendingRequest(new Date(startTime), new Date(endTime))}
          </p>
        </div>
      </div>

      {/* Right Side: Status Badge & Cancel Action */}
      <div className="flex flex-col gap-3">
        {/* Pending Badge */}
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30">
          Pending
        </span>

        {/* Cancel Button */}
        {/* 3. Bind the open state to the AlertDialog */}
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
          <AlertDialogTrigger
            render={<Button variant="destructive" className="text-xs font-bold text-red-800 dark:text-red-400 hover:underline transition-all cursor-pointer">Cancel</Button>}
          />
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                <Trash2Icon />
              </AlertDialogMedia>
              <AlertDialogTitle>Cancel request</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this request.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel variant="outline" disabled={isPending}>Skip</AlertDialogCancel>
              
              {/* 4. Pass the event to the handler and disable while pending */}
              <AlertDialogAction 
                variant="destructive"
                disabled={isPending}
                onClick={(e) => handleCancelRequest(e, request.id)}
              >
                {isPending ? "Cancelling..." : "Cancel"}
              </AlertDialogAction>
              
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

    </div>
  )
}