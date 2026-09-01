import { useEffect, useRef } from 'react'

const BAR_COUNT = 48

/**
 * Live frequency bars drawn from the playing audio element.
 *
 * Draws to a canvas rather than animating DOM nodes: 48 bars as elements
 * would mean 48 style recalcs per frame, which the K10 would feel. The
 * loop only runs while audio is playing and is cancelled on pause, so a
 * kiosk sitting idle costs nothing.
 *
 * The AnalyserNode is created once and reused - a MediaElementSource can
 * only be attached to an element once per AudioContext, so re-creating it
 * on every play would throw.
 */
export default function AudioVisualizer({ audioRef, isPlaying, className = '' }) {
  const canvasRef = useRef(null)
  const analyserRef = useRef(null)
  const frameRef = useRef(0)

  useEffect(() => {
    const audioEl = audioRef.current
    const canvas = canvasRef.current
    if (!audioEl || !canvas || !isPlaying) return undefined

    // Lazily build the graph on first play: browsers only allow an
    // AudioContext to start after a user gesture.
    if (!analyserRef.current) {
      const AudioContextCtor = window.AudioContext || window.webkitAudioContext
      if (!AudioContextCtor) return undefined

      const context = new AudioContextCtor()
      const analyser = context.createAnalyser()
      analyser.fftSize = 1024
      analyser.smoothingTimeConstant = 0.8
      context.createMediaElementSource(audioEl).connect(analyser)
      analyser.connect(context.destination)
      analyserRef.current = { context, analyser }
    }

    const { context, analyser } = analyserRef.current
    if (context.state === 'suspended') context.resume()

    const ctx = canvas.getContext('2d')
    const data = new Uint8Array(analyser.frequencyBinCount)

    // Audio energy is concentrated in the lowest bins, so sampling them
    // linearly makes every bar past the first few sit at zero. Mapping the
    // bars across the spectrum logarithmically (as the ear hears it) and
    // averaging each band gives a row that actually moves end to end.
    const bands = Array.from({ length: BAR_COUNT }, (_, i) => {
      const scale = (n) => Math.pow(data.length, n / BAR_COUNT)
      return [
        Math.floor(scale(i)),
        Math.max(Math.floor(scale(i)) + 1, Math.floor(scale(i + 1))),
      ]
    })

    const draw = () => {
      frameRef.current = requestAnimationFrame(draw)

      const { width, height } = canvas
      analyser.getByteFrequencyData(data)
      ctx.clearRect(0, 0, width, height)

      const gap = width / BAR_COUNT / 4
      const barWidth = (width - gap * (BAR_COUNT - 1)) / BAR_COUNT

      for (let i = 0; i < BAR_COUNT; i += 1) {
        const [start, end] = bands[i]
        let sum = 0
        for (let bin = start; bin < end; bin += 1) sum += data[bin]
        // Higher bands are quieter by nature; tilt the gain upward so the
        // treble end stays visible instead of flatlining.
        const gain = 1 + (i / BAR_COUNT) * 1.6
        const value = Math.min(1, (sum / (end - start) / 255) * gain)
        const barHeight = Math.max(barWidth * 0.6, value * height)
        const x = i * (barWidth + gap)
        const y = (height - barHeight) / 2

        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight)
        gradient.addColorStop(0, '#4f9bff')
        gradient.addColorStop(1, '#184890')
        ctx.fillStyle = gradient

        ctx.beginPath()
        ctx.roundRect(x, y, barWidth, barHeight, barWidth / 2)
        ctx.fill()
      }
    }

    draw()
    return () => cancelAnimationFrame(frameRef.current)
  }, [audioRef, isPlaying])

  return (
    <canvas
      ref={canvasRef}
      width={720}
      height={180}
      aria-hidden="true"
      className={`h-full w-full ${className}`}
    />
  )
}
