

import { Camera } from 'lucide-react';
import Image from 'next/image'
import React from 'react'
import {formatDateTimeForPendingRequest} from '../../utils/simpleFunctions'
interface pendingRequestsProps {
  equipmentName: string | null;
  image: string | null;
  startTime: Date;
  endTime: Date;
  status:string
}
export default function RequestCard({ request }: { request: pendingRequestsProps }) {
  const { equipmentName, image, startTime, endTime,status } = request;
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
          {status}
        </span>
      </div>

    </div>
  )
}
