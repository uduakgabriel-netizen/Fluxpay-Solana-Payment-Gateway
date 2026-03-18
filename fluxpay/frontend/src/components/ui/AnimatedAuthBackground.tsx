import { motion } from 'framer-motion'

/**
 * Premium animated Web3 background for auth pages.
 * Uses CSS-animated mesh gradients + floating particles.
 * Lightweight — no external libraries needed.
 */
export default function AnimatedAuthBackground() {
  return (
    <div className="auth-bg-root">
      {/* Base gradient that shifts colors */}
      <div className="auth-bg-gradient" />

      {/* Mesh blobs — soft, floating, blurred orbs */}
      <motion.div
        className="auth-blob auth-blob-1"
        animate={{
          x: [0, 60, -40, 0],
          y: [0, -50, 30, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="auth-blob auth-blob-2"
        animate={{
          x: [0, -70, 50, 0],
          y: [0, 40, -60, 0],
          scale: [1, 0.9, 1.2, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="auth-blob auth-blob-3"
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -30, 50, 0],
          scale: [1, 1.1, 0.85, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="auth-blob auth-blob-4"
        animate={{
          x: [0, -50, 60, 0],
          y: [0, 60, -40, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating particles (tiny glowing dots) */}
      {[...Array(18)].map((_, i) => (
        <motion.div
          key={i}
          className="auth-particle"
          style={{
            left: `${8 + Math.random() * 84}%`,
            top: `${8 + Math.random() * 84}%`,
            width: `${2 + Math.random() * 3}px`,
            height: `${2 + Math.random() * 3}px`,
          }}
          animate={{
            y: [0, -30 - Math.random() * 40, 0],
            x: [0, (Math.random() - 0.5) * 50, 0],
            opacity: [0.15, 0.6, 0.15],
          }}
          transition={{
            duration: 6 + Math.random() * 8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: Math.random() * 5,
          }}
        />
      ))}

      {/* Grid overlay for subtle tech feel */}
      <div className="auth-grid-overlay" />

      {/* Glow line at top */}
      <div className="auth-glow-line" />
    </div>
  )
}
