"use client";

import React, { useState } from "react";
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontalIcon } from 'lucide-react';
import { toast } from "sonner";
import { togglePendingStatus } from "@/actions/adminActions";
// Import your server action that updates the database here!
// import { reviewBookingAction } from "@/actions/adminActions"; 

export default function BookingActionsDropdown({ bookingId }: { bookingId: string }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePendingRequest = async (status: "approved" | "denied") => {
    setIsProcessing(true);
    
    // Call your server action here
    const result = await togglePendingStatus(bookingId, status);
    
    // Example placeholder:
    console.log(`Updating booking ${bookingId} to ${status}`);
    toast.success(`Booking ${status}`);
    
    setIsProcessing(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger >
        <Button variant="ghost" size="icon" className="size-8" disabled={isProcessing}>
          <MoreHorizontalIcon />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem >
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white w-full cursor-pointer"
            onClick={() => handlePendingRequest("approved")}
          >
            Approve
          </Button>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Button
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 w-full cursor-pointer"
            onClick={() => handlePendingRequest("denied")}
          >
            Deny
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}