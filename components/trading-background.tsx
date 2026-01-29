"use client"

import { useEffect, useRef } from "react"

interface Candle {
  x: number
  y: number
  width: number
  height: number
  isGreen: boolean
  speed: number
  opacity: number
}

interface FlowLine {
  points: { x: number; y: number }[]
  progress: number
  speed: number
  opacity: number
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  life: number
}

interface AlgoNode {
  x: number
  y: number
  targetX: number
  targetY: number
  connections: number[]
  pulsePhase: number
  size: number
}

interface DataStream {
  x: number
  y: number
  chars: string[]
  charIndex: number
  speed: number
  opacity: number
  fadeIn: number
}

interface SineWave {
  offsetY: number
  amplitude: number
  frequency: number
  phase: number
  speed: number
  opacity: number
}

export function TradingBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number
    let candles: Candle[] = []
    let flowLines: FlowLine[] = []
    let particles: Particle[] = []
    let algoNodes: AlgoNode[] = []
    let dataStreams: DataStream[] = []
    let sineWaves: SineWave[] = []
    let time = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initElements()
    }

    const initElements = () => {
      // Initialize candles
      candles = []
      const candleCount = Math.floor(canvas.width / 120)
      for (let i = 0; i < candleCount; i++) {
        candles.push(createCandle(i * 120 + Math.random() * 60))
      }

      // Initialize flow lines
      flowLines = []
      for (let i = 0; i < 3; i++) {
        flowLines.push(createFlowLine())
      }

      // Initialize particles
      particles = []
      for (let i = 0; i < 20; i++) {
        particles.push(createParticle())
      }

      // Initialize algorithm nodes (network graph)
      algoNodes = []
      const nodeCount = Math.floor((canvas.width * canvas.height) / 80000)
      for (let i = 0; i < Math.min(nodeCount, 12); i++) {
        algoNodes.push(createAlgoNode(i))
      }
      // Create connections between nearby nodes
      algoNodes.forEach((node, i) => {
        algoNodes.forEach((other, j) => {
          if (i !== j) {
            const dist = Math.hypot(node.x - other.x, node.y - other.y)
            if (dist < 250 && node.connections.length < 3) {
              node.connections.push(j)
            }
          }
        })
      })

      // Initialize data streams
      dataStreams = []
      for (let i = 0; i < 4; i++) {
        dataStreams.push(createDataStream())
      }

      // Initialize sine waves
      sineWaves = []
      for (let i = 0; i < 2; i++) {
        sineWaves.push(createSineWave(i))
      }
    }

    const createCandle = (x: number): Candle => ({
      x,
      y: canvas.height * (0.3 + Math.random() * 0.4),
      width: 4 + Math.random() * 3,
      height: 40 + Math.random() * 80,
      isGreen: Math.random() > 0.5,
      speed: 0.12 + Math.random() * 0.08,
      opacity: 0.04 + Math.random() * 0.03,
    })

    const createFlowLine = (): FlowLine => {
      const points: { x: number; y: number }[] = []
      const startY = canvas.height * (0.2 + Math.random() * 0.6)
      let currentY = startY
      
      for (let x = -100; x <= canvas.width + 100; x += 40) {
        currentY += (Math.random() - 0.5) * 30
        currentY = Math.max(canvas.height * 0.15, Math.min(canvas.height * 0.85, currentY))
        points.push({ x, y: currentY })
      }
      
      return {
        points,
        progress: 0,
        speed: 0.001 + Math.random() * 0.0005,
        opacity: 0.06 + Math.random() * 0.04,
      }
    }

    const createParticle = (): Particle => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.2,
      size: 1.5 + Math.random() * 2,
      opacity: 0.05 + Math.random() * 0.05,
      life: Math.random(),
    })

    const createAlgoNode = (id: number): AlgoNode => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      targetX: Math.random() * canvas.width,
      targetY: Math.random() * canvas.height,
      connections: [],
      pulsePhase: Math.random() * Math.PI * 2,
      size: 5 + Math.random() * 10,
    })

    const createDataStream = (): DataStream => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      chars: Array.from("0123456789ABCDEF").sort(() => Math.random() - 0.5),
      charIndex: 0,
      speed: 0.08 + Math.random() * 0.04,
      opacity: 0.06 + Math.random() * 0.04,
      fadeIn: 1,
    })

    const createSineWave = (id: number): SineWave => ({
      offsetY: canvas.height * (0.25 + id * 0.5),
      amplitude: 25 + Math.random() * 40,
      frequency: 0.008 + Math.random() * 0.004,
      phase: Math.random() * Math.PI * 2,
      speed: 0.002 + Math.random() * 0.001,
      opacity: 0.08 + Math.random() * 0.04,
    })

    const drawCandle = (candle: Candle) => {
      const color = candle.isGreen 
        ? `rgba(80, 160, 120, ${candle.opacity})`
        : `rgba(160, 80, 80, ${candle.opacity})`
      
      // Wick
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(candle.x + candle.width / 2, candle.y - candle.height * 0.3)
      ctx.lineTo(candle.x + candle.width / 2, candle.y + candle.height + candle.height * 0.3)
      ctx.stroke()
      
      // Body
      ctx.fillStyle = color
      ctx.fillRect(candle.x, candle.y, candle.width, candle.height)
    }

    const drawFlowLine = (line: FlowLine) => {
      if (line.points.length < 2) return
      
      ctx.strokeStyle = `rgba(100, 130, 180, ${line.opacity})`
      ctx.lineWidth = 1
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      
      // Draw partial line based on progress
      const totalLength = line.points.length - 1
      const drawLength = Math.floor(totalLength * line.progress)
      
      ctx.beginPath()
      ctx.moveTo(line.points[0].x, line.points[0].y)
      
      for (let i = 1; i <= drawLength && i < line.points.length; i++) {
        const prev = line.points[i - 1]
        const curr = line.points[i]
        const next = line.points[i + 1] || curr
        
        // Smooth curve
        const cpx = curr.x
        const cpy = curr.y
        ctx.quadraticCurveTo(prev.x + (curr.x - prev.x) * 0.5, prev.y + (curr.y - prev.y) * 0.5, cpx, cpy)
      }
      
      ctx.stroke()
    }

    const drawParticle = (particle: Particle) => {
      ctx.fillStyle = `rgba(140, 160, 190, ${particle.opacity * particle.life})`
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fill()
    }

    const drawAlgoNodes = () => {
      // Draw connections first (behind nodes)
      algoNodes.forEach((node, i) => {
        node.connections.forEach((j) => {
          const other = algoNodes[j]
          if (!other) return
          
          const pulse = Math.sin(time * 0.5 + node.pulsePhase) * 0.5 + 0.5
          const opacity = 0.04 + pulse * 0.03
          
          ctx.strokeStyle = `rgba(100, 140, 200, ${opacity})`
          ctx.lineWidth = 0.8
          ctx.beginPath()
          ctx.moveTo(node.x, node.y)
          ctx.lineTo(other.x, other.y)
          ctx.stroke()
        })
      })

      // Draw nodes
      algoNodes.forEach((node) => {
        const pulse = Math.sin(time * 0.8 + node.pulsePhase) * 0.5 + 0.5
        const opacity = 0.05 + pulse * 0.04
        const size = 2 + pulse * 0.8
        
        // Outer glow
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, size * 3)
        gradient.addColorStop(0, `rgba(120, 160, 220, ${opacity})`)
        gradient.addColorStop(1, "transparent")
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(node.x, node.y, size * 3, 0, Math.PI * 2)
        ctx.fill()
        
        // Core
        ctx.fillStyle = `rgba(180, 200, 240, ${opacity * 1.5})`
        ctx.beginPath()
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    const drawDataStreams = () => {
      ctx.font = "10px monospace"
      dataStreams.forEach((stream) => {
        const char = stream.chars[stream.charIndex % stream.chars.length]
        ctx.fillStyle = `rgba(100, 150, 200, ${stream.opacity * stream.fadeIn})`
        ctx.fillText(char, stream.x, stream.y)
      })
    }

    const drawSineWaves = () => {
      sineWaves.forEach((wave) => {
        ctx.strokeStyle = `rgba(80, 120, 180, ${wave.opacity})`
        ctx.lineWidth = 0.5
        ctx.beginPath()
        
        for (let x = 0; x < canvas.width; x += 3) {
          const y = wave.offsetY + Math.sin(x * wave.frequency + wave.phase) * wave.amplitude
          if (x === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.stroke()
      })
    }

    const update = () => {
      time += 0.016
      // Update candles (slow upward drift)
      candles.forEach((candle) => {
        candle.y -= candle.speed
        if (candle.y + candle.height < 0) {
          candle.y = canvas.height + candle.height
          candle.x = Math.random() * canvas.width
          candle.isGreen = Math.random() > 0.5
        }
      })

      // Update flow lines
      flowLines.forEach((line) => {
        line.progress += line.speed
        if (line.progress >= 1) {
          line.progress = 0
          // Regenerate points
          const startY = canvas.height * (0.2 + Math.random() * 0.6)
          let currentY = startY
          line.points = []
          for (let x = -100; x <= canvas.width + 100; x += 40) {
            currentY += (Math.random() - 0.5) * 30
            currentY = Math.max(canvas.height * 0.15, Math.min(canvas.height * 0.85, currentY))
            line.points.push({ x, y: currentY })
          }
        }
      })

      // Update particles
      particles.forEach((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.life -= 0.001
        
        if (particle.life <= 0 || particle.x < 0 || particle.x > canvas.width || particle.y < 0 || particle.y > canvas.height) {
          particle.x = Math.random() * canvas.width
          particle.y = Math.random() * canvas.height
          particle.life = 1
        }
      })

      // Update algo nodes (very slow drift)
      algoNodes.forEach((node) => {
        const dx = node.targetX - node.x
        const dy = node.targetY - node.y
        node.x += dx * 0.001
        node.y += dy * 0.001
        
        if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
          node.targetX = Math.random() * canvas.width
          node.targetY = Math.random() * canvas.height
        }
      })

      // Update data streams
      dataStreams.forEach((stream) => {
        stream.fadeIn = Math.min(1, stream.fadeIn + 0.02)
        if (Math.random() < stream.speed) {
          stream.charIndex++
          if (stream.charIndex > 50) {
            stream.fadeIn = 0
            stream.charIndex = 0
            stream.x = Math.random() * canvas.width
            stream.y = Math.random() * canvas.height
          }
        }
      })

      // Update sine waves
      sineWaves.forEach((wave) => {
        wave.phase += wave.speed
      })
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw elements in order (back to front)
      drawSineWaves()
      candles.forEach(drawCandle)
      flowLines.forEach(drawFlowLine)
      drawAlgoNodes()
      particles.forEach(drawParticle)
      drawDataStreams()
    }

    const animate = () => {
      update()
      render()
      animationId = requestAnimationFrame(animate)
    }

    resize()
    window.addEventListener("resize", resize)
    animate()

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-[1]"
      style={{ opacity: 1 }}
    />
  )
}
