import { getUserAllCompletedCheckoutsAction, getUserDamageReportsAction } from '@/actions/userActions'
import { formatCheckoutTime } from '@/utils/simpleFunctions';
import { HistoryIcon } from 'lucide-react';
import Image from 'next/image';
import React from 'react'

export default async function History() {
  const checkoutList = await getUserAllCompletedCheckoutsAction();
  
  // FIX: Use .filter() instead of .map() to get the actual count of late returns
  const lateReturnCount = checkoutList.filter((checkout) => (checkout as { status?: string }).status === 'late').length;
  
  const totalReports = await getUserDamageReportsAction();
  // Ensure totalReports is a number (some implementations may return an array)
  const totalReportsCount = Array.isArray(totalReports) ? totalReports.length : (typeof totalReports === 'number' ? totalReports : 0);

  return (
    <div className="w-full max-w-8xl mx-auto space-y-8">
      
      {/* Header Section */}
      <div>
        <h1 className="text-md md:text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
          History
        </h1>
        <p className="text-sm text-zinc-500 font-mono tracking-tight mt-1.5">
          Completed checkouts — all time
        </p>
      </div>

      {/* Summary Cards (Responsive Grid) */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6'>
        
        {/* Card 1: Completed */}
        <div className='flex flex-col items-center justify-center py-8 px-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm transition-shadow hover:shadow-md'>
          <span className='text-3xl font-bold text-zinc-900 dark:text-zinc-100'>
            {checkoutList.length}
          </span>
          <span className="text-xs font-medium text-zinc-500 mt-2 uppercase tracking-wider">
            Completed
          </span>
        </div>

        {/* Card 2: Late Returns */}
        <div className='flex flex-col items-center justify-center py-8 px-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm transition-shadow hover:shadow-md'>
          <span className={`text-3xl font-bold ${lateReturnCount > 0 ? 'text-amber-600 dark:text-amber-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
            {lateReturnCount}
          </span>
          <span className="text-xs font-medium text-zinc-500 mt-2 uppercase tracking-wider">
            Late returns
          </span>
        </div>

        {/* Card 3: Damage Reports */}
        <div className='flex flex-col items-center justify-center py-8 px-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm transition-shadow hover:shadow-md'>
          <span className={`text-3xl font-bold ${totalReportsCount > 0 ? 'text-red-600 dark:text-red-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
            {totalReportsCount}
          </span>
          <span className="text-xs font-medium text-zinc-500 mt-2 uppercase tracking-wider">
            Damage reports
          </span>
        </div>

      </div>

      {/* Past Checkouts List */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        
        {/* Section Header */}
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/40">
          <HistoryIcon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Past checkouts</h3>
        </div>

        {/* List Container */}
        <div className="flex flex-col">
          {checkoutList.length > 0 ? (
            checkoutList.map((checkout) => (
              <div
                key={checkout.id}
                // flex-col on mobile, flex-row on larger screens
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 border-b last:border-b-0 border-zinc-100 dark:border-zinc-800/60 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors"
              >
                {/* Left: Image & Details */}
                <div className="flex items-center gap-4 min-w-0">
                  {/* Equipment Thumbnail */}
                  <div className="w-12 h-12 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden relative shrink-0 flex items-center justify-center shadow-sm">
                    {checkout.imageUrl ? (
                      <Image
                        src={checkout.imageUrl}
                        alt="Equipment"
                        fill
                        className="object-contain p-1"
                      />
                    ) : (
                      <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">No Img</span>
                    )}
                  </div>

                  {/* Title and Time/Location Info */}
                  <div className="flex flex-col gap-1 min-w-0">
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {checkout.equipmentName || "Unknown Equipment"}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                      {formatCheckoutTime(checkout.startTime, checkout.endTime)}
                    </p>
                  </div>
                </div>

                {/* Right: Status Badge */}
                {/* Aligns to left (indented) on mobile, pushes to right on desktop */}
                <div className="shrink-0 ml-16 sm:ml-4 flex items-center self-start sm:self-auto">
                  {checkout.status === 'late' ? (
                    <span className="inline-flex items-center justify-center px-2.5 py-1 text-[11px] font-semibold rounded-md bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
                      Late return
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center px-2.5 py-1 text-[11px] font-semibold rounded-md bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                      Returned
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            
            // Empty State
            <div className="px-5 py-12 text-center flex flex-col items-center justify-center gap-2">
              <HistoryIcon className="w-8 h-8 text-zinc-300 dark:text-zinc-700" />
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">No past checkouts</p>
              <p className="text-xs text-zinc-500 max-w-sm">When you complete an equipment checkout, it will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}