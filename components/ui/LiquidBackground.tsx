'use client'

import { motion } from 'framer-motion'

export function LiquidBackground() {
  return (
    <div className="liquid-bg-wrapper">
      <motion.div 
        className="liquid-blob-1"
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="liquid-blob-2"
        animate={{
          x: [0, -20, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  )
}
