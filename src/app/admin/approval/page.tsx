import { pendingBookingAction } from '@/actions/adminActions'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { formatBookingSlot } from '@/utils/simpleFunctions';
import React from 'react';
import BookingActionsDropdown from '@/components/admin/BookingActionsDropdown';
import { CheckCircle2, PackageOpen } from 'lucide-react';

// Import your new interactive client component

export default async function ApprovalPage() {
  // Safe to use await here because this is a Server Component!
  const pendingBookings = await pendingBookingAction();

  return (
    <div>
      <h1 className='font-bold text-lg mb-4'>Pending Bookings</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Equipment</TableHead>
            <TableHead>Time Slot</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {
            pendingBookings.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="h-[60vh]">
                  <div className="flex flex-col items-center justify-center min-h-[60vh] w-full p-8 mt-6 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/10">
                    <div className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                      No Pending request found
                    </h3>
                  </div>
                </TableCell>
              </TableRow>
            )
          }
          {
            pendingBookings.map((booking) => {
              const timeSlot = formatBookingSlot(booking.startTime, booking.endTime);
              return (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.userName}</TableCell>
                  <TableCell>
                    <div className='flex flex-col'>
                      <h1>{booking.equipmentName}</h1>
                      <div className='flex gap-2 mt-1'>
                        <Label className="text-xs text-zinc-500">{booking.equipmentCategory}</Label>
                        {booking.equipmentTag && <Label className="text-xs text-zinc-500">• {booking.equipmentTag}</Label>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{timeSlot}</TableCell>
                  <TableCell className="font-medium capitalize">{booking.status}</TableCell>
                  <TableCell className="text-right">

                    {/* 👇 Drop your Client Component in here! 👇 */}
                    <BookingActionsDropdown bookingId={booking.id} />

                  </TableCell>
                </TableRow>
              )
            })
          }
        </TableBody>
      </Table>
    </div>
  )
}