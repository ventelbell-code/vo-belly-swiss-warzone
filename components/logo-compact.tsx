"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

interface LogoCompactProps {
  className?: string
}

export function LogoCompact({ className }: LogoCompactProps) {
  return (
    <div className={cn("select-none w-36 relative", className)}>
      <Image
        src="/logo-transparent.png"
        alt="BELLYSWISS WARZONE"
        width={200}
        height={100}
        className="w-full h-auto object-contain"
        priority
      />
    </div>
  )
}
