"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

interface AnimatedLogoProps {
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
}

export function AnimatedLogo({ className, size = "md" }: AnimatedLogoProps) {
  const sizeClasses = {
    sm: "w-32 sm:w-40",
    md: "w-40 sm:w-56",
    lg: "w-56 sm:w-72",
    xl: "w-64 sm:w-80",
  }

  return (
    <div className={cn("relative select-none", sizeClasses[size], className)}>
      {/* Main logo image - clean, solid, premium */}
      <Image
        src="/logo-transparent.png"
        alt="BELLYSWISS WARZONE"
        width={400}
        height={200}
        className="w-full h-auto object-contain"
        priority
      />
    </div>
  )
}
