"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Clock, Info, CheckCircle2 } from "lucide-react";
import { TIME_SLOTS } from "@/utils/extraUtils";
import { createBookingAction, getDailyBookedSlotsAction } from "@/actions/userActions";

interface BookingWidgetProps {
  equipmentId: string;
  equipmentName: string;
  requiresApproval: boolean;
  bookedSlots?: string[];
}

export default function BookingWidget({
  equipmentId,
  equipmentName,
  requiresApproval,
  // bookedSlots = [] 
}: BookingWidgetProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  console.log(bookedSlots);
  useEffect(() => {
    const fetchSlots = async () => {
      if (!date) return;

      setIsLoadingSlots(true);
      setBookedSlots([]); // Clear previous slots while loading
      setSelectedSlotId(null); // Reset selection

      // Pass the date as an ISO string to avoid Server Action serialization errors
      const result = await getDailyBookedSlotsAction(equipmentId, date.toISOString());

      if (result.success) {
        const formattedSlotIds = result.bookedSlots.map((rawDateStr) => {
          const dateObj = new Date(rawDateStr);
          // Get the hour and pad it with a zero if needed (e.g., 8 becomes "08")
          const hour = dateObj.getHours().toString().padStart(2, '0');
          return `${hour}:00`; // Returns "08:00", "10:00", etc.
        });

        // Save the formatted array instead of the raw one
        setBookedSlots(formattedSlotIds);
      }

      setIsLoadingSlots(false);
    };

    fetchSlots();
  }, [date, equipmentId]);

  const handleCheckout = async () => {
    if (!date || !selectedSlotId) return;
    setIsSubmitting(true);

    const slotData = TIME_SLOTS.find(s => s.id === selectedSlotId);
    if (!slotData) {
      setIsSubmitting(false);
      return;
    }

    // Create precise Date objects for the database
    const startTime = new Date(date);
    startTime.setHours(slotData.startHour, 0, 0, 0);

    const endTime = new Date(date);
    endTime.setHours(slotData.endHour, 0, 0, 0);

    // Call the Server Action
    const result = await createBookingAction({
      equipmentId,
      startTime,
      endTime,
    });

    if (result.success) {
      setIsSuccess(true);
      if (result.status === "approved") {
        toast.success("Booking confirmed! You are all set.");
      } else {
        toast.success("Request sent to admins for approval.");
      }
    } else {
      toast.error(result.error);
    }

    setIsSubmitting(false);
  };

  // Show a success state replacing the widget after a successful booking
  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border rounded-2xl bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30">
        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
        <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Request Submitted</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 text-center max-w-md leading-relaxed">
          {requiresApproval
            ? `Your booking request for the ${equipmentName} has been sent to the lab administrators. You will be notified once it is reviewed.`
            : `Your booking for the ${equipmentName} is confirmed! You can view it in your schedule.`}
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => {
            // Reset to allow another booking
            setIsSuccess(false);
            setSelectedSlotId(null);
            setDate(new Date(date || new Date()));
          }}
        >
          Book another slot
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col xl:flex-row gap-6 p-4 border rounded-2xl bg-zinc-50 dark:bg-zinc-900/40">

      {/* Left: Calendar */}
      <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <h3 className="font-semibold text-sm mb-4 text-zinc-900 dark:text-zinc-100">Select Date</h3>
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => {
              setDate(newDate);
              setSelectedSlotId(null);
            }}
            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            className="rounded-md"
          />
        </div>
      </div>

      {/* Right: Time Slots */}
      <div className="flex-[1.5] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Available Slots
          </h3>
          {date && (
            <span className="text-xs text-zinc-500 font-medium">
              {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
          {TIME_SLOTS.map((slot) => {
            const isBooked = bookedSlots.includes(slot.id);
            const isSelected = selectedSlotId === slot.id;

            return (
              <button
                key={slot.id}
                disabled={isBooked || isLoadingSlots}
                onClick={() => setSelectedSlotId(slot.id)}
                className={`
                flex justify-between items-center px-4 py-3 rounded-lg border text-sm font-medium transition-all
                ${isBooked
                    // 1. BOOKED STATE (Gray & Disabled)
                    ? "bg-zinc-100 dark:bg-zinc-800/50 text-zinc-400 border-zinc-200 dark:border-zinc-800 cursor-not-allowed"

                    : isSelected
                      // 2. SELECTED STATE (Dark / High Contrast)
                      ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-md ring-2 ring-zinc-900/20"

                      // 3. FREE STATE (Green & Available)
                      : "bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/30 hover:border-green-300 dark:hover:border-green-800 cursor-pointer"
                  }
                `}
              >
                <span>{slot.label}</span>
                <span className="text-[10px] uppercase tracking-wider font-bold">
                  {isBooked ? "Reserved" : isSelected ? "Selected" : "Free"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Approval Message */}
        {requiresApproval && (
          <div className="flex items-start gap-2 p-3 mb-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400 text-xs border border-blue-100 dark:border-blue-900/30 mt-auto">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>This equipment requires admin approval. Requests are reviewed within 24 hours.</p>
          </div>
        )}

        <Button
          onClick={handleCheckout}
          disabled={!date || !selectedSlotId || isSubmitting}
          className={`w-full h-12 text-sm font-semibold transition-all mt-auto ${selectedSlotId
            ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md hover:shadow-lg"
            : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500"
            }`}
        >
          {isSubmitting
            ? "Processing Request..."
            : selectedSlotId
              ? `Request Checkout (${TIME_SLOTS.find(s => s.id === selectedSlotId)?.label})`
              : "Select a time slot to continue"}
        </Button>
      </div>
    </div>
  );
}