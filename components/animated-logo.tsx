"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

interface AnimatedLogoProps {
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
}

export function AnimatedLogo({ className, size = "md" }: AnimatedLogoProps) {
  const sizeClasses = {
    sm: "w-40",
    md: "w-56",
    lg: "w-72",
    xl: "w-80",
  }

  return (
    <div className={cn("relative select-none", sizeClasses[size], className)}>
      {/* Subtle glow behind logo */}
      <div 
        className="absolute inset-0 z-0 opacity-15 blur-2xl pointer-events-none scale-110"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 60%, rgba(180, 190, 210, 0.4) 0%, transparent 70%)'
        }}
      />

      {/* Metallic shine overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-20 rounded-sm">
        <div 
          className="absolute inset-0 animate-logo-shine-sweep"
          style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 55%, transparent 60%)',
            backgroundSize: '200% 100%',
          }}
        />
      </div>

      {/* Main logo image */}
      <Image
        src="/logo-transparent.png"
        alt="BELLYSWISS WARZONE"
        width={400}
        height={200}
        className={cn(
          "w-full h-auto object-contain relative z-10",
          "animate-logo-breathe"
        )}
        priority
      />
    </div>
  )
}
