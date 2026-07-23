import ReportDamageForm from '@/components/forms/ReportDamageForm'
import { Check, Info } from 'lucide-react'
import React from 'react'

export default function ReportDamage() {
  return (
    <div className="max-w-7xl w-full mx-auto p-2 lg:p-4 flex flex-col lg:flex-row gap-6 lg:gap-8">

      <div className="bg-background/90 p-8 w-full lg:flex-1">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-white">Report Damage</h1>
          <p className="text-sm text-zinc-500 font-mono uppercase tracking-tight">
            Let us know about equipment issues immediately
          </p>
        </div>
        
        <div className="mt-4 bg-[#eff6ff] dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 p-4 rounded-lg flex items-center gap-3 text-sm font-medium border border-blue-100 dark:border-blue-900/50">
          <Info className="w-5 h-5 shrink-0" />
          <p>Report damage as soon as you notice it — even if you didn&apos;t cause it.</p>
        </div>
        
        <div className="w-full mt-6">
          <ReportDamageForm />
        </div>
      </div>

      {/* Sidebar Area */}
      {/* 3. Changed max-w-2/8 to w-full for mobile, and lg:w-[320px] for desktop */}
      <div className="hidden lg:block w-full lg:max-w-2/8 shrink-0">
        
        <div className="flex flex-col gap-6 sticky top-6">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <h4 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2 mb-4">
              <Info className="w-4 h-4 text-zinc-400" /> Why report promptly?
            </h4>
            <ul className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
              <li className="flex gap-3">
                <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <span>Protects you from being held liable for damage you didn&apos;t cause.</span>
              </li>
              <li className="flex gap-3">
                <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <span>Lets the admin take equipment out of rotation before another student is affected.</span>
              </li>
              <li className="flex gap-3">
                <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <span>Accurate condition history is critical for insurance claims.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <h4 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2 mb-3">
              Emergency contact
            </h4>
            <p className="text-xs text-zinc-500 mb-1">For critical damage or loss:</p>
            <p className="text-lg font-bold text-zinc-900 dark:text-white mb-1">ext. 4800</p>
            <p className="text-xs text-zinc-400">Media Center front desk · 8am-10pm</p>
          </div>
        </div>

      </div>
    </div>
  )
}