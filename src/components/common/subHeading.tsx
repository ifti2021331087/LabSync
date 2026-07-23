import React from 'react'

export default function SubHeading({subHeading}:{subHeading:string}) {
    return (
        <p className="text-sm text-zinc-500 font-mono tracking-tight">
            {subHeading}
        </p>
    )
}
