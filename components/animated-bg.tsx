'use client'

import { motion } from 'framer-motion'

export function AnimatedBg() {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-[#0A0A0A] pointer-events-none">
      {/* Glowing Orange/Coral blob 1 */}
      <motion.div
        animate={{
          x: [0, 100, -60, 0],
          y: [0, -80, 50, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -top-40 -left-40 w-[55rem] h-[55rem] rounded-full bg-gradient-to-br from-[#FF5A5F]/20 to-[#FF385C]/5 blur-[140px]"
      />

      {/* Glowing Golden Amber blob 2 */}
      <motion.div
        animate={{
          x: [0, -80, 100, 0],
          y: [0, 50, -80, 0],
          scale: [1, 0.85, 1.15, 1],
        }}
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -bottom-60 -right-60 w-[60rem] h-[60rem] rounded-full bg-gradient-to-br from-[#FFB400]/15 to-[#FF385C]/5 blur-[150px]"
      />

      {/* Grid Pattern Overlay for clean structure */}
      <div 
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(circle, #FFF 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
    </div>
  )
}
