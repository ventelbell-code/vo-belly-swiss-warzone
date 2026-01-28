"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface TypewriterProps {
  text: string
  className?: string
  delay?: number
  speed?: number
  onComplete?: () => void
}

export function Typewriter({ 
  text, 
  className, 
  delay = 0, 
  speed = 60,
  onComplete 
}: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setHasStarted(true)
    }, delay)

    return () => clearTimeout(startTimer)
  }, [delay])

  useEffect(() => {
    if (!hasStarted) return
    
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, speed)

      return () => clearTimeout(timer)
    } else if (currentIndex === text.length && onComplete) {
      onComplete()
    }
  }, [currentIndex, hasStarted, text, speed, onComplete])

  return (
    <span className={cn("", className)}>
      {displayedText}
      {hasStarted && currentIndex < text.length && (
        <span className="inline-block w-[2px] h-[1em] bg-current/40 ml-[2px] align-middle animate-cursor-blink" />
      )}
    </span>
  )
}
