'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { MapPin } from "@phosphor-icons/react"

export function ChaletHero() {
  const router = useRouter()
  const [isAnimated, setIsAnimated] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 150)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('/hero.jpg')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />
      </div>

      {/* Content - Left Aligned */}
      <div className="relative z-10 container mx-auto px-4 pt-32 md:pt-40 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isAnimated ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-5xl"
        >
          {/* Main Heading */}
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-normal text-white mb-6 leading-tight">
            Welcome to Union Awaas Bank Holiday Home
          </h1>

          {/* Subtitle */}
          <p className="text-tan text-base md:text-lg font-medium tracking-wide mb-12">
            An exclusive and comfortable stay for members of UBEA, AIBEA, and their families.
          </p>

          {/* Book Now Button */}
          {/* Book Now Button and Map Link */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/booking')}
              className="inline-flex items-center px-10 py-4 bg-white text-brown-dark rounded-xl font-semibold hover:bg-tan transition-all duration-300 shadow-lg text-base md:text-lg"
            >
              Book Your Stay
            </button>

            <a
              href="https://maps.app.goo.gl/WuqijiHpwnQmsiBX7"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center p-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-xl hover:bg-white/20 transition-all duration-300 shadow-lg group"
              aria-label="View Location Map"
            >
              <MapPin size={28} weight="fill" className="group-hover:scale-110 transition-transform" />
            </a>
          </div>
        </motion.div>
      </div>

      {/* Decorative Dots Pattern */}
      <svg className="absolute bottom-10 left-10 opacity-30" width="100" height="100">
        <circle cx="10" cy="10" r="3" fill="#DDC9B5" />
        <circle cx="30" cy="10" r="3" fill="#DDC9B5" />
        <circle cx="50" cy="10" r="3" fill="#DDC9B5" />
        <circle cx="10" cy="30" r="3" fill="#DDC9B5" />
        <circle cx="30" cy="30" r="3" fill="#DDC9B5" />
        <circle cx="50" cy="30" r="3" fill="#DDC9B5" />
      </svg>
    </section>
  )
}
