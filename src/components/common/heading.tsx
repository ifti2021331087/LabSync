
import React from 'react'

export default function Heading({heading}:{heading:string}) {
  return (
    <h1 className="text-md md:text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">{heading}</h1>
  )
}
