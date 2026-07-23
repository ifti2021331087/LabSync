"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Clock, Info, CheckCircle2, CalendarDays, ArrowRight } from "lucide-react";
import { TIME_SLOTS } from "@/utils/extraUtils";
import { createBookingAction, getDailyBookedSlotsAction } from "@/actions/userActions";

interface BookingWidgetProps {
  equipmentId: string;
  equipmentName: string;
  requiresApproval: boolean;
  maxCheckOutDays: number;
}

export default function BookingWidget({
  equipmentId,
  equipmentName,
  requiresApproval,
  maxCheckOutDays
}: BookingWidgetProps) {
  const [date, setDate] = useState<Date | undefined>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + maxCheckOutDays);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!date) return;

      setIsLoadingSlots(true);
      setBookedSlots([]); 
      setSelectedSlotId(null); 

      const fetchDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
      const result = await getDailyBookedSlotsAction(equipmentId, fetchDate.toISOString());

      if (result.success) {
        setBookedSlots(result.bookedSlots || []);
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

    const startTime = new Date(date);
    startTime.setHours(slotData.startHour, 0, 0, 0);

    const endTime = new Date(date);
    endTime.setHours(slotData.endHour, 0, 0, 0);

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
      toast.error(result.error || "Failed to create booking.");
    }

    setIsSubmitting(false);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border rounded-2xl bg-gradient-to-b from-green-50/50 to-green-100/30 dark:from-green-900/10 dark:to-green-900/5 border-green-200 dark:border-green-900/30 shadow-sm animate-in fade-in zoom-in-95 duration-500 ease-out">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400 animate-in zoom-in duration-500 delay-150" />
        </div>
        <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Request Submitted</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-3 text-center max-w-md leading-relaxed">
          {requiresApproval
            ? `Your booking request for the ${equipmentName} has been sent to the lab administrators. You will be notified once it is reviewed.`
            : `Your booking for the ${equipmentName} is confirmed! You can view it in your schedule.`}
        </p>
        <Button
          variant="outline"
          className="mt-8 rounded-full px-6 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 transition-colors"
          onClick={() => {
            setIsSuccess(false);
            setSelectedSlotId(null);
            setDate(new Date()); 
          }}
        >
          Book another slot
        </Button>
      </div>
    )
  }

  const isSelectedDateToday = date && date.toDateString() === new Date().toDateString();
  const currentHour = new Date().getHours();

  return (
    <div className="flex flex-col xl:flex-row gap-6 p-5 border rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/20 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">

      {/* Left: Calendar */}
      <div className="flex-1 flex flex-col bg-white dark:bg-zinc-950 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <h3 className="font-semibold text-sm mb-5 text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-zinc-500" /> Select Date
        </h3>
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => {
              if (newDate) {
                setDate(newDate);
                setSelectedSlotId(null);
              }
            }}
            disabled={(d) => d < today || d > maxDate}
            className="rounded-lg w-full bg-transparent"
          />
        </div>
      </div>

      {/* Right: Time Slots */}
      <div className="flex-[1.5] flex flex-col pt-2 xl:pt-0">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-zinc-500" /> Available Slots
          </h3>
          {date && (
            <span className="text-xs px-2.5 py-1 bg-zinc-200/50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-medium rounded-full">
              {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>

        {isLoadingSlots ? (
          /* Animated Skeleton Loader */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
             {TIME_SLOTS.map((slot) => (
                <div key={`skeleton-${slot.id}`} className="h-[52px] bg-zinc-200/60 dark:bg-zinc-800/60 rounded-xl animate-pulse"></div>
             ))}
          </div>
        ) : (
          /* Actual Time Slots */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {TIME_SLOTS.map((slot) => {
              const isBooked = bookedSlots.includes(slot.id);
              const isSelected = selectedSlotId === slot.id;
              const isPastSlot = isSelectedDateToday && slot.startHour <= currentHour;
              const isDisabled = isBooked || isPastSlot;

              return (
                <button
                  key={slot.id}
                  disabled={isDisabled}
                  onClick={() => setSelectedSlotId(slot.id)}
                  className={`
                  relative flex justify-between items-center px-4 py-3.5 rounded-xl border text-sm font-medium transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500
                  ${isDisabled
                      // DISABLED STATE
                      ? "bg-zinc-100 dark:bg-zinc-800/40 text-zinc-400 border-zinc-200 dark:border-zinc-800 cursor-not-allowed opacity-70"
                      : isSelected
                        // SELECTED STATE (Popped out, Glowing)
                        ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-md ring-2 ring-zinc-900 dark:ring-zinc-100 ring-offset-2 dark:ring-offset-zinc-950 scale-[1.02]"
                        // FREE STATE (Interactive)
                        : "bg-white dark:bg-zinc-900/50 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 hover:text-emerald-700 dark:hover:text-emerald-400 hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0 active:scale-[0.98] cursor-pointer"
                    }
                  `}
                >
                  <span>{slot.label}</span>
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md ${
                    isBooked ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400" :
                    isPastSlot ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400" :
                    isSelected ? "bg-white/20 dark:bg-black/10 text-white dark:text-zinc-900" :
                    "bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                  }`}>
                    {isBooked ? "Reserved" : isPastSlot ? "Passed" : isSelected ? "Selected" : "Free"}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Dynamic Approval Message */}
        <div className={`transition-all duration-300 overflow-hidden ${requiresApproval ? "max-h-20 opacity-100 mb-6" : "max-h-0 opacity-0 mb-0"}`}>
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-900/10 text-amber-800 dark:text-amber-400 text-xs border border-amber-200/50 dark:border-amber-900/30 mt-auto shadow-sm">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-500" />
            <p className="leading-relaxed font-medium">This equipment requires admin approval. Requests are generally reviewed within 24 hours.</p>
          </div>
        </div>

        <Button
          onClick={handleCheckout}
          disabled={!date || !selectedSlotId || isSubmitting}
          className={`cursor-pointer w-full h-12 text-sm font-semibold transition-all duration-300 mt-auto rounded-xl flex items-center justify-center gap-2
            ${selectedSlotId && !isSubmitting
            ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg active:scale-[0.98]"
            : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
            }`}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2 animate-pulse">
               Processing Request...
            </span>
          ) : selectedSlotId ? (
            <>
              Request Checkout ({TIME_SLOTS.find(s => s.id === selectedSlotId)?.label}) 
              <ArrowRight className="w-4 h-4 ml-1" />
            </>
          ) : (
            "Select a time slot to continue"
          )}
        </Button>
      </div>
    </div>
  );
}